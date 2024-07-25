const catchAsyncError = require('../middleware/catchAsyncError.middleware')
const cloudinary = require('cloudinary').v2

const getFileUploadSignature = catchAsyncError(async (req, res, next) => {
    const timestamp = Math.round((new Date).getTime() / 1000);
    const cloudinaryOptions = {
        timestamp,
        type: "private",
        folder: `chatMedia_${req.user._id}`
    }

    const signature = cloudinary.utils.api_sign_request({...cloudinaryOptions}, process.env.CLOUDINARY_API_SECRET);

    const payload = {
        ...cloudinaryOptions,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY,
        signature,
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    };

    res.json({ payload })
})

module.exports = { getFileUploadSignature }