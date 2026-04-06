const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    machineId: { type: String, required: true },
    type: { type: String, required: true },
    severity: { type: String, enum: ['Warning', 'Critical'], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    resolved: { type: Boolean, default: false }
});

module.exports = mongoose.model('Alert', alertSchema);
