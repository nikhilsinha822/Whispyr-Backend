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
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Conversation'
    },
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: Number,
            enum: [0, 1, 2], // 0: sent, 1: received, 2: seen
            default: 0
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true })

messageSchema.index({
    conversation: 1,
    'readBy.user': 1,
    'readBy.status': 1,
    sender: 1
}, { sparse: true });

module.exports = mongoose.model("Message", messageSchema)