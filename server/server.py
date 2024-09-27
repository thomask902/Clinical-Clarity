from flask import Flask, jsonify

# need cors to allow other servers (our next.js server) to access the /api/home endpoint
from flask_cors import CORS

# app instance
app = Flask(__name__)
CORS(app)

# /api/home
@app.route("/api/home", methods=['GET'])
def return_home():
    return jsonify({
        'message': "Hello clinical clarity! Welcome to our app!",
        'team': ['Thomas', 'Saleh', 'Abhinav', 'Matt', 'John']
    })



if __name__ == "__main__":
    app.run(debug=True, port=8080) # change debug tag if deploying