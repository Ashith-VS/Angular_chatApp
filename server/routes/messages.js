const express = require('express');
const { getUsersBySearch, sendMessages, allMessages } = require('../controller/message');
const verifyToken = require('../middleware/verifyMiddleware');
const router = express.Router();

router.get('/findUser', verifyToken, getUsersBySearch);
router.post('/', verifyToken, sendMessages);
router.get('/:chatId', verifyToken, allMessages);


module.exports = router