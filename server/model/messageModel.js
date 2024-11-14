const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    content: { type: String, trim: true },
    attachments: [
        {
            url: { type: String, required: true }, // URL of the uploaded file (e.g., stored in Cloudinary or Firebase)
            fileType: { type: String, required: true }, // File type, e.g., "image", "video", "document"
            fileName: { type: String } ,// Original name of the file
        }
    ]
}, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)