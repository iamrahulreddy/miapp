## Mission: Impossible RAG Application

Welcome to the Mission: Impossible RAG (Retrieval-Augmented Generation) Application! This project is a labor of love, inspired by my deep admiration for the Mission: Impossible film franchise. Whether you're a die-hard fan or just curious about the intricate world of espionage, this application is designed to provide you with insightful and engaging information about the characters and plots from the Mission: Impossible universe.

### Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

### Introduction

The Mission: Impossible RAG Application is a web-based tool that allows users to ask questions about the Mission: Impossible film franchise and receive detailed, contextually relevant answers. By combining retrieval-based methods with generative AI, the application ensures that responses are both accurate and engaging.

### Features

- **Document Retrieval**: The application loads and processes documents related to the Mission: Impossible franchise, breaking them down into manageable chunks for efficient retrieval.
- **Semantic Embedding**: Utilizes advanced embedding techniques to understand the semantic meaning of both the documents and user queries.
- **Generative Responses**: Generates comprehensive and user-friendly responses based on the retrieved information, ensuring a conversational tone.
- **User-Friendly Interface**: A sleek and intuitive interface that makes it easy for users to input their queries and receive answers.
- **Self-Destructing Messages**: A fun countdown timer that adds a touch of espionage flair, simulating the self-destructing messages from the films.

### Technology Stack

- **Backend**: Flask
- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript (jQuery)
- **Embedding and Generation**: Google Generative AI
- **Data Handling**: Pandas, NumPy
- **Similarity Measurement**: Scikit-learn (Cosine Similarity)

### Installation

To set up the Mission: Impossible RAG Application on your local machine, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/iamrahulreddy/mission-impossible-rag.git
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your Google Generative AI API key:
   ```
   API_KEY=your_api_key_here
   ```
   You can get your Gemini API key [here](https://ai.google.dev/gemini-api/docs/api-key).

4. **Run the Application**:
   ```bash
   python app.py
   ```

5. **Access the Application**:
   Open your browser and navigate to `http://127.0.0.1:5000/`.

### Note 📝

I have only used Mission: Impossible film data for embedding and retrieving content, so this terminal only contains data specifically from Mission: Impossible films. Inquiries outside this scope cannot be answered.

### Usage

1. **Enter Your Query**: Type your question about the *Mission: Impossible* franchise in the input box.
2. **Submit**: Click the "Execute Mission Protocol" button to submit your query.
3. **Receive Response**: Wait for the application to process your query and display the response. You can adjust the self-destruct timer (in seconds) for the response in `template/index.html`. Once the countdown finishes, the message will be destroyed. If you want to see the message again, you will need to submit a new query. Since LLMs (Large Language Models) are probabilistic, you may receive a slightly different but still relevant response.

### Screenshots



<img src="screenshots/screenshot%20-%201.jpeg" alt="Screenshot 1" style="display: block; margin: 0 auto;">
<div style="text-align: center; padding-bottom: 15px;">
    Try asking about the character - who is Benji?
</div>



<img src="screenshots/screenshot%20-%202.jpeg" alt="Screenshot 2" style="display: block; margin: 0 auto;">
<div style="text-align: center; padding-bottom: 15px; padding-top: 15px;">
    If you want to know more about specific film in the franchise - like fallout here.
</div>



<img src="screenshots/screenshot%20-%203.jpeg" alt="Screenshot 3" style="display: block; margin: 0 auto;">
<div style="text-align: center; padding-bottom: 15px; padding-top: 15px;">
    Asking a fact related to Tom Cruise
</div>


### Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request. 

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Thank you for checking out the Mission: Impossible RAG Application! I hope you enjoy exploring the world of Ethan Hunt and his team as much as I enjoyed creating this project. 🕵️‍♂️🎬





