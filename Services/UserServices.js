const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const User = require("./../Models/UserModel");
const jwt = require('jsonwebtoken');
const Transporter = require('./../Config');
const crypto = require('crypto')

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOtpEmail = async(email, otp) => {

  const resetToken = crypto.randomBytes(32).toString('hex')
  const resetTokenExpires = Date.now() + 5 * 60 * 1000
    

  // Save the token and expiration time in the user's record
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = resetTokenExpires;
  await user.save()

  const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}`; // Adjust port as necessary


  const mailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Your OTP Code',
    text: `
  Dear ${username || 'User'},
  
  You have requested to reset your password. To complete the process, please use the following One-Time Password (OTP):
  
  OTP Code: ${otp}
  
  Alternatively, you can reset your password by clicking the link below:
  
  Reset Link: ${resetLink}
  
  **Note**: This OTP and link are valid for the next 5 minutes. If you did not request a password reset, please ignore this email.
  
  If you need further assistance, feel free to reach out to our support team.
  
  Best regards,  
  The [Your Company] Team
    `,
  };
  
  console.log('mail', mailOption)
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
