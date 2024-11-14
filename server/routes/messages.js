const express = require('express');
const { getUsersBySearch, sendMessages, allMessages, uploadAttachments } = require('../controller/message');
const verifyToken = require('../middleware/verifyMiddleware');
const router = express.Router();

router.get('/findUser', verifyToken, getUsersBySearch);
router.post('/', verifyToken, sendMessages);
router.get('/:chatId', verifyToken, allMessages);
router.post('/attachments', verifyToken, uploadAttachments)


module.exports = router