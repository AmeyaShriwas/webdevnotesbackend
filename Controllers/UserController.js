const authService = require("./../Services/UserServices");
const jwt = require('jsonwebtoken')
const User = require('./../Models/UserModel');

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


// Controller for handling login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Call the service function to log in the user
    const { user, token, error } = await authService.loginUser(email, password, process.env.JWT_SECRET, "1h");

    // Check for any login errors
    if (error) {
      return res.status(400).json({ error });
    }

    // Respond with user details, token, and number
    res.status(200).json({
      message: 'Login successful',
      token,
      user: user.name,
      email: user.email,
      number: user.number // Include the number here
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
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

const contactUsController = async (req, resp) => {
  const { name, message } = req.body;
  const userId = req.user;

  try {
    const findUser = await User.findById(userId);
    if (!findUser) {
      return resp.status(404).json({ message: 'User not found' });
    }

    // Pass arguments as an object to ContactUsServices
    const result = await authService.ContactUsServices({ name, userId, message });
    
    if (result.status) {
      resp.status(200).json({ message: result.message });
    } else {
      resp.status(400).json({ message: result.message });
    }
  } catch (error) {
    console.error(error);
    resp.status(500).json({ message: 'Internal server error' });
  }
};

const getContactUsController = async(req, resp) => {
  try {
    const result = await authService.getContactUsServices()
    if(!result.status) {
      resp.status(400).json({status: false, message: 'error in getting messages'})
    } else {
      // Access result.data properly here
      resp.status(200).json({status: true, message: 'successfully got messages', data: result.data})
    }
  }
  catch(error) {
    resp.status(400).json({status: false, message: 'error in getting messages'})
  }
}


module.exports = { signUpUser, verifyOtp, loginUser, forgotPassword, resetPassword, verifyToken, contactUsController, getContactUsController};
