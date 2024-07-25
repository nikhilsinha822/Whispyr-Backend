const express = require("express")
const router = express.Router();
const { getFileUploadSignature } = require('../controller/message.controller')
const verifyJWT = require('../middleware/verifyJWT.middleware')

router.route('/fileUpload/new')
    .get(verifyJWT, getFileUploadSignature)

module.exports = router