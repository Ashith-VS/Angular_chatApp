const express = require('express');
const { isRegister, isLogin, isCurrentUser, updateCurrentUser, ChangePassword, isDeleteAccount } = require('../controller/auth');
const verifyToken = require('../middleware/verifyMiddleware');

const router = express.Router();

router.post('/register', isRegister)
router.post('/login', isLogin)
router.get('/currentuser', verifyToken, isCurrentUser)
router.put('/updateuser', verifyToken, updateCurrentUser)
router.post('/changePassword', verifyToken, ChangePassword)
router.put('/deleteaccount', verifyToken, isDeleteAccount)

module.exports = router