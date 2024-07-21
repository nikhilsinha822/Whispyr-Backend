const express = require('express')
const app = express();

const cors = {
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
}
const server = require('http').createServer(app)
const io = require('socket.io')(server, cors)

const verifyJWT = require('./middleware/verifyJWT.middleware')
const socketConnectionHandler = require('./handlers/socketConnection.handler')

io.use(verifyJWT)

const userSocketMap = {} // {userEmail: socketId}
const groupMap = {} // {groupId: [userEmail]}

const onConnection = (socket) => {
    userSocketMap[socket.user.email] = socket.id
    
    io.emit('onlineUser', Object.keys(userSocketMap))
    console.log(`User connected: ${socket.user.email}, Socket ID: ${socket.id}`);

    const eventProps = {
        userSocketMap,
        groupMap,
    }

    socketConnectionHandler(io, socket, eventProps);
}

io.on("connection", onConnection);

module.exports = {
    server,
    app
}