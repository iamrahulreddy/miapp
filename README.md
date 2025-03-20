## Mission: Impossible RAG Application

Welcome to the Mission: Impossible RAG (Retrieval-Augmented Generation) Application! This project is a labor of love, inspired by my deep admiration for the *Mission: Impossible* film franchise. Whether you're a die-hard fan or just curious about the intricate world of espionage, this application is designed to provide you with insightful and engaging information about the characters and plots from the *Mission: Impossible* universe.

### **Live Demo**
Check out the live demo of the Mission: Impossible RAG application at [miapp.neuralnets.dev](https://miapp.neuralnets.dev) to experience it in action!

### Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [Deployment](#deployment)
- [License](#license)
- [References](#references)

### Introduction

The Mission: Impossible RAG Application is a web-based tool that allows users to ask questions about the *Mission: Impossible* film franchise and receive detailed, contextually relevant answers. By combining retrieval-based methods with generative AI, the application ensures that responses are both accurate and engaging.

### Features

- **Document Retrieval**: The application loads and processes documents related to the *Mission: Impossible* franchise, breaking them down into manageable chunks for efficient retrieval.
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
   ```bash
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

I have only used *Mission: Impossible* film data for embedding and retrieving content, so this terminal only contains data specifically from **Mission: Impossible** films. Inquiries outside this scope cannot be answered.

### Usage

1. **Enter Your Query**: Type your question about the *Mission: Impossible* franchise in the input box.
2. **Submit**: Click the "Execute Mission Protocol" button to submit your query.
3. **Receive Response**: Wait for the application to process your query and display the response. You can adjust the self-destruct timer (in seconds) for the response in `template/index.html`. Once the countdown finishes, the message will be destroyed. If you want to see the message again, you will need to submit a new query. Since LLMs (Large Language Models) are probabilistic, you may receive a slightly different but still relevant response.

### Screenshots

#### 1. A login screen (Very Basic One - Just For Fun :) for an IMF Intelligence Division
<img src="screenshots/Screenshot - 1.jpeg" alt="Screenshot 1" style="display: block; margin: 0 auto;">

#### 2. Asking a fact related to Tom Cruise
<img src="screenshots/Screenshot - 2.png.jpeg" alt="Screenshot 3" style="display: block; margin: 0 auto;">

#### 3. A question - Who is Benji?
<img src="screenshots/Screenshot - 3.jpeg" alt="Screenshot 2" style="display: block; margin: 0 auto;">

#### 4. If you want to know more about a specific film in the franchise - like Fallout here.
<img src="screenshots/Screenshot - 3.jpeg" alt="Screenshot 2" style="display: block; margin: 0 auto;">

### Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request. 

### Deployment

To deploy **miapp** to a production server, follow these general steps:  

1. **Set up a virtual environment** – Install and configure a virtual environment to manage dependencies efficiently.  
2. **Generate static files** – Collect static files for the `templates/` directory to ensure they are properly served.  
3. **Configure Nginx** – Reference the generated static files in the Nginx configuration to serve them correctly.  

These are high-level steps (Additional Configurations are required.)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/iamrahulreddy/miapp.git
   ```

2. **Install Dependencies**:
   Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory and add your API key and other environment variables:
   ```env
   API_KEY=your_api_key_here
   ```
   
4. **Set Up Gunicorn to Run the Flask Application**:
   Install `gunicorn` if you haven't yet, and run it:
   ```bash
   gunicorn --workers 3 --bind unix:/tmp/yourapp.sock app:app
   ```

5. **Configure Nginx as a Reverse Proxy**:
   Set up Nginx to reverse proxy requests to Gunicorn via the Unix socket.

   - **Create a new Nginx configuration file**:
     ```bash
     sudo nano /etc/nginx/sites-available/your-domain.com
     ```

     Add the following content (replace `your-domain.com` with your actual domain):
     ```nginx
     server {
         listen 80;
         server_name your-domain.com www.your-domain.com;

         location / {
             include proxy_params;
             proxy_pass http://unix:/tmp/yourapp.sock;
         }
     }
     ```

6. **Enable the Nginx Site Configuration**:
   Create a symbolic link from the `sites-available` directory to `sites-enabled`:
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/
   ```

7. **Restart Nginx**:
   Apply the changes by restarting the Nginx service:
   ```bash
   sudo systemctl restart nginx
   ```

8. **Set Up SSL with Certbot (Optional but Recommended)**:
   If you'd like to serve your application over HTTPS, use Certbot to obtain an SSL certificate for your domain:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

   Follow the instructions provided by Certbot to complete the SSL configuration.

9. **Verify the Deployment**:
   After everything is set up, visit your domain (e.g., `http://your-domain.com` or `https://your-domain.com` if you set up SSL) to see the live app.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

### References

-   [Google Generative AI API](https://ai.google.dev/gemini-api/docs/api-key)
-   [Flask](https://flask.palletsprojects.com/)
-   [Gunicorn](https://gunicorn.org/)
-   [Nginx](https://nginx.org/)
-   [Certbot](https://certbot.eff.org/)
-   [Tailwind CSS](https://tailwindcss.com/)
-   [Pandas](https://pandas.pydata.org/)
-   [NumPy](https://numpy.org/)
-   [Scikit-learn](https://scikit-learn.org/)

---

Thank you for checking out the `miapp` I hope you enjoy exploring the world of Ethan Hunt and his team as much as I enjoyed creating this project. 🕵️‍♂️🎬
