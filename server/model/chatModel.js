const mongoose = require('mongoose')

const chatSchema =new mongoose.Schema({
    chatName: {type: 'string',trim: true},
    isGroupChat: {type: 'boolean',default: false},
    users:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    latestMessage:{type:mongoose.Schema.Types.ObjectId,ref:'Message'},
    groupAdmin: {type:mongoose.Schema.Types.ObjectId,ref:'User'},
},{timestamps:true})

module.exports = mongoose.model('Chat', chatSchema)