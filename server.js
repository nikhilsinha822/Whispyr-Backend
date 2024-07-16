const express = require("express")
const { app, server } = require('./socket')
require('dotenv').config()
const PORT = process.env.PORT || 3500
const cors = require('cors')

app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



server.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
})