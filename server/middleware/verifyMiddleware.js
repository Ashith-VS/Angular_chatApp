const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: "Access denied" })
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "You are not authorized" })
    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Token is not valid" })
        }
        req.id = user.id
        next()
    })
}

module.exports = verifyToken;