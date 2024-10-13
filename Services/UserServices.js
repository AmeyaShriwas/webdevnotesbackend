const nodemailer = require("nodemailer");
const bcrypt = require('bcryptjs');
const User = require("./../Models/UserModel");
const jwt = require('jsonwebtoken');
const Transporter = require('./../Config');
const crypto = require('crypto')
const ContactUs = require('./../Models/ContactUsModel')

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP Email
const sendOtpEmail = async (email, otp, username) => {
  const mailOption = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Your OTP Code',
    text: `
  Dear ${username || 'User'},
  
  You have requested to reset your password. To complete the process, please use the following One-Time Password (OTP):
  
  OTP Code: ${otp}
  
  **Note**: This OTP is valid for the next 5 minutes. If you did not request a password reset, please ignore this email.
  
  If you need further assistance, feel free to reach out to our support team.
  
  Best regards,  
  The Webdev Notes Team
    `,
  };
  
  await Transporter.sendMail(mailOption);
};


// Find user by email service
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

// Auth Service for logging in the user
const loginUser = async (email, password, secret, expiresIn) => {
  try {
    // Find the user in the database by email
    const user = await User.findOne({ email });

    // If no user found, return an error
    if (!user) {
      return { error: "Invalid login credentials" };
    }

    // Check if the user is verified
    if (!user.isVerified) {
      throw new Error('User is not verified');
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: "Invalid login credentials" };
    }

    // Generate a JWT token for the logged-in user
    const token = jwt.sign({ _id: user._id.toString() }, secret, { expiresIn: '7d' });

    // Return the user details, including name, email, and number
    return {
      message: 'Login successful',
      token,
      user: {
        name: user.name,
        email: user.email,
        number: user.number // Make sure number is included here
      }
    };
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

const ContactUsServices = async(data)=> {
   const {name, email, message} = data;

   try{
    const newMessage = new ContactUs({
      name: name,
      email: email,
      message: message
    })
    await newMessage.save()
    return {status: true, message: 'Message sent successfully'}

   }
   catch(error){
    return {status: false, message: error}
   }
}


module.exports = {
  generateOTP,
  sendOtpEmail,
  findUserByEmail,
  createUser,
  verifyUserOtp,
  loginUser,
  updateOtpForUser,
  updateUserPassword,
  ContactUsServices
};
