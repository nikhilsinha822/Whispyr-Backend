const mongoose = require('mongoose')

const conversationSchema = mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    participants:[{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }],
    type:{
        type: Number,
        enum: [0, 1], //0:individual, 1:group
        required: true
    },
    lastMessage:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Message'
    }
}, {timestamps: true})

conversationSchema.index({ participants: 1 });

module.exports = mongoose.model('Conversation', conversationSchema)