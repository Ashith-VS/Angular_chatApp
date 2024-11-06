const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = require('./routes/index')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const http = require('http')
const socketIo = require('socket.io')

require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

app.use('/', router)
app.use(notFound)
app.use(errorHandler);


const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    }
})


io.on('connection', (socket) => {
    console.log("Connected to socket")

    socket.on('message', (data) => {
        console.log('message received', data)
        io.emit('message', data);
    })

    socket.on('disconnect', () => {
        console.log('user disconnected')
    });
})

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
    
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })


