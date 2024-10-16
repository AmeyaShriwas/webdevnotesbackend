const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/UserController");
const Auth = require('./../Middleware/Auth')
const User  = require('./../Models/UserModel')

router.post("/signup", authController.signUpUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-Token', authController.verifyToken)
router.post('/contactUs', Auth, authController.contactUsController)
router.get('/getContactUs', authController.getContactUsController)



module.exports = router;
