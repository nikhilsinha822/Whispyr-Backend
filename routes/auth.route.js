const { login, register, verifyEmail, forgetPassword, changePassword } = require('../controller/auth.controller');
const express = require('express')
const router = express.Router();

router.route('/login').post(login)

router.route('/register').post(register)

router.route('/verifyEmail').post(verifyEmail)

router.route('/forget-password').post(forgetPassword)

router.route('/reset-password').post(changePassword)

module.exports = router
