const { wrapHandler } = require('../middleware/errorWrapper.middleware')

const socketConnectionHandler = (io, socket, eventProps) => {
    const { userSocketMap, groupIds } = eventProps;

    const reconnectSocket = () => {
        userSocketMap[socket.user.email] = socket.id;
        io.emit('onlineUser', Object.keys(userSocketMap));
        console.log(`User reconnected: ${socket.user.email}, New Socket ID: ${socket.id}`);
    }

    const disconnectSocket = () => {
        delete userSocketMap[socket.user.email]
        groupIds.forEach(({ _id: groupId }) => {
            socket.leave(groupId.toString());
        });

        io.emit('onlineUser', Object.keys(userSocketMap))
        console.log(`User disconnected: ${socket.user.email}, Socket ID: ${socket.id}`);
    }

    socket.on("reconnect", wrapHandler(socket, reconnectSocket));
    socket.on("disconnect", wrapHandler(socket, disconnectSocket));
}

module.exports = socketConnectionHandler