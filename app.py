from flask import Flask, render_template, request, jsonify, send_from_directory
import textwrap
import numpy as np
import pandas as pd
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
import datetime
import uuid
from dotenv import load_dotenv
import logging
import pathlib
from datetime import timezone, timedelta

# Load environment variables
load_dotenv()

app = Flask(__name__, template_folder='templates', static_folder='templates/static')

# Configuring API
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("API key is not set in environment variables")
genai.configure(api_key=api_key)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create logs directory if it doesn't exist
logs_dir = pathlib.Path("logs")
logs_dir.mkdir(exist_ok=True)
interactions_file = logs_dir / "interactions.json"

# Initialize interactions log file if it doesn't exist
if not interactions_file.exists():
    try:
        with open(interactions_file, "w") as f:
            json.dump([], f)
        logger.info(f"Created interactions log file at: {interactions_file}")
    except IOError as e:
        logger.error(f"Failed to initialize interactions log file {interactions_file}: {e}")

# Load Documents from JSON
def load_documents(file_path):
    """Load documents from a JSON file with error handling."""
    try:
        with open(file_path, 'r') as file:
            documents = json.load(file)
        return documents
    except FileNotFoundError:
        raise FileNotFoundError(f"The file {file_path} does not exist")
    except json.JSONDecodeError as e:
        raise ValueError(f"The file {file_path} is not a valid JSON file: {e}")
    except IOError as e:
        raise IOError(f"Error reading file {file_path}: {e}")

