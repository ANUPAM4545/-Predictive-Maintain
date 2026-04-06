from flask import Flask, request, jsonify
from flask_cors import CORS
from model import detector

app = Flask(__name__)
CORS(app)

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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
