const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: 'https://api.adorable.io/avatars/285/abott@adorable.io.png' },
    onlineStatus: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)