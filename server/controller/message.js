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
        if (!content || !chatId) return res.status(500).json({ status: 500, message: "Invalid content passed to sendMessage" })
        const newMessage = new Message({
            sender: req.id,
            content,
            chat: chatId
        })
        let message = await newMessage.save()
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

const uploadAttachments = async (req, res) => {
    try {
        const { chatId, attachments } = req.body;
        if (!attachments || !chatId) return res.status(500).json({ status: 500, message: "Invalid content passed to attachment" })
        const newMessage = new Message({
            sender: req.id,
            chat: chatId,
            attachments,
        })
        let message = await newMessage.save()
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
        res.status(200).json({ status: 200, message: 'Messages fetched successfully', messages });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}


const deleteByMessage = async (req, res) => {
    try {
        const { messageId } = req.params;

        // Find the message to get the chat ID before deleting
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ status: 404, message: 'Message not found' });
        }

        const chatId = message.chat;

        // Delete the message
        await Message.findByIdAndDelete(messageId);

        // Find the most recent message in the chat
        const latestMessage = await Message.findOne({ chat: chatId })
            .sort({ createdAt: -1 }) // Sort by the latest created message
            .populate('sender', 'username avatar') // Populate sender details
            .populate('chat'); // Populate chat details

        if (latestMessage) {
            // If there is a latest message, update the Chat with the new latestMessage
            await Chat.findByIdAndUpdate(chatId, { latestMessage });
        } else {
            // If no latest message, remove the latestMessage field
            await Chat.findByIdAndUpdate(chatId, { $unset: { latestMessage: "" } });
        }

        res.status(200).json({ status: 200, message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};


module.exports = { getUsersBySearch, sendMessages, allMessages, uploadAttachments, deleteByMessage }