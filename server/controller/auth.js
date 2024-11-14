const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../model/userModel");
const Chat = require('../model/chatModel');

const isRegister = async (req, res) => {
    try {
        const { username, email, password, avatar } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ status: 400, message: 'All fields are required' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ status: 400, message: 'Email already in use' });
        }
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, avatar });
        await user.save();
        res.status(200).json({ status: 200, message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

const isLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        // console.log('req.body: ', req.body);
        const user = await User.findOne({ email });
        if (!user || user.status === 'INACTIVE') return res.status(404).json({ status: 404, message: 'User not found' });
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        const token = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '7h' });
        res.status(200).json({ status: 200, message: 'User logged in successfully', token: token });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
}

const isCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.id).select('-password'); //remove password from user
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ status: 200, user })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error retrieving user data' });
    }
}


const updateCurrentUser = async (req, res) => {
    try {
        // console.log('req.body: ', req.body);
        // console.log('req.id: ', req.id);
        const user = await User.findByIdAndUpdate(req.id, req.body, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ status: 200, user })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Error updating user data' });
    }
}

const ChangePassword = async (req, res) => {
    try {
        //  console.log('verifytoken ', req.id);//req.id from header 
        // console.log(' req.body: ', req.body);
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'current password is incorrect' });
        }
        // Check if the new password is the same as the current password
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ message: 'New password cannot be the same as the old password' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({ status: true, message: 'Password changed successfully' });
    } catch (error) {
        // console.log('error: ', error.message);
        res.status(500).json({ message: 'Error changing password' })
    }
}

const isDeleteAccount =async(req,res)=>{
    try{
        // console.log('req.id: ', req.id);
           // Step 1: Find all groups where the current user is an admin
           const groupsWithUserAsAdmin = await Chat.find({ 
            $or: [{ groupAdmin: req.id }, { groupCreator: req.id }],
               isGroupChat: true 
            });
            // console.log('groupsWithUserAsAdmin: ', groupsWithUserAsAdmin);

             // Step 2: Reassign admin/creator  for each group
        for (const group of groupsWithUserAsAdmin) {
            // Check if there are other users in the group
            const otherUsers = group.users.filter(userId => userId.toString() !== req.id);

            if (otherUsers.length > 0) {
                // Case A: Other users are present
                // console.log('group.groupAdmin: ', group.groupAdmin);
                if (group.groupAdmin.includes(req.id)) {
                    // Remove current user from `groupAdmin`
                    group.groupAdmin = group.groupAdmin.filter(adminId => adminId.toString() !== req.id);
                }
                if (group.users.includes(req.id)) {
                    // Remove current user from `groupAdmin`
                    group.users = group.users.filter(adminId => adminId.toString() !== req.id);
                }
                if (group.groupAdmin.length === 0) {
                    // No other admins present; assign the first user in the list as new admin
                    group.groupAdmin = [otherUsers[0]];
                }
                // console.log('group.groupCreator: ', group.groupCreator);
                if (group.groupCreator.toString() === req.id) {
                    // Reassign `groupCreator` to the first available admin
                    group.groupCreator = group.groupAdmin[0];
                }

            } else {
                // Optionally, you could choose to delete the group if there are no other users
                // await Chat.findByIdAndDelete(group._id);
                continue;
            }

            // Update the group with the new admin
            await group.save();
            // console.log('group: ', group);
        }

 // Step 3: Update the user status to 'INACTIVE'

        const user = await User.findByIdAndUpdate(req.id,{status:'INACTIVE'},{ new: true });
        if(!user){
            return res.status(404).json({message:'User not found'});
        }
        res.status(200).json({status:true,message:'User  account deleted successfully'});
    }catch(error){
        console.error(error.message);
        res.status(500).json({message:'Error deleting user'});
    }
}


module.exports = { isRegister, isLogin, isCurrentUser, updateCurrentUser, ChangePassword,isDeleteAccount };