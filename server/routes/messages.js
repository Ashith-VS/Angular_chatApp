const express = require('express');
const { getUsersBySearch, sendMessages, allMessages, uploadAttachments, deleteByMessage } = require('../controller/message');
const verifyToken = require('../middleware/verifyMiddleware');
const router = express.Router();

router.get('/findUser', verifyToken, getUsersBySearch);
router.post('/', verifyToken, sendMessages);
router.get('/:chatId', verifyToken, allMessages);
router.post('/attachments', verifyToken, uploadAttachments)
router.get('/delete/:messageId', verifyToken, deleteByMessage)


module.exports = router