import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import os

MODEL_PATH = "isolation_forest.joblib"

class AnomalyDetector:
    def __init__(self):
        self.model = None

    def train_initial_model(self):
        """Train a synthetic model so we have something out-of-the-box."""
        print("Training initial synthetic Isolation Forest model...")
        # Synthetic data: normal operating temperatures (60-80) and vibrations (1-5)
        np.random.seed(42)
        temperatures = np.random.normal(70, 5, 1000)
        vibrations = np.random.normal(3, 1, 1000)
        
        # Combine features
        X_train = np.column_stack((temperatures, vibrations))
        
        # Train Isolation Forest
        self.model = IsolationForest(contamination=0.05, random_state=42)
        self.model.fit(X_train)
        
        # Save model
        joblib.dump(self.model, MODEL_PATH)
        print("Model saved to", MODEL_PATH)

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            self.train_initial_model()

    def predict(self, temperature: float, vibration: float):
        if self.model is None:
            self.load_model()
            
        feature_vector = np.array([[temperature, vibration]])
        
        # Predict: 1 for normal, -1 for anomaly
        prediction = self.model.predict(feature_vector)[0]
        # Anomaly score: lower score means more abnormal
        score = self.model.score_samples(feature_vector)[0]
        
        is_anomaly = True if prediction == -1 else False
        
        # Determine severity if it's an anomaly
        severity = "Normal"
        if is_anomaly:
            if score < -0.6:  # Arbitrary threshold for critical
                severity = "Critical"
            else:
                severity = "Warning"
                
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": float(score),
            "severity": severity
        }

detector = AnomalyDetector()
detector.load_model()
