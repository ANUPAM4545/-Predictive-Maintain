const axios = require('axios');
const store = require('../models/store');

const MACHINES = ['Toy Assembler', 'Paint Bot', 'Packaging Robot'];

const generateRandomData = () => {
    let temp = 60 + Math.random() * 20;
    let vib = 2 + Math.random() * 2;
    
    if (Math.random() < 0.1) {
        if (Math.random() < 0.5) temp += 30 + Math.random() * 20;
        else vib += 3 + Math.random() * 3;
    }
    
    return {
        machineId: MACHINES[Math.floor(Math.random() * MACHINES.length)],
        temperature: parseFloat(temp.toFixed(2)),
        vibration: parseFloat(vib.toFixed(2)),
        battery: parseFloat((50 + Math.random() * 50).toFixed(2))
    };
};

const startSimulation = (io) => {
    setInterval(async () => {
        try {
            const rawData = generateRandomData();
            let mlBase = process.env.ML_SERVICE_URL || 'http://localhost:8000';
            if (!mlBase.startsWith('http')) {
                mlBase = `https://${mlBase}`;
            }
            const mlUrl = mlBase.endsWith('/predict') ? mlBase : `${mlBase.replace(/\/$/, '')}/predict`;
            let anomalyResult = { is_anomaly: false, anomaly_score: 0, severity: 'Normal' };
            
            try {
                const response = await axios.post(mlUrl, {
                    temperature: rawData.temperature,
                    vibration: rawData.vibration
                });
                anomalyResult = response.data;
            } catch (err) {
                console.error(`ML Service Error [${mlUrl}]:`, err.message);
                if (err.response) {
                    console.error("Status:", err.response.status, "Data:", err.response.data);
                }
                
                // CRITICAL DIAGNOSTIC: Emit the error straight to the frontend so we can verify the URL and the failure live
                const isColdStart = err.message.includes('502') || (err.response && err.response.status === 502);
                
                const errorAlert = {
                    machineId: "System Diagnostic",
                    type: isColdStart ? "ML Container Booting" : "ML Connection Error",
                    severity: isColdStart ? "Warning" : "Critical",
                    message: isColdStart 
                        ? `The Python ML microservice is automatically waking up from Free Tier sleep. Please allow 60 seconds...`
                        : `Cannot reach ML. Status: ${err.message}`,
                    timestamp: new Date(),
                    resolved: false
                };
                
                // Prevent spamming the error every 3 seconds if we already sent one recently
                const lastError = store.alerts.find(a => a.machineId === "System Diagnostic");
                if (!lastError || (new Date() - new Date(lastError.timestamp)) > 20000) {
                    store.addAlert(errorAlert);
                    io.emit('new_alert', store.alerts[store.alerts.length - 1]);
                }
            }
            
            const sensorData = {
                ...rawData,
                isAnomaly: anomalyResult.is_anomaly,
                anomalyScore: anomalyResult.anomaly_score,
                severity: anomalyResult.severity,
                timestamp: new Date()
            };
            
            store.addSensorData(sensorData);
            io.emit('sensor_data', sensorData);
            
            if (anomalyResult.is_anomaly) {
                const alertInfo = {
                    machineId: rawData.machineId,
                    type: "Anomaly Detected",
                    severity: anomalyResult.severity,
                    message: `Score: ${anomalyResult.anomaly_score.toFixed(2)}. Temp: ${rawData.temperature}, Vib: ${rawData.vibration}`,
                    timestamp: new Date(),
                    resolved: false
                };
                store.addAlert(alertInfo);
                io.emit('new_alert', store.alerts[store.alerts.length - 1]);
            }
            
        } catch (error) {
            console.error("Data generation error:", error);
        }
    }, 3000);
};

module.exports = { startSimulation };
