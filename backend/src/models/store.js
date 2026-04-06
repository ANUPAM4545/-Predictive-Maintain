// In-memory store for quick demonstration without MongoDB
const store = {
    sensorData: [],
    alerts: [],
    
    addSensorData: (data) => {
        store.sensorData.push({ _id: Date.now().toString(), ...data });
        if (store.sensorData.length > 200) store.sensorData.shift();
    },
    
    addAlert: (alert) => {
        store.alerts.push({ _id: Date.now().toString(), ...alert });
        if (store.alerts.length > 50) store.alerts.shift();
    },
    
    resolveAlert: (id) => {
        const alert = store.alerts.find(a => a._id === id);
        if (alert) alert.resolved = true;
        return alert;
    }
};

module.exports = store;
