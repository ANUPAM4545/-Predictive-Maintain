from flask import Flask, request, jsonify
from flask_cors import CORS
from model import detector

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return "API is running 🚀"

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

@app.route('/predict', methods=['POST'])
def predict_anomaly():
    data = request.json
    if not data or 'temperature' not in data or 'vibration' not in data:
        return jsonify({"error": "Missing temperature or vibration data"}), 400
        
    result = detector.predict(data['temperature'], data['vibration'])
    return jsonify(result)

import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
