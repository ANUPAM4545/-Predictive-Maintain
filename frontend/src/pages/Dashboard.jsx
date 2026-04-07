import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, CheckCircle, Battery, Zap, ShieldAlert, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
    const [sensors, setSensors] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [activeMachines, setActiveMachines] = useState({});

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [sensorRes, alertRes] = await Promise.all([
                    axios.get(`${API_URL}/sensor-data`),
                    axios.get(`${API_URL}/alerts`)
                ]);
                setSensors(sensorRes.data.reverse()); // Keep chronological
                setAlerts(alertRes.data);
            } catch (err) {
                console.error("Failed to fetch initial data", err);
            }
        };
        fetchInitialData();

        const socket = io(SOCKET_URL);
        
        socket.on('sensor_data', (data) => {
            setSensors(prev => {
                const newArr = [...prev, data];
                if (newArr.length > 50) newArr.shift(); // Keep last 50
                return newArr;
            });
            setActiveMachines(prev => ({
                ...prev,
                [data.machineId]: data
            }));
        });

        socket.on('new_alert', (alert) => {
            setAlerts(prev => [alert, ...prev].slice(0, 50));
        });

        return () => socket.disconnect();
    }, []);

    const resolveAlert = async (id) => {
        try {
            await axios.put(`${API_URL}/alerts/${id}/resolve`);
            setAlerts(prev => prev.filter(a => a._id !== id));
        } catch (error) {
            console.error("Failed to resolve alert", error);
        }
    };

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-neon">
                        Predictive Maintenance
                    </h1>
                    <p className="text-gray-400 mt-1">Real-time AI monitoring and anomaly detection</p>
                </div>
                <div className="flex items-center gap-2 self-start md:self-auto">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                    </span>
                    <span className="text-sm font-medium text-success">Live Feed Active</span>
                </div>
            </header>

            {/* Machine Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.values(activeMachines).map(machine => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={machine.machineId} 
                        className={`glass-panel p-5 relative overflow-hidden transition-all duration-300 border-t-2 ${
                            machine.severity === 'Critical' ? 'border-t-danger' : 
                            machine.severity === 'Warning' ? 'border-t-warning' : 'border-t-success'
                        }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-semibold">{machine.machineId}</h3>
                                <p className="text-xs text-gray-400">{new Date(machine.timestamp).toLocaleTimeString()}</p>
                            </div>
                            <div className="p-2 rounded-full bg-white/5">
                                {machine.severity === 'Critical' ? <ShieldAlert className="text-danger" size={24} /> :
                                 machine.severity === 'Warning' ? <AlertTriangle className="text-warning" size={24} /> :
                                 <CheckCircle className="text-success" size={24} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-gray-400 text-xs flex items-center gap-1"><Activity size={12}/> Temp</div>
                                <div className="text-xl font-bold">{machine.temperature}°C</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-gray-400 text-xs flex items-center gap-1"><Zap size={12}/> Vibration</div>
                                <div className="text-xl font-bold">{machine.vibration}mm/s</div>
                            </div>
                        </div>

                        {machine.isAnomaly && (
                            <div className="mt-4 text-xs p-2 rounded bg-danger/20 text-danger border border-danger/30 flex items-center justify-between">
                                <span>AI Anomaly Detected</span>
                                <span className="font-bold">Score: {machine.anomalyScore?.toFixed(2)}</span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Area */}
                <div className="lg:col-span-2 glass-panel p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Activity className="text-primary"/> Live Robot Activity
                    </h2>
                    <div className="h-[250px] md:h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sensors}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                                <XAxis 
                                    dataKey="timestamp" 
                                    stroke="#ffffff50" 
                                    tickFormatter={(t) => new Date(t).toLocaleTimeString()}
                                />
                                <YAxis yAxisId="left" stroke="#ffffff50" />
                                <YAxis yAxisId="right" orientation="right" stroke="#ffffff50" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1A2235', border: '1px solid #ffffff20', borderRadius: '8px' }}
                                    labelFormatter={(t) => new Date(t).toLocaleString()}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#3B82F6" strokeWidth={2} dot={false} activeDot={{r: 6}} />
                                <Line yAxisId="right" type="monotone" dataKey="vibration" stroke="#06B6D4" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Alerts Panel */}
                <div className="glass-panel p-6 flex flex-col h-[300px] md:h-[480px]">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <AlertTriangle className="text-warning"/> Active Alerts
                    </h2>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        <AnimatePresence>
                            {alerts.length === 0 ? (
                                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center text-gray-500 mt-10">
                                    <CheckCircle className="mx-auto mb-2 opacity-50" size={32} />
                                    No active alerts
                                </motion.div>
                            ) : (
                                alerts.map(alert => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        key={alert._id} 
                                        className={`p-4 rounded-xl border flex flex-col gap-2 ${
                                            alert.severity === 'Critical' ? 'bg-danger/10 border-danger/30' : 'bg-warning/10 border-warning/30'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="font-bold">{alert.machineId}</span>
                                            <span className="text-xs opacity-70">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <p className="text-sm opacity-90">{alert.message}</p>
                                        <button 
                                            onClick={() => resolveAlert(alert._id)}
                                            className="self-end text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
                                        >
                                            Dismiss
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* How it Works / Notes Section */}
            <div className="glass-panel p-6 mt-8 border-t border-primary/30">
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
                    <Info size={24} /> Project Overview & Technical Guide
                </h2>
                
                <div className="text-gray-300 space-y-6 text-sm leading-relaxed">
                    <section>
                        <h3 className="text-lg font-medium text-white mb-2">What is this project?</h3>
                        <p>
                            This is a <strong>Full-Stack AI-Powered Predictive Maintenance Dashboard</strong> designed for industrial and manufacturing environments. In real-world factories, machinery (like robotic arms, conveyor belts, or milling machines) generate vast amounts of IoT sensor data such as temperature fluctuations and vibration metrics. By monitoring this data, businesses can predict equipment failures <i>before</i> they happen, minimizing downtime and saving costs. This dashboard simulates and visualizes that entire pipeline in real time.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-lg font-medium text-white mb-2">How the Architecture Works</h3>
                        <ul className="list-disc pl-5 space-y-3">
                            <li>
                                <strong className="text-neon">1. Data Simulation (Node.js & Express):</strong> Since we do not have physical machines connected, our Node.js backend acts as an autonomous IoT broker. Every 3 seconds, it generates synthetic telemetry for three active machines. It purposefully injects statistical anomalies 10% of the time to simulate mechanical stress.
                            </li>
                            <li>
                                <strong className="text-neon">2. AI Anomaly Detection (Python & Scikit-learn):</strong> The backend transmits the generated sensor payload via HTTP to an isolated Python <i>Flask</i> microservice. This service utilizes an <strong>Isolation Forest</strong> machine-learning algorithm. The model evaluates the bivariate relationship between temperature and vibration, scoring the data point as either "Normal", "Warning", or "Critical".
                            </li>
                            <li>
                                <strong className="text-neon">3. Real-Time Streaming (Socket.io):</strong> Once evaluated, the Node backend broadcasts the enriched data telemetry (including the AI severity classifications) outward using WebSocket connections.
                            </li>
                            <li>
                                <strong className="text-neon">4. Frontend Visualization (React & Vite):</strong> This React application continuously listens to the WebSocket channel. It renders the incoming data stream instantly onto the Recharts canvas and dynamically updates the visual state of the machine widgets.
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-lg font-medium text-white mb-2">How to Use the Dashboard</h3>
                        <ul className="pl-5 space-y-2 list-decimal">
                            <li><strong>Monitor the Live Telemetry:</strong> Keep an eye on the large dual-axis chart. The blue line represents the current temperature, while the cyan line represents vibration density.</li>
                            <li><strong>Check Machine Health:</strong> The three widget cards at the top track the latest ping from each specific machine. If a machine's data receives a bad score from the AI, the card border will flash Yellow (Warning) or Red (Critical).</li>
                            <li><strong>Manage Maintenance Alerts:</strong> Whenever an anomaly is detected, an actionable ticket is created in the "Active Alerts" column. In a real factory, an engineer would inspect the machine. Click the <strong>Dismiss</strong> button to acknowledge and clear the alert once it has been resolved.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
