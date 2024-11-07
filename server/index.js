const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const router = require('./routes/index')
const { notFound, errorHandler } = require('./middleware/errorMiddleware')
const http = require('http')
const socketIo = require('socket.io')

require('dotenv').config()

const app = express()
const server = http.createServer(app);

app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

app.use('/', router)
app.use(notFound)
app.use(errorHandler);


const io = socketIo(server, {
    cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
    }
})


io.on('connection', (socket) => {
    console.log("Connected to socket.io")

    socket.on('setup', (userData) => {
        console.log('userData._id', userData._id)
        socket.join(userData._id)
        socket.emit('connected')
    })

    socket.on('joinChat', (room) => {
        console.log('user joined room', room)
        socket.join(room)
    });


    socket.on('newMessage', (message) => {
        //   console.log('message received', message)
        if (!message.chat.users) return console.log('chat  user is not available')
        // console.log('message.chat.users: ', message.chat.users);
        message.chat.users.forEach(user => {
            if (user._id == message.sender._id) return;
            socket.in(user._id).emit('messageReceived', message)
        })
    })
    // Handle client disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected');

    });

})

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })


