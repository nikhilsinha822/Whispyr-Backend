const express = require("express")
const { app, server } = require('./socket')
require('dotenv').config()
const PORT = process.env.PORT || 3500
const cors = require('cors')
const errorMiddleware = require('./middleware/error.middleware')
const connectDB = require('./config/connDb.config')
const mongoose = require('mongoose')
const path = require('path')
const cloudinary = require('cloudinary').v2
const fileUpload = require('express-fileupload')
const cookieParser = require('cookie-parser')

connectDB();

app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
}))

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

app.use('/', express.static(path.join(__dirname, 'public')))

app.use('/auth', require('./routes/auth.route'))
app.use('/api', require('./routes/message.route'))

app.all('*', (req, res) => {
    res.status(404);
    if (req.accepts('.html')) {
        res.sendFile(path.join(__dirname, "view", "404.html"));
    } else if (req.accepts('.json')) {
        res.json({
            message: "requested page not found"
        })
    } else {
        res.type('.txt').send("404! Not found");
    }
})

app.use(errorMiddleware);

mongoose.connection.once('open', () => {
    console.log("DB connected");
    server.listen(PORT, () => {
        console.log(`Server is running at PORT ${PORT}`);
    })
})
