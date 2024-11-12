const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '../assets/icons/avatar.webp'},
    about: { type: String, default:'Hello, I am using Chat App'},
    status:{ type: String, default:'ACTIVE'}
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)
