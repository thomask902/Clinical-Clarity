from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv

# need cors to allow other servers (our next.js server) to access the /api/home endpoint
from flask_cors import CORS

load_dotenv()

# app instance
app = Flask(__name__)
CORS(app)

# Set up the database URI (use environment variable)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# /api/home
@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "We are team 13 :)",
        'team': ['Thomas', 'Saleh', 'Abhinav', 'Matt', 'John']
    })


# not needed in prod
#if __name__ == "__main__":
#    app.run(debug=True, port=8080) # change debug tag if deploying