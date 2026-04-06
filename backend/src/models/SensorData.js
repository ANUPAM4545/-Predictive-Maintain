const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    machineId: { type: String, required: true },
    temperature: { type: Number, required: true },
    vibration: { type: Number, required: true },
    battery: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    isAnomaly: { type: Boolean, default: false },
    anomalyScore: { type: Number },
    severity: { type: String, enum: ['Normal', 'Warning', 'Critical'], default: 'Normal' }
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
