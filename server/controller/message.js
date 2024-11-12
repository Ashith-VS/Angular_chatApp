const Chat = require("../model/chatModel");
const Message = require("../model/messageModel");
const User = require("../model/userModel");


const getUsersBySearch = async (req, res) => {
    try {
        const query = req.query.search
        // console.log('query: ', query);
        const users = await User.find({
            username: { $regex: query, $options: 'i' }, status: 'ACTIVE',
        }).find({ _id: { $ne: req.id } })//login user detail not yet available IN search users list
        res.status(200).json({ status: 200, message: 'Users fetched successfully', users });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


const sendMessages = async (req, res) => {
    try {
        const { content, chatId } = req.body
        // console.log('req.body: ', req.body);
        // console.log('chatId: ', chatId);
        if (!content || !chatId) return res.status(500).json({ status: 500, message: "Invalid content passed to sendMessage" })

        const newMessage = new Message({
            sender: req.id,
            content,
            chat: chatId
        })
        let message = await newMessage.save()
        // console.log('message: ', message);

        message = await message.populate('sender', 'username avatar',)
        message = await message.populate('chat')
        message = await User.populate(message, {
            path: 'chat.users',
            select: 'username avatar email',
        })
        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        res.status(200).json({ status: 200, message: 'Message sent successfully', message });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

const allMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate('sender', "username avatar email")
            .populate('chat')
        // console.log('messages: ', messages);

        res.status(200).json({ status: 200, message: 'Messages fetched successfully', messages });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

module.exports = { getUsersBySearch, sendMessages, allMessages }