# Break down documents into smaller chunks
def chunk_document(content, chunk_size=500):
    """Break down large documents into smaller chunks for better search results."""
    words = content.split()
    chunks = [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    return chunks

# Create embeddings for content
def embed_content(title, content, model='models/text-embedding-004'):
    """Turn content into AI-friendly format."""
    try:
        return genai.embed_content(model=model, content=content, task_type='retrieval_document', title=title)['embedding']
    except Exception as e:
        raise RuntimeError(f"Error embedding content: {e}")

# Find the most relevant information
def find_best_score(query, dataframe, model='models/text-embedding-004'):
    """Find the most relevant info for the user's question."""
    try:
        query_embedding = genai.embed_content(model=model, content=query, task_type="retrieval_query")['embedding']
        similarities = cosine_similarity(np.stack(dataframe['Embeddings']), [query_embedding])

        # Return top 3 most relevant passages for more context
        indices = np.argsort(similarities.flatten())[-3:][::-1]
        top_passages = dataframe.iloc[indices]['Content'].tolist()

        # Combine the top passages into a single context
        return " ".join(top_passages)
    except Exception as e:
        raise RuntimeError(f"Error finding best score: {e}")

# Create the chatbot personality
def make_prompt(query, relevant_passage):
    """Create Agent Cipher's personality and response style."""
    escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
    prompt = textwrap.dedent("""
    You are Agent Cipher, a friendly and enthusiastic Mission Impossible fan with a flair for spy lingo and dad jokes.

    YOUR MISSION (which you've already accepted because, let's be honest, it sounds like fun):
    - Chat about all things Mission Impossible like you're talking to a friend at a movie night
    - Be conversational and easy to understand - no technical jargon unless asked
    - Only share information from what you know (the reference material)
    - If you don't know something, admit it with a spy-themed quip like "That intel is not available" or "My sources haven't briefed me on that yet"
    - Throw in the occasional spy joke or pun - nothing too cheesy, but enough to get a smile

    PERSONALITY TRAITS:
    - You're casually knowledgeable, not encyclopedic - talk like a fan, not a database
    - You get excited about the big stunts Tom Cruise performs himself
    - You occasionally use spy metaphors for everyday things
    - You're chatty but focused - keep responses friendly but concise
    - When comparing movies or characters, you have opinions but aren't pushy
    - For new fans, you're welcoming and never condescending

    QUESTION: '{query}'

    REFERENCE INFORMATION: '{relevant_passage}'

    This message won't self-destruct because we're friends here, but let's keep it between us anyway.

    RESPONSE:
    """).format(query=query, relevant_passage=escaped)
    return prompt

# Log user questions and answers with IST
def log_interaction(ip_address, query, response):
    """Keep track of conversations for improvement with IST timestamp."""
    try:
        # Get current time in IST (UTC+5:30)
        ist = timezone(timedelta(hours=5, minutes=30))
        timestamp_utc = datetime.datetime.now(timezone.utc)
        timestamp_ist = timestamp_utc.astimezone(ist)
        ist_date_time = timestamp_ist.strftime("%d:%m:%y %H:%M:%S")
        timestamp = timestamp_utc.isoformat()
        interaction_id = str(uuid.uuid4())

        log_entry = {
            "id": interaction_id,
            "timestamp_utc": timestamp,
            "date_time_ist": ist_date_time,
            "ip_address": ip_address,
            "query": query,
            "response": response
        }

        try:
            # Read existing logs safely
            if interactions_file.exists() and os.path.getsize(interactions_file) > 0:
                with open(interactions_file, "r") as log_file:
                    try:
                        logs = json.load(log_file)
                    except json.JSONDecodeError:
                        logger.warning(f"interactions.json is corrupted. Starting fresh with new log entry.")
                        logs = []
            else:
                logs = []

            # Add new conversation
            logs.append(log_entry)

            # Save updated logs
            with open(interactions_file, "w") as log_file:
                json.dump(logs, log_file, indent=2)
            logger.debug(f"Conversation logged with ID: {interaction_id}")

            return interaction_id

        except (IOError, OSError, json.JSONDecodeError) as e:
            logger.error(f"Error saving conversation: {str(e)}")
            return None

    except Exception as e:
        logger.error(f"Unexpected error logging conversation: {str(e)}")
        return None

# Enhanced edge case handling
def check_for_edge_case(query):
    """Check if the question is something we should handle differently."""
    query_lower = query.lower()

    # Request for a joke
    if "joke" in query_lower:
        return True, "Negative. Not a relevant Query"

    # Non-Mission Impossible topics
    non_mi_keywords = ["marvel", "batman", "superman", "star wars", "fast and furious"]
    for keyword in non_mi_keywords:
        if keyword in query_lower:
            return True, f"Whoa there! Looks like you're asking about {keyword.title()}, but between you and me, I’m more of a Mission Impossible specialist. Want to know something about Ethan Hunt’s adventures instead?"

    # Empty or very short queries
    if len(query.strip()) < 3:
        return True, "I need a bit more to go on here, friend! My spy senses can’t quite figure out what Mission Impossible secrets you’re after. Care to elaborate?"

    return False, ""

# Try to figure out what the user wants
def analyze_intent(query):
    """Figure out if the user wants comparisons, recommendations, facts, or just chat."""
    query_lower = query.lower()

    # Looking for comparisons
    if any(word in query_lower for word in ["compare", "versus", "vs", "better", "favorite"]):
        return "comparison"

    # Looking for recommendations
    if any(word in query_lower for word in ["recommend", "suggest", "should i watch", "best", "start"]):
        return "recommendation"

    # Looking for facts
    if any(word in query_lower for word in ["who", "what", "when", "where", "why", "how"]):
        return "factual"

    # Just chatting
    return "conversational"

# Load and Prepare Documents
try:
    DOCUMENTS = load_documents('documents.json')
    chunked_documents = []
    for doc in DOCUMENTS:
        chunks = chunk_document(doc['content'])
        for chunk in chunks:
            chunked_documents.append({"title": doc['title'], "content": chunk})

    # Create searchable database
    df = pd.DataFrame(chunked_documents)
    df.columns = ['Title', 'Content']
    df['Embeddings'] = df.apply(lambda x: embed_content(x['Title'], x['Content']), axis=1)
except Exception as e:
    logger.critical(f"Oops! Had trouble with our Mission Impossible files: {e}")

@app.route('/')
def index():
    """Show the main page."""
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query():
    """Handle user questions and return Agent Cipher's responses."""
    user_query = "Unknown question"
    user_ip = "Unknown visitor"
    try:
        data = request.get_json()
        user_query = data['query']
        user_ip = request.remote_addr

        # Check for special cases
        is_edge_case, edge_response = check_for_edge_case(user_query)
        if is_edge_case:
            log_interaction(user_ip, user_query, edge_response)
            return jsonify(answer=edge_response)

        # Figure out what they want
        intent = analyze_intent(user_query)

        # Find relevant info
        response_content = find_best_score(user_query, df)

        # Create and get Agent Cipher's response
        prompt = make_prompt(user_query, response_content)
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        answer = model.generate_content(prompt)

        # Make sure we got a good answer
        if not answer.text or len(answer.text.strip()) < 10:
            friendly_fail = "That intel appears to be still classified, I’m afraid. Even with my IMF clearance, I can’t access those files. Want to know something else about Mission Impossible?"
            log_interaction(user_ip, user_query, friendly_fail)
            return jsonify(answer=friendly_fail)

        # Save the conversation
        log_interaction(user_ip, user_query, answer.text)

        return jsonify(answer=answer.text)
    except Exception as e:
        logger.error(f"Problem with the question: {str(e)}")
        friendly_error = "Looks like my communication device is malfunctioning! Even IMF agents have technical difficulties sometimes. Want to try asking your question about Mission Impossible again?"
        log_interaction(user_ip, user_query, f"ERROR: {str(e)} - Response: {friendly_error}")
        return jsonify(answer=friendly_error)

# Serve website files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000) # This is only for development , Make changes in production