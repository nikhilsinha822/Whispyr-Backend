const Conversation = require('../../models/conversation.model')
const Message = require('../../models/message.models')
const User = require('../../models/user.model')
const { wrapHandler } = require('../middleware/errorWrapper.middleware')
const { ObjectId } = require('mongodb')

const MessageHandler = (io, socket, eventProps) => {
    const { userSocketMap } = eventProps;

    const handleIndividualMessage = async (payload) => {
        const { receiverEmail, text, assets } = payload;
        if (!receiverEmail || (!text && (!assets || assets.length === 0)))
            throw new Error("Invalid input: missing message or receiver");

        const receiver = await User.findOne({ email: receiverEmail }).select('_id')
        if (!receiver)
            throw new Error("User not found")

        const receiverId = receiver._id;
        const senderId = socket.user._id;

        const newConversation = {
            name: `${receiver.email}`,
            participants: [senderId, receiverId],
            type: 0,
            lastMessage: null
        }

        const convResp = await Conversation.findOneAndUpdate({
            participants: {
                $all: [
                    { "$elemMatch": { $eq: senderId } },
                    { "$elemMatch": { $eq: receiverId } }
                ],
            },
            type: 0
        }, newConversation, {
            new: true,
            upsert: true
        })

        const msgResp = await Message.create({
            text: text || '',
            assets: assets || [],
            sender: senderId,
            conversation: convResp._id,
            readBy: [
                { user: senderId, status: 2, timestamp: new Date() },
                { user: receiverId, status: 0, timestamp: new Date() }
            ]
        })

        const updatedConversation = await Conversation.findByIdAndUpdate(convResp._id, {
            lastMessage: msgResp._id
        }, { new: true }).populate('participants', 'name email _id').populate('lastMessage')

        msgResp.conversation = updatedConversation

        if (userSocketMap[receiverEmail])
            io.to(userSocketMap[receiverEmail]).emit('receive:newMessage', msgResp)

        socket.emit('messageSent', { success: true, message: msgResp });
    }

    const handleGroupMessage = async (payload) => {
        const { conversationId, text, assets } = payload;
        const senderId = socket.user._id;

        if (!conversationId || (!text && (!assets || assets.length === 0)))
            throw new Error("Invalid input: missing message or conversationId");

        const conversation = await Conversation.findById(conversationId);
        if (!conversation)
            throw new Error("group not found")

        const isMember = conversation.participants.includes(senderId)
        if (!isMember)
            throw new Error("Unauthorized")

        const msgResp = await Message.create({
            text: text || '',
            assets: assets || [],
            sender: senderId,
            conversation: conversationId,
            readBy: conversation.participants.map(participantId => ({
                user: participantId,
                status: participantId.equals(senderId) ? 2 : 0,
                timestamp: new Date()
            }))
        })

        const updatedConversation = await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: msgResp._id
        }, { new: true }).populate('participants', 'name email _id').populate('lastMessage')

        msgResp.conversation = updatedConversation

        socket.to(conversationId).emit('receive:newMessage', msgResp)

        socket.emit('messageSent', { success: true, message: msgResp });
    }

    const handleMessageSeen = async (payload) => {
        const messageID = ObjectId.createFromHexString(payload.messageID)
        if (!messageID)
            throw new Error("Message ID is required for status update")

        const result = await Message.findOneAndUpdate(
            {
                _id: messageID,
                'readBy.user': socket.user._id,
                'readBy.status': { $lt: 2 }
            },
            {
                $set: { 'readBy.$.status': 2, 'readBy.$.timestamp': new Date() }
            },
            { new: true }
        ).populate('sender')

        if (userSocketMap[result.sender.email])
            io.to(userSocketMap[result.sender.email]).emit("receive:seenMessage", result);
    }

    const handleMessageReceived = async (payload) => {
        const messageID = ObjectId.createFromHexString(payload.messageID)
        if (!messageID)
            throw new Error("Message ID is required for status update")

        const result = await Message.findOneAndUpdate(
            {
                _id: messageID,
                'readBy.user': socket.user._id,
                'readBy.status': 0
            },
            {
                $set: { 'readBy.$.status': 1, 'readBy.$.timestamp': new Date() }
            },
            { new: true }
        ).populate('sender')

        if (userSocketMap[result.sender.email])
            io.to(userSocketMap[result.sender.email]).emit("receive:receivedMessage", result);
    }

    const handleMessage = (payload) => payload.type === 1 ? handleGroupMessage(payload) : handleIndividualMessage(payload);

    socket.on('send:newMessage', wrapHandler(socket, handleMessage))
    socket.on('send:seenMessage', wrapHandler(socket, handleMessageSeen));
    socket.on('send:receivedMessage', wrapHandler(socket, handleMessageReceived));
}

module.exports = MessageHandler