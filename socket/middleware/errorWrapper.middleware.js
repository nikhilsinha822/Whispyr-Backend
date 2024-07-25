const wrapMiddleware = (func) => (socket, next) => {
    Promise.resolve(func(socket, next)).catch(error => {
        console.error('Middleware error:', error);
        next(error);
    });
}

const wrapHandler = (socket, func) => (...args) => {
    Promise.resolve(func(...args)).catch(error => {
        socket.emit("error", {success: false, error: error.message})
        console.error('Handler error:', error);
    });
}

module.exports = {
    wrapMiddleware,
    wrapHandler
}