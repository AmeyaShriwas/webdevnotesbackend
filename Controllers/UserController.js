const authService = require("./../Services/UserServices");
const jwt = require('jsonwebtoken')
const User = require('./../Models/UserModel');
const ContactUs = require("../Models/ContactUs");

const signUpUser = async (req, res) => {
  const { name,email,number, password } = req.body;
  console.log('req.body', req.body)
  
  try {
    const existingUser = await authService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    const result = await authService.createUser(name,email,number, password);
    res.status(201).json({ success: true, message: result.message });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const isValid = await authService.verifyUserOtp(email, otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    } else {
      res.status(200).json({ message: "OTP verified successfully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { user, token, error } = await authService.loginUser(email, password, process.env.JWT_SECRET, "1h");

    if (error) {
      return res.status(400).json({ error });
    }

    res.status(200).json({ message: 'login successful', token, user });
  } catch (error) {
    res.status(500).json({success: false, error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    const otp = authService.generateOTP();
    await authService.updateOtpForUser(user, otp);

    res.send({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).send(error);
  }
};

const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;


  try {
    const user = await authService.findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "User with this email does not exist" });
    }

    const isValidOtp = await authService.verifyUserOtp(email, otp);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    await authService.updateUserPassword(user, newPassword);
    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).send(error);
  }
};

const verifyToken = async(req, res)=> {
    try {
        const authHeader = req.header("Authorization");
        
        if (!authHeader) {
          return res.status(401).json({ message: "Authorization header is missing" });
        }
    
        const token = authHeader.replace("Bearer ", "").trim();
    
        if (!token) {
          return res.status(401).json({ message: "Token is missing" });
        }
    
        let decoded;
        try {
          decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
          console.error("Invalid token:", error);
          return res.status(401).json({ message: "Invalid token" });
        }
    
      
        const user = await User.findById(decoded._id);
    
        if (user) {
          return res.status(200).json({ message: "token verified" });
        }
        else{
            return res.status(401).json({ message: "User not found" });
        }
    
       
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Please authenticate." });
      }
}

const contactUs = async (req, resp) => {
  const { name, email, message } = req.body;

  try {
    // Ensure you're passing the data as an object
    const result = await ContactUsServices({ name, email, message });

    if (!result.status) {
      return resp.status(400).json({ message: result.message }); // Return the actual error message from the service
    } else {
      return resp.status(200).json({ message: "Message successfully sent" }); // Corrected 'sended' to 'sent'
    }
  } catch (error) {
    console.error('Error in contactUs:', error); // More descriptive error logging
    resp.status(500).json({ message: 'internal server error' }); // Generic error message to the user
  }
};

const getContactUsMessage = async(req, resp)=> {
    try{
      const findMessage = await ContactUs.find();
      resp.json({status: true, data: findMessage})
    }
    catch(error){
      resp.json({status: false})
    }
}
module.exports = { signUpUser, verifyOtp, loginUser, forgotPassword, resetPassword, verifyToken, contactUs, getContactUsMessage };
