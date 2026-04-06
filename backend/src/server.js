require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const apiRoutes = require('./routes/api');
const { startSimulation } = require('./services/dataGenerator');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*', // For development
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 5000;

// Start generating data stream for sockets once DB connects
startSimulation(io);

server.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
