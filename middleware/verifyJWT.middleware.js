const catchAsyncError = require('../middleware/catchAsyncError.middleware')
const jwt = require('jsonwebtoken')
const ErrorHandler = require("../utils/errorHandler.util")
const User = require('../models/user.model')

const verifyJWT = catchAsyncError(async (req, res, next) => {
    const tokenHeaders = req.headers?.authorization || req.headers?.Authorization;
    
    if(!tokenHeaders || !tokenHeaders.startsWith('Bearer '))
        next(new ErrorHandler("Invalid Token.", 401));
    
    const token = tokenHeaders.split(' ')[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded._id).select('-password');
    if(!user)
        next(new ErrorHandler("User not found.", 401));

    req.user = user;
    next();
})

module.exports = verifyJWT;