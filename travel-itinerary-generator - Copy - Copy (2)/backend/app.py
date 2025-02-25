import sys
import os

# Add the project root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from flask import Flask, render_template, request, jsonify
import google.generativeai as genai
from prompts import generate_itinerary_prompt, format_itinerary_response  # Import the functions
import logging

app = Flask(__name__)

# Set up logging
logging.basicConfig(level=logging.INFO)

# Load Gemini API key from environment variable
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyADjl6gsPU-BUuQcUc9YrHDBpkpvhLOukE")  # Fallback to hardcoded key if not set
genai.configure(api_key=GEMINI_API_KEY)

# Load the Gemini model
model = genai.GenerativeModel("gemini-pro")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/generate-itinerary', methods=['POST'])
def generate_itinerary():
    data = request.json

    # Validate required fields
    required_fields = ["destination", "budget", "duration", "purpose", "preferences"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"error": f"Missing or invalid field: {field}"}), 400

    destination = data.get("destination")
    budget = data.get("budget")
    duration = data.get("duration")
    purpose = data.get("purpose")
    preferences = data.get("preferences")  # This is now a list

    # Generate the prompt using the function from prompts.py
    prompt = generate_itinerary_prompt(destination, budget, duration, purpose, preferences)
    logging.info(f"Generated prompt: {prompt}")

    try:
        # Get the response from the Gemini API
        response = model.generate_content(prompt)
        itinerary_text = response.text if response else "No response from AI."
        logging.info(f"Received response from Gemini API: {itinerary_text}")

        # Format the itinerary using the function from prompts.py
        formatted_itinerary = format_itinerary_response(itinerary_text)
    except Exception as e:
        logging.error(f"Error generating itinerary: {str(e)}")
        formatted_itinerary = f"<p>Error generating itinerary: {str(e)}</p>"

    return jsonify({"itinerary": formatted_itinerary})

if __name__ == '__main__':
    app.run(debug=True)