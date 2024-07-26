const express = require("express")
const router = express.Router();
const verifyJWT = require('../middleware/verifyJWT.middleware')
const { getFileUploadSignature,
    getChatList,
    getChatMessage
} = require('../controller/message.controller')

router.route('/fileUpload/new')
    .get(verifyJWT, getFileUploadSignature)

router.route('/chat/chatList')
    .get(verifyJWT, getChatList)

router.route('/chat/chatMessage/:conversationId')
    .get(verifyJWT, getChatMessage)


module.exports = router