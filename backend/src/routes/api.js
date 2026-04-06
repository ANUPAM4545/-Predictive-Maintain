const express = require('express');
const router = express.Router();
const store = require('../models/store');

// Get recent historical sensor data
router.get('/sensor-data', (req, res) => {
    res.json(store.sensorData.slice().reverse().slice(0, 50));
});

// Get active alerts
router.get('/alerts', (req, res) => {
    res.json(store.alerts.filter(a => !a.resolved).slice().reverse());
});

// Resolve an alert
router.put('/alerts/:id/resolve', (req, res) => {
    const alert = store.resolveAlert(req.params.id);
    if (alert) res.json(alert);
    else res.status(404).json({ error: "Alert not found" });
});

module.exports = router;
