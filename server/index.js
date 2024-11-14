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

// Use a Set to track online users
const onlineUsers = new Set();
let previousOnlineUsers = [];

io.on('connection', (socket) => {
    console.log("Connected to socket.io")

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        socket.userId = userData._id; // Store userId on the socket instance
        onlineUsers.add(userData._id); // Add user to online users
        // Emit online status to all users
        //  io.emit('userStatus', { userId: userData._id, status: 'online' });
       
        const newOnlineUsers = Array.from(onlineUsers);
        // Check if the online users list has changed before emitting
        if (JSON.stringify(previousOnlineUsers) !== JSON.stringify(newOnlineUsers)) {
            io.emit('userStatus', newOnlineUsers);
            previousOnlineUsers = newOnlineUsers; // Update the previous state
        }
        console.log('onlineUsers after setup:', newOnlineUsers);
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

        // Emit offline status to all users
        console.log('socket.userId:disconnect ', socket.userId);
        if (socket.userId) {
            onlineUsers.delete(socket.userId); // Remove user from online users
            //   io.emit('userStatus', { userId: socket.userId, status: 'offline' });
            // Emit the updated list of online users to everyone
            // 
            const newOnlineUsers = Array.from(onlineUsers);

            // Check if the online users list has changed before emitting
            if (JSON.stringify(previousOnlineUsers) !== JSON.stringify(newOnlineUsers)) {
                io.emit('userStatus', newOnlineUsers);
                previousOnlineUsers = newOnlineUsers; // Update the previous state
            }

            console.log('onlineUsers after disconnect:', newOnlineUsers);
        }

    });

})

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })


