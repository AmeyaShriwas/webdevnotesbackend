const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const User = require("./../Models/UserModel");
const jwt = require('jsonwebtoken');
const Transporter = require('./../config');

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOtpEmail = async(email, otp) => {
    
  const mailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your One Time Password (OTP) Code',
    text: `Dear User, Your One-Time-Password (OTP) code for account verification is: ${otp}\n\nThis OTP is valid for the next 5 minutes. Please use it to complete the verification process.\n\nIf you didn't request this OTP, please ignore this email.\n\nBest regards,\nAmeya Shriwas`
  };
  await Transporter.sendMail(mailOption);
};

// Find user by email
const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

// Create new user and handle OTP expiration
const createUser = async (name,email,number, password) => {
  
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Generate an OTP
    const otp = generateOTP();
    // Create a new user
    const newUser = new User({ name, email, number, password: hashedPassword, otp });
    console.log('new user', newUser)
    await newUser.save();
    // Send OTP email
    await sendOtpEmail(email, otp);

    // Set a timer to delete the user after 5 minutes if not verified
    setTimeout(async () => {
      const findUser = await User.findOne({ email: email });
      
      // Check if the user is verified
      if (findUser && !findUser.isVerified) {
        // Delete the user if not verified within 5 minutes
        console.log('deleted user')
        await User.deleteOne({ email: email });
      }
    }, 3000000); // 5 minutes in milliseconds

    return { success: true, message: "User registered, OTP sent to email", newUser };
  } catch (error) {
    console.log('error', error)
    throw new Error("Failed to create user: " + error.message);
  }
};

// Verify user OTPupdat
const verifyUserOtp = async (email, otp) => {
  const user = await User.findOne({ email });
  console.log('user', user)
  if (user && user.otp === otp) {
    user.isVerified = true;
    await user.save();
    return true;
  }
  return false;
};

// Log in user
const loginUser = async (email, password, secret, expiresIn) => {
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return { error: "Invalid login credentials" };
    }
    if (!user.isVerified) {
      throw new Error('User is not verified');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid login credentials" };
    }

    const token = jwt.sign({ _id: user._id.toString() }, secret, { expiresIn: '7d' });
    return { message: 'Login successful', token, user: user.name };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update OTP for user
const updateOtpForUser = async (user, otp) => {
  
  user.otp = otp;
  await user.save();
  await sendOtpEmail(user.email, otp);
};

// Update user password
const updateUserPassword = async (user, newPassword) => {
  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = "";
  await user.save();
};

module.exports = {
  generateOTP,
  sendOtpEmail,
  findUserByEmail,
  createUser,
  verifyUserOtp,
  loginUser,
  updateOtpForUser,
  updateUserPassword,
};
