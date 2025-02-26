"""
server.py - Handles the server-side logic for loading the model and evaluating responses.

ML Workflow
1. Loads the model when server.js is started.
2. Implements the /evaluate API:
   - Uses the loaded model to detect semantic similarity.
   - A threshold of 0.6 is set to determine correctness (response is correct if similarity >= 0.6).
   - The API returns not only a boolean (correct/false) but also the similarity score
3. Implements a very naive implementation of total score tracking:
   - Stores correctness results in a global list. The /get_results API retrieves this score data.
   - This approach is temporary and will break when multiple users interact with the system.

   
Scenario Workflow STT:
1. The user clicks the button "upload audio", which triggers the upload_audio API post request to send user response audio data to the backend
2. breaksdown the user response using Open AI Whisper, transcirbes into text
3. sends text transcription back to front end

/get_scenarios
Used to fetch all scenarios dynamically from the database in order to display on scenario selection page

/get_prompt
Used to fetch prompts based on unique scenario_id to display to user and facilitate the simulation
"""



from flask import Flask, jsonify, request, redirect
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql.expression import asc
import os
from dotenv import load_dotenv
from flask_cors import CORS
import whisper
import io
import numpy as np
import librosa
import tempfile
from supabase_client import supabase
import jwt

# for model
from scipy.spatial import distance
from sentence_transformers import SentenceTransformer

# App instance
app = Flask(__name__)
CORS(app)


# Load environment variables
load_dotenv()

# Determine if running in production
FLASK_ENV = os.environ.get("FLASK_ENV", "production")

# DB SETUP
# Set up the database URI (use environment variable)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# REMOVE COMMENT TO RE_ENABLE AUDIO
# whisper_model = whisper.load_model("tiny")

# load in model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Define the Scenario table
class Scenario(db.Model):
    __tablename__ = 'scenarios'

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    door_sign = db.Column(db.Text, nullable=True)
    vital_signs = db.Column(db.JSON, nullable=True)  # JSON for structured data
    instructions = db.Column(db.Text, nullable=True)

    def __repr__(self):
        return f"<Scenario {self.id} - {self.title}>"

# Define the Prompt table
class Prompt(db.Model):
    __tablename__ = 'prompts'

    id = db.Column(db.Integer, primary_key=True)
    expected_response = db.Column(db.Text, nullable=False)
    patient_prompt = db.Column(db.Text, nullable=False)
    scenario_id = db.Column(db.Integer, db.ForeignKey('scenarios.id'), nullable=False)
    category = db.Column(db.String(50), nullable=True)
    sequence_order = db.Column(db.Integer, nullable=True)

    scenario = db.relationship('Scenario', backref=db.backref('prompts', lazy=True))

    def __repr__(self):
        return f"<Prompt {self.id} - Scenario {self.scenario_id}>"

@app.route('/get_scenarios', methods=['GET'])
def get_scenarios():

    scenarios = Scenario.query.all()
    return jsonify([
        {
            'id': scenario.id,
            'title': scenario.title,
            'description': scenario.description
        }
        for scenario in scenarios
    ])

# Querying the database for prompts in order of sequence
@app.route('/get_prompt/<int:scenario_id>', methods=['GET'])
def get_prompt(scenario_id):
    prompts = Prompt.query.filter_by(scenario_id=scenario_id).order_by(asc(Prompt.sequence_order)).all()
    if prompts:
        scenario = Scenario.query.get(scenario_id)
        return jsonify({
            'prompts': [
                {
                    'id': prompt.id,
                    'expected_response': prompt.expected_response,
                    'patient_prompt': prompt.patient_prompt,
                    'category': prompt.category,
                    'sequence_order': prompt.sequence_order
                } for prompt in prompts
            ],
            'scenario': {
                'id': scenario.id,
                'title': scenario.title,
                'description': scenario.description,
                'door_sign': scenario.door_sign,
                'vital_signs': scenario.vital_signs,
                'instructions': scenario.instructions
            }
        })
    else:
        return jsonify({'error': 'No prompts found for this scenario'}), 404

# API to evaluate user input
@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    user_input = data.get('user_input')
    prompt_id = data.get('prompt_id')

    # Retrieve the prompt
    prompt = Prompt.query.get(prompt_id)
    if not prompt:
        return jsonify({'error': 'Prompt not found'}), 404

    # Encode vectors of response and target
    expected_vec = model.encode([prompt.expected_response])[0]
    user_vec = model.encode([user_input])[0]

    # distance is in [0,2] where 0 is identical, 1 is unrelated, and 0 is opposite
    cos_distance = distance.cosine(user_vec, expected_vec)

    # normalized score
    similarity_score = 1 - (cos_distance / 2) 
    print(f"Similarity score: {similarity_score}")

    # Threshold to determine correct or not
    threshold = 0.75
    is_correct = similarity_score >= threshold

    print(f"Correct? {is_correct}")

    return jsonify({'is_correct': bool(is_correct),
                    'score': f"{int(similarity_score * 100)}%"})

# /api/home endpoint
@app.route("/", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Management Engineering c/o 2025 Capstone",
        'team': ['Thomas', 'Saleh', 'Abhinav', 'Matt', 'John']
    })

@app.route("/store_results", methods=['POST'])
def store_results():
    data = request.get_json()

    print("results data:", data)

    # Extracting required fields from request
    user_id = data.get("user_id")
    scenario_id = data.get("scenario_id")
    category = data.get("category")
    num_correct = data.get("num_correct")
    num_prompts = data.get("num_prompts")

    # Validation: Ensure all required fields are present (allow 0 values)
    if any(value is None for value in [user_id, scenario_id, category, num_correct, num_prompts]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Insert data into Supabase "results" table
        response = supabase.table("results").insert([{
            "user_id": user_id,
            "scenario_id": scenario_id,
            "category": category,
            "num_correct": num_correct,
            "num_prompts": num_prompts
        }]).execute()

        # Debugging: Print Supabase response
        print("Supabase response:", response)

        return jsonify({"message": "Added result to DB"}), 200

    except Exception as e:
        return jsonify({"error": "Failed to add result to DB", "details": str(e)}), 500


# API to get audio file from user input, transcribe it, return to front end
@app.route('/upload_audio', methods=['POST'])
def upload_audio():

    # audio file
    audio_file = request.files.get('audio')

    # return 400 Bad Request error
    if not audio_file:
        return jsonify({'error': 'No audio file uploaded'}), 400
    
    # save file under recordings/ folder
    #save_path = os.path.join("recordings", "recording.wav")
    #audio_file.save(save_path)

    # Read all bytes from the uploaded file
    #audio_bytes = audio_file.read()
    #audio_buffer = io.BytesIO(audio_bytes)
    #audio_buffer.seek(0)  # Ensure pointer is at the start

    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as tmp:
        temp_path = tmp.name
        audio_file.save(temp_path)

    try:
        # COMMENTED OUT TO REMOVE AUDIO CAPBILITY IN PROD
        # Now pass the file stored to Whisper
        #result = whisper_model.transcribe(temp_path)
        result = {"test": "not working!"}
        print(result["text"])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    os.remove(temp_path)

    return jsonify({'transcript': result["text"]}), 200


@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        res = supabase.auth.sign_up({"email": email, "password": password})
        return jsonify({"message": "Sign-up successful! Please check your email to confirm your account.", "data": res})
    except Exception as e:
        return jsonify({"error": "Sign-up failed", "details": str(e)}), 500

@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        session_data = res.session  # This contains JWT and user session

        if session_data is None:
            return jsonify({"error": "Invalid credentials or email not confirmed."}), 401

        user = session_data.user
        serializable_session = {
            "access_token": session_data.access_token,
            "refresh_token": session_data.refresh_token,
            "expires_in": session_data.expires_in,
            "user": {
                "id": user.id,
                "email": user.email,
                "confirmed_at": user.confirmed_at,  # if available
                # add any other user fields you need
            }
            }

        return jsonify({"message": "Login successful!", "session": serializable_session})

    except Exception as e:
        print(str(e))
        return jsonify({"error": "Sign in failed", "details": str(e)}), 401

@app.route("/signout", methods=["POST"])
def signout():
    try:
        supabase.auth.sign_out()  # Sign out the user
        return jsonify({"message": "Logout successful"}), 200
    except Exception as e:
        return jsonify({"error": "Logout failed", "details": str(e)}), 500

    
# this will run for local development
if __name__ == "__main__" and FLASK_ENV == "development":
    app.run(debug=True, port=8080)

