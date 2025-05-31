from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.genai as genai
from dotenv import load_dotenv

DEFAULT_MODEL = "gemini-2.0-flash"

INSTRUCTION = f"""
You are a coding assistant. Help the user with their request if it is in relation to programming. Do provide an explanation for how the code works. 

If the user queries something unrelated to coding, respond with this: "Hi! I am JACA! It stands for Just A Coding Assistant.  I am a {DEFAULT_MODEL} model, prompt engineered to assist in programming. Feel free to put your code in the Editor or ask a programming question!"

Below are the user's code (if any), and their query.
"""

TRIPLE_DASH = "\n---\n"



HOST = "0.0.0.0"
PORT = int(os.environ.get("PORT", 5000))

# Process a .env file and loads all the environment variables found.
load_dotenv()


# Set up something.
app = Flask(__name__) # Argument can be "backend" (parent folder name) or __name__.split(".")[0].

CORS(app)

# Set up the Gemini client by setting up the API key. 
# This way of getting the environment variable works locally and on Render.
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