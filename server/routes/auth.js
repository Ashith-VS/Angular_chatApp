const express = require('express');
const { isRegister, isLogin, isCurrentUser } = require('../controller/auth');
const verifyToken = require('../middleware/verifyMiddleware');


const router = express.Router();

router.post('/register', isRegister)
router.post('/login', isLogin)
router.get('/currentuser', verifyToken, isCurrentUser)

module.exports = router