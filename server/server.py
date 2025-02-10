from flask import Flask, jsonify, request
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

# App instance
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# DB SETUP
# Set up the database URI (use environment variable)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


whisper_model = whisper.load_model("tiny")


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

@app.route("/", methods=['GET'])
def home():
    return jsonify({
        'message': "Welcome to the Flask API!",
        'endpoints': ['/get_prompt', '/evaluate', '/api/home']
    })

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

    # Compare user input with the ideal response
    is_correct = user_input.strip().lower() == prompt.expected_response.strip().lower()

    return jsonify({'is_correct': is_correct})

# /api/home endpoint
@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "We are team 13 :)",
        'team': ['Thomas', 'Saleh', 'Abhinav', 'Matt', 'John']
    })

# Score/Result of the User
score = 85
correct_answers = 44
total_questions = 52

@app.route("/api/results", methods=['GET'])
def get_results():
    results = {
        "score": score,
        "correct_answers": correct_answers,
        "total_questions": total_questions,
        "feedback": "Great job! You scored above 80%."
    }
    return jsonify(results)


def upload_audio():
    audio_file = request.files.get('audio')
    if not audio_file:
        return jsonify({'error': 'No audio file uploaded'}), 400






# API to get audio file from user input
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
        # Now pass the file stored to Whisper
        result = whisper_model.transcribe(temp_path)
        print(result["text"])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    os.remove(temp_path)

    return jsonify({'transcript': result["text"]}), 200

# FOR PROD COMMENT BELOW OUT
if __name__ == "__main__":
    app.run(debug=True, port=8080)

