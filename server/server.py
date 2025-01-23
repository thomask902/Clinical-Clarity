from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql.expression import asc
import os
from dotenv import load_dotenv
from flask_cors import CORS

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

# FOR PROD COMMENT BELOW OUT
#if __name__ == "__main__":
#    app.run(debug=True, port=8080)


