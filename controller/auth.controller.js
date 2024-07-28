const ErrorHandler = require('../utils/errorHandler.util')
const catchAsyncError = require('../middleware/catchAsyncError.middleware')
const User = require('../models/user.model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { sendEmail } = require('../utils/sendEmail.util')
const verficationTemplate = require('../public/emailTemplates/verificationEmail.template')
const resetPasswordTemplate = require('../public/emailTemplates/passwordReset.template')

const login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new ErrorHandler("Missing required fields", 400))

    const user = await User.findOne({ email: email });
    if(!user)
        return next(new ErrorHandler('Wrong email or password', 401))

    const isValidPass = bcrypt.compareSync(password, user.password);
    if (!isValidPass)
        return next(new ErrorHandler('Wrong email or password', 401))

    const accessToken = sendToken(res, { email: email, _id: user._id });

    res.status(200).json({
        success: true,
        message: "Successfully logged In",
        data: { accessToken, user: user.email }
    })
})

const register = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new ErrorHandler("Missing required fields", 400))

    if (!validateEmail(email))
        return next(new ErrorHandler("Invalid Email address", 400));

    const duplicateUser = await User.findOne({ email: email });

    if (duplicateUser) {
        if (!duplicateUser.isVerified)
            await duplicateUser.deleteOne();
        else
            return next(new ErrorHandler('You are already registerd. Please login.', 400))
    }

    const saltRounds = 10;
    const hashPassword = bcrypt.hashSync(password, saltRounds);

    await User.create({
        email: email,
        password: hashPassword
    })

    const token = jwt.sign({ email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '5m' })

    await sendEmail({
        to: email,
        subject: "Email Verification",
        html: verficationTemplate(`${process.env.CLIENT_BASE_URL}/verifyEmail?token=${token}`)
    })

    res.status(200).json({
        success: true,
        message: "Sent the verification link. Please check your email."
    })
})

const verifyEmail = catchAsyncError(async (req, res, next) => {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded)
        return next(new ErrorHandler('Invalid Token', 401))

    const user = await User.findOne({ email: decoded.email });

    user.isVerified = true;
    await user.save();

    const accessToken = sendToken(res, { email: user.email, _id: user._id });

    res.status(200).json({
        success: true,
        message: "Email verification success.",
        data: { accessToken, email: user.email }
    });
})

const forgetPassword = catchAsyncError(async (req, res, next) => {
    const email = req.body.email;
    if (!email)
        return next(new ErrorHandler("Email is required", 400));

    const user = await User.findOne({ email: email });
    if (!user)
        return next(new ErrorHandler("Account not found", 400));

    const token = jwt.sign({ email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '5m' })
    sendEmail({
        to: user.email,
        subject: "Reset Password",
        html: resetPasswordTemplate(`${process.env.CLIENT_BASE_URL}/resetPassword?token=${token}`)
    })

    res.status(200).json({
        success: true,
        message: "Password reset link is sent. Please check your email.",
        data: { accessToken, email: user.email }
    })
})

const changePassword = catchAsyncError(async (req, res, next) => {
    const token = req.query.token;
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded)
        return next(new ErrorHandler('Invalid Token', 401))

    const password = req.body.password;
    if (!password)
        return next(new ErrorHandler("Password is required", 400));

    const user = await User.findOne({ email: decoded.email });
    const hashedPassword = bcrypt.hashSync(password, 10);

    user.password = hashedPassword;
    await user.save();

    const accessToken = sendToken(res, { email: user.email, _id: user._id });
    res.status(200).json({
        success: true,
        message: "Password updated successfully",
        data: { accessToken, email: user.email }
    })
})

const validateEmail = (email) => {
    return String(email)
        .toLowerCase()
        .match(
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        );
};

const sendToken = (res, payload) => {
    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '10d' }
    )

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '12h' }
    )

    res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'None',
        secore: true,
        maxAge: 12 * 60 * 60 * 1000
    })

    return accessToken;
}

module.exports = {
    login,
    register,
    verifyEmail,
    forgetPassword,
    changePassword
}