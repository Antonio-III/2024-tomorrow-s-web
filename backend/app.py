from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.genai as genai
from dotenv import load_dotenv

INSTRUCTION = """
You are a coding assistant. Help the user with their request if it is in relation to coding or programming. Do provide an explanation for how the code works. 

If the user queries something unrelated to coding, introduce yourself as a coding assistant and that you are willing to help on coding or programming questions.

Below are the user's code (if any), and their query.
"""

TRIPLE_DASH = "\n---\n"

DEFAULT_MODEL = "gemini-2.0-flash"

HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 5000))

# Process a .env file and loads all the environment variables found.
load_dotenv()


# Set up something.
app = Flask(__name__) # Argument can be "backend" (parent folder name) or __name__.split(".")[0].

CORS(app)

# Set up the Gemini client by setting up the API key.
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@app.route("/ask", methods=["POST"])
def ask(model: str = DEFAULT_MODEL):
    data = request.get_json()
    code = data.get("code", "")
    question = data.get("question", "")
    if not question:
        return jsonify({"error": "Missing question"}), 400
    
    try:
        full_prompt = INSTRUCTION + TRIPLE_DASH + code + TRIPLE_DASH + question

        response = client.models.generate_content(
            model=model,
            contents=full_prompt
        )
        return jsonify({"answer": response.text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
if __name__ == "__main__":
    app.run(host=HOST, port=PORT)