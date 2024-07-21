const { wrapMiddleware } = require('./errorWrapper.middleware')
const ErrorHandler = require('../../utils/errorHandler.util')
const jwt = require('jsonwebtoken')
const User = require('../../models/user.model')

const verifyJWT = wrapMiddleware(async (socket, next) => {
    const token = socket.handshake.headers?.authorization || socket.handshake.headers?.Authorization;
    if (!token || !token.startsWith('Bearer '))
        return next(new ErrorHandler('Please login again', 401))

    const signedSecret = token.split(' ')[1]
    const decoded = jwt.verify(signedSecret, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findOne({ email: decoded.email }).select('-password');

    if (!user)
        return next(new ErrorHandler('Invalid credentials', 401));

    socket.user = user;
    next();
})

module.exports = verifyJWT