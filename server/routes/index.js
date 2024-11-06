const express = require('express')
const router = express.Router();

const authRoutes = require('./auth');
const messageRoutes = require('./messages');
const chatRoutes = require('./chat');

router.use('/auth', authRoutes)
router.use('/api/message', messageRoutes)
router.use('/api/chat', chatRoutes)

module.exports = router