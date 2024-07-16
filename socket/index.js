const express = require('express')
const app = express();
const { Server } = require('socket.io')
const http = require('http')

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_BASE_URL,
        credentials: true
    }
})

io.on('connection', (socket) => {
    console.log("new user connected to socket")

    socket.on('disconnect', () => {
        console.log("one user dissconnected")
    })
})

module.exports = {
    server,
    app
}