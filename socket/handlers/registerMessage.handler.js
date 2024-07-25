const Conversation = require('../../models/conversation.model')
const Message = require('../../models/message.models')
const User = require('../../models/user.model')
const { wrapHandler } = require('../middleware/errorWrapper.middleware')
const { ObjectId } = require('mongodb')

const registerMessageHandler = (io, socket, eventProps) => {
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
            conversation: convResp._id
        })

        await Conversation.findByIdAndUpdate(convResp._id, {
            lastMessage: msgResp._id
        })

        if (userSocketMap[receiverEmail])
            io.to(userSocketMap[receiverEmail]).emit('receive:newMessage', msgResp)

        socket.emit('messageSent', { success: true, messageId: msgResp._id });
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
            conversation: conversationId
        })

        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: msgResp._id
        })

        socket.to(conversationId).emit('receive:newMessage', msgResp)

        socket.emit('messageSent', { success: true, messageId: msgResp._id });
    }

    const handleMessageSeen = async (payload) => {
        const messageID = ObjectId.createFromHexString(payload.messageID)
        if (!messageID)
            throw new Error("Message ID is required for status update")

        const result = await Message.findOneAndUpdate(
            { _id: messageID, status: { $lt: 2 } },
            { $set: { status: 2 } },
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
            { _id: messageID, status: 0 },
            { $set: { status: 1 } },
            { new: true }
        ).populate('sender')

        console.log(messageID, await Message.findById(messageID))
        if (userSocketMap[result.sender.email])
            io.to(userSocketMap[result.sender.email]).emit("receive:receivedMessage", result);
    }

    const handleMessage = (payload) => payload.type === 1 ? handleGroupMessage(payload) : handleIndividualMessage(payload);

    socket.on('send:newMessage', wrapHandler(socket, handleMessage))
    socket.on('send:seenMessage', wrapHandler(socket, handleMessageSeen));
    socket.on('send:receivedMessage', wrapHandler(socket, handleMessageReceived));
}

module.exports = registerMessageHandler