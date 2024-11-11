const express = require('express');
const { AccessChat, FetchChats, CreateGroupChat, RenameGroup, AddtoGroup, RemoveFromGroup, AddMultipleGroupAdmin, RemoveFromGroupAdmin } = require('../controller/chat');
const verifyToken = require('../middleware/verifyMiddleware');

const router = express.Router();

router.post('/', verifyToken, AccessChat)
router.get("/", verifyToken, FetchChats)
router.post("/group", verifyToken, CreateGroupChat)
router.put('/rename', verifyToken, RenameGroup)
router.put('/groupadd', verifyToken, AddtoGroup)
router.put('/groupremove', verifyToken, RemoveFromGroup)
router.put('/groupadminadd', verifyToken,AddMultipleGroupAdmin)
router.put('/groupadminremove', verifyToken,RemoveFromGroupAdmin)

module.exports = router