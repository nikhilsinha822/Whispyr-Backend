const express = require('express')
const app = express();
const server = require('http').createServer(app)
require('dotenv').config()
const io = require('socket.io')(server, { cors: { origin: process.env.CLIENT_BASE_URL } })
const verifyJWT = require('./middleware/verifyJWT.middleware')
const Conversation = require('../models/conversation.model')
const socketConnectionHandler = require('./handlers/socketConnection.handler')
const messageHandler = require('./handlers/message.handler')

io.use(verifyJWT)

const userSocketMap = {} // {userEmail: socketId}

const onConnection = async (socket) => {
    const sender = socket.user; 
    userSocketMap[sender.email] = socket.id;
    const groupIds = await Conversation.find({
        participants: { $all: [sender._id] },
        type: 1,
    }).select('_id');

    groupIds.forEach(({ _id: groupId }) => {
        socket.join(groupId.toString());
    });

    io.emit('onlineUser', Object.keys(userSocketMap))
    console.log(`User connected: ${socket.user.email}, Socket ID: ${socket.id}`);

    const eventProps = { userSocketMap, groupIds }
    messageHandler(io, socket, eventProps);
    socketConnectionHandler(io, socket, eventProps);
}

io.on("connection", onConnection);

module.exports = {
    server,
    app
}