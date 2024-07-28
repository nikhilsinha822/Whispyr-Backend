const catchAsyncError = require('../middleware/catchAsyncError.middleware')
const cloudinary = require('cloudinary').v2
const Conversation = require('../models/conversation.model')
const Message = require('../models/message.models')
const ErrorHandler = require('../utils/errorHandler.util')

const getFileUploadSignature = catchAsyncError(async (req, res, next) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const cloudinaryOptions = {
        timestamp,
        type: "private",
        folder: `chatMedia_${req.user._id}`
    }

    const signature = cloudinary.utils.api_sign_request({ ...cloudinaryOptions }, process.env.CLOUDINARY_API_SECRET);

    const payload = {
        ...cloudinaryOptions,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        signature,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    };

    res.json({ payload })
})

const getChatList = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;

    const conv = await Conversation.find({
        participants: {
            $all: [{ "$elemMatch": { $eq: userId } }]
        }
    }).populate('lastMessage').populate('participants', 'name email avatar').sort({ updatedAt: -1 })

    const convIDs = conv.map((conv) => conv._id)
    await Promise.all(convIDs.map((convID) => Message.updateMany({
        conversation: convID,
        status: { $lt: 1 },
        sender: { $ne: userId }
    }, {
        $set: { status: 1 }
    })))

    res.status(200).json({
        success: true,
        data: conv
    })
})

const getChatMessage = catchAsyncError(async (req, res, next) => {
    const userId = req.user._id;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    const isParticipant = conversation.participants.includes(userId);
    if (!isParticipant)
        return next(new ErrorHandler("Access Denied", 403))

    await Message.updateMany({
        conversation: conversationId,
        sender: { $ne: userId }
    }, {
        $set: { status: 2 }
    })
    const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        data: messages
    })
})

module.exports = {
    getFileUploadSignature,
    getChatList,
    getChatMessage
}