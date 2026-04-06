# Predictive Maintenance Dashboard

A full-stack AI-powered dashboard for real-time monitoring of industrial machines. It simulates IoT sensor streams, uses an Isolation Forest machine learning model to detect anomalies in real-time, displays live charts via WebSockets, and logs events.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Recharts, Socket.io-client, Framer Motion
- **Backend**: Node.js, Express, MongoDB, Socket.io, Mongoose
- **ML Service**: Python, Flask, scikit-learn (Isolation Forest)
- **Database**: MongoDB

## Setup Instructions

### 1. Start MongoDB
You can use the provided Docker Compose to start MongoDB locally.
```bash
docker-compose up -d
```

### 2. Start ML Service
```bash
cd ml-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### 3. Start Node.js Backend
```bash
cd backend
npm install
# Ensure .env has MONGODB_URI=mongodb://localhost:27017/predictive-maintenance
npm run dev
```
*(The backend will immediately connect to MongoDB and start generating simulated sensor telemetry every 3 seconds.)*

### 4. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to view the live dashboard.

## Features
- **Real-Time Data**: Live temperature and vibration data updates seamlessly via Socket.io.
- **AI Anomaly Detection**: Isolation Forest model automatically scores incoming payloads.
- **Dynamic Alerts**: "Critical" and "Warning" alerts appear when anomalies occur.
- **Glassmorphism UI**: High-end modern UI designed with tailwind configuration.
