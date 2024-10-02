const express = require("express");
const router = express.Router();
const authController = require("./../Controllers/UserController");

router.post("/signup", authController.signUpUser);
router.post('/verify-otp', authController.verifyOtp);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.post('/verify-Token', authController.verifyToken)

module.exports = router;
