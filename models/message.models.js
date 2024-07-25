const mongoose = require('mongoose')

const messageSchema = mongoose.Schema({
    text: {
        type: String,
        required: true,
        default: ''
    },
    assets: [{
        cloudinaryId: {
            type: String,
            required: true
        },
    }],
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    conversation:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Conversation'
    },
    status: {
        type: Number,
        enum: [0, 1, 2], // 0:sent, 1:received, 2:seen
        default: 0
    }
}, { timestamps: true })

messageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema)