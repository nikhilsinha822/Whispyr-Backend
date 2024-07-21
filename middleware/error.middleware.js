const ErrorHandler = require('../utils/errorHandler.util')

const error = (error, req, res, next) => {
    error.message = error.message || error.error.description || "Internal Server Error";
    error.statusCode = error.statusCode || 500;

    if (error.name === "CastError") {
        const message = `Resource not found. Invalid: ${error.path}`;
        error = new ErrorHandler(message, 400);
    }
    else if(error.name === 'TokenExpiredError'){
        // console.log("Token Expired")
        const message = "Token Expired. Please login again";
        error = new ErrorHandler(message, 401);
    }
    else if (error.code === 11000) {
        const message = `Duplicate ${Object.keys(error.keyValue)} Entered`;
        error = new ErrorHandler(message, 400);
    }

    res.status(error.statusCode).json({
        success: false,
        message: error.message
    })
}

module.exports = error