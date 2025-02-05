from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql.expression import func
import os
from dotenv import load_dotenv

# need cors to allow other servers (our next.js server) to access the /api/home endpoint
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

# load environment variables
load_dotenv()

# DB SETUP
# Set up the database URI (use environment variable)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# defining the prompt table
class Prompt(db.Model):
    __tablename__ = 'prompts'  # Match the table name in Supabase

    id = db.Column(db.Integer, primary_key=True)
    prompt_text = db.Column(db.Text, nullable=False)
    expected_result = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f"<Prompt {self.id}>"

@app.route("/", methods=['GET'])
def home():
    return jsonify({
        'message': "Welcome to the Flask API!",
        'endpoints': ['/get_prompt', '/evaluate', '/api/home']
    })

# querying the database for a random prompt
@app.route('/get_prompt', methods=['GET'])
def get_prompt():
    prompt = Prompt.query.order_by(func.random()).first()
    if prompt:
        return jsonify({
            'id': prompt.id,
            'prompt_text': prompt.prompt_text,
            'expected_result': prompt.expected_result
        })
    else:
        return jsonify({'error': 'No prompts found'}), 404

# api to received user input and compare to target prompt answer
@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    user_input = data.get('user_input')
    prompt_id = data.get('prompt_id')

    # Retrieve the expected result from the database
    prompt = Prompt.query.get(prompt_id)
    if not prompt:
        return jsonify({'error': 'Prompt not found'}), 404

    expected_result = prompt.expected_result

    # Compare user input with expected result
    # (Implement your evaluation logic here)
    is_correct = user_input.strip().lower() == expected_result.strip().lower()

    return jsonify({'is_correct': is_correct})

# /api/home
@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "We are team 13 :)",
        'team': ['Thomas', 'Saleh', 'Abhinav', 'Matt', 'John']
    })


@app.route('/do_something', methods=['POST'])
def do_something():
    # This is where you run server-side logic
    # e.g., process data, update a database, etc.
    # For demo, just return a JSON response
    return jsonify({"message": "Flask says it did something!"}), 200



# FOR PROD COMMENT BELOW OUT
if __name__ == "__main__":
    app.run(debug=True, port=8080) 