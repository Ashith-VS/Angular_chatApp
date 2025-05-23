const Chat = require("../model/chatModel");
const User = require("../model/userModel");

const AccessChat = async (req, res) => {
    try {
        const { chatId } = req.body;

        if (!chatId) {
            return res.status(400).json({ status: 400, message: 'Chat ID is required' });
        }

        let chat = await Chat.find({
            isGroupChat: false, $and: [
                { users: { $elemMatch: { $eq: req.id } } }, { users: { $elemMatch: { $eq: chatId } } }
            ]
        }).populate("users", "-password").populate("latestMessage")

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "username avatar email"
        })

        if (chat.length > 0) {
            res.status(200).json({ status: 200, message: 'Chat accessed successfully', chat: chat[0] });
        } else {
            let chatData = {
                chatName: "sender",
                isGroupChat: false,
                users: [req.id, chatId],
            }
            try {
                const createdChat = await Chat.create(chatData)
                const fullChat = await Chat.findOne({ _id: createdChat._id }).populate("users", "-password")
                res.status(200).json({ status: 200, message: 'Chat created successfully', chat: fullChat });
            } catch (error) {
                res.status(500).json({ status: 500, message: error.message });
            }
        }

    } catch (error) {
        console.error(error);
    }
}

const FetchChats = async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatdAt: -1 })
            .then(async (result) => {
                result = await User.populate(result, {
                    path: "latestMessage.sender",
                    select: "username avatar email"
                })
                res.status(200).json({ status: 200, message: 'Chats fetched successfully', chats: result })
            })
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message })
    }
}

const CreateGroupChat = async (req, res) => {
    try {
        if (!req.body.chatName || !req.body.users) {
            return res.status(400).json({ status: 400, message: 'All fields are required ' });
        }
        let users = req.body.users
        if (users.length < 2) {
            return res.status(400).json({ status: 400, message: 'At least two users are required in a group chat' });
        }
        users.push(req.id)

        const groupChat = await Chat.create({
            chatName: req.body.chatName,
            users: users,
            isGroupChat: true,
            groupAdmin: [req.id],
            groupCreator: req.id
        })
        // Only set groupImage if provided; otherwise, the schema default will be used
        if (req.body.groupImage) {
            groupChat.groupImage = req.body.groupImage;
        }

        try {
            const fullChat = await Chat.findOne({ _id: groupChat._id }).populate("users", "-password").populate("groupAdmin", "-password")
            res.status(200).json({ status: 200, message: 'Group chat created successfully', chat: fullChat });
        } catch (error) {
            res.status(500).json({ status: 500, message: error.message });
        }
    } catch (error) {
        console.error(error);
    }
}

const RenameGroup = async (req, res) => {
    try {
        const { chatId, chatName } = req.body;
        if (!chatId || !chatName) {
            return res.status(400).json({ status: 400, message: 'Chat ID and new chat name are required' });
        }
        const Updatedchat = await Chat.findByIdAndUpdate(chatId, { chatName }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!Updatedchat) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'Group chat renamed successfully', chat: Updatedchat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const ChangeGroupImage = async (req, res) => {
    try {
        const { chatId, groupImage } = req.body;
        if (!chatId || !groupImage) {
            return res.status(400).json({ status: 400, message: 'Chat ID and chatImage are required' });
        }
        const Updatedchat = await Chat.findByIdAndUpdate(chatId, { groupImage }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!Updatedchat) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'Group chat renamed successfully', chat: Updatedchat });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const AddtoGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const addedUsers = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!addedUsers) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'User added to group successfully', chat: addedUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const RemoveFromGroup = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const removedUsers = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!removedUsers) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'User removed from group successfully', chat: removedUsers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const AddMultipleGroupAdmin = async (req, res) => {
    try {
        const { chatId, userIds } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { $push: { groupAdmin: userIds } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!updatedChat) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'Group admins updated successfully', chat: updatedChat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }
}

const RemoveFromGroupAdmin = async (req, res) => {
    try {
        const { chatId, userId } = req.body;
        const updatedChat = await Chat.findByIdAndUpdate(chatId, { $pull: { groupAdmin: userId } }, { new: true }).populate("users", "-password").populate("groupAdmin", "-password")
        if (!updatedChat) {
            return res.status(404).json({ status: 404, message: 'Chat not found' });
        }
        res.status(200).json({ status: 200, message: 'Group admin removed successfully', chat: updatedChat });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: error.message });
    }

}

module.exports = { AccessChat, FetchChats, CreateGroupChat, RenameGroup, AddtoGroup, RemoveFromGroup, AddMultipleGroupAdmin, RemoveFromGroupAdmin, ChangeGroupImage }