from flask import Flask, render_template, request, jsonify
import textwrap
import numpy as np
import pandas as pd
import google.generativeai as genai
from sklearn.metrics.pairwise import cosine_similarity
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configuring API
api_key = os.getenv("API_KEY")
if not api_key:
    raise ValueError("API key is not set in environment variables")
genai.configure(api_key=api_key)

# Load Documents from JSON
def load_documents(file_path):
    """Load documents from a JSON file."""
    try:
        with open(file_path, 'r') as file:
            documents = json.load(file)
        return documents
    except FileNotFoundError:
        raise FileNotFoundError(f"The file {file_path} does not exist")
    except json.JSONDecodeError:
        raise ValueError(f"The file {file_path} is not a valid JSON file")

# Data Indexing
def chunk_document(content, chunk_size=500):
    """Break down large documents into smaller chunks for better indexing and retrieval."""
    words = content.split()
    chunks = [' '.join(words[i:i + chunk_size]) for i in range(0, len(words), chunk_size)]
    return chunks

# Embedding Techniques
def embed_content(title, content, model='models/text-embedding-004'):
    """Embed content using a fine-tuned model for better semantic understanding."""
    try:
        return genai.embed_content(model=model, content=content, task_type='retrieval_document', title=title)['embedding']
    except Exception as e:
        raise RuntimeError(f"Error embedding content: {e}")

# Retrieval Algorithms
def find_best_score(query, dataframe, model='models/text-embedding-004'):
    """Compute the distances between the query and each document using cosine similarity for more accurate retrieval."""
    try:
        query_embedding = genai.embed_content(model=model, content=query, task_type="retrieval_query")['embedding']
        similarities = cosine_similarity(np.stack(dataframe['Embeddings']), [query_embedding])
        index = np.argmax(similarities)
        return dataframe.iloc[index]['Content']
    except Exception as e:
        raise RuntimeError(f"Error finding best score: {e}")

# Contextual Understanding
def make_prompt(query, relevant_passage):
    """Generate a prompt for the generative model to ensure comprehensive and user-friendly responses."""
    escaped = relevant_passage.replace("'", "").replace('"', "").replace("\n", " ")
    prompt = textwrap.dedent("""You are a helpful and informative bot that answers questions using text from the reference passage included below. \
    Be sure to respond in a complete sentence, being comprehensive, including all relevant background information. \
    However, you are talking to a non-technical audience, so be sure to break down complicated concepts and \
    strike a friendly and conversational tone. \
    If the passage is irrelevant to the answer, tell that the answer is not in documents and just keep it the answer very brief.
    QUESTION: '{query}'
    PASSAGE: '{relevant_passage}'

    ANSWER:
    """).format(query=query, relevant_passage=escaped)
    return prompt

# Load and Prepare Documents
try:
    DOCUMENTS = load_documents('documents.json')
    chunked_documents = []
    for doc in DOCUMENTS:
        chunks = chunk_document(doc['content'])
        for chunk in chunks:
            chunked_documents.append({"title": doc['title'], "content": chunk})

    # Embed Documents
    df = pd.DataFrame(chunked_documents)
    df.columns = ['Title', 'Content']
    df['Embeddings'] = df.apply(lambda x: embed_content(x['Title'], x['Content']), axis=1)
except Exception as e:
    raise RuntimeError(f"Error loading and preparing documents: {e}")

@app.route('/')
def index():
    """Render the main HTML page."""
    return render_template('index.html')

@app.route('/query', methods=['POST'])
def query():
    """Handle POST requests to process user queries and return responses."""
    try:
        user_query = request.form['query']
        response = find_best_score(user_query, df)
        prompt = make_prompt(user_query, response)
        model = genai.GenerativeModel('gemini-1.5-pro-latest')
        answer = model.generate_content(prompt)
        return jsonify(answer=answer.text)
    except Exception as e:
        return jsonify(error=str(e)), 500

if __name__ == '__main__':
    app.run(debug=True)
