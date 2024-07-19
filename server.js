const express = require("express")
const { app, server } = require('./socket')
require('dotenv').config()
const PORT = process.env.PORT || 3500
const cors = require('cors')
const errorMiddleware = require('./middleware/catchAsyncError.middleware')

app.use(cors({
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.all('*', (req, res)=>{
    res.status(404);
    if(req.accepts('.html')){
        res.sendFile(path.join(__dirname, "view", "404.html"));
    } else if(req.accepts('.json')) {
        res.json({
            message: "requested page not found"
        })
    } else {
        res.type('.txt').send("404! Not found");
    }
})

app.use(errorMiddleware);

server.listen(PORT, () => {
    console.log(`Server is running at PORT ${PORT}`);
})