const jwt = require('jsonwebtoken');
const User = require('./../Models/UserModel');
const mongoose = require('mongoose')

const Auth = async (req, resp, next) => {
  const authHeader = req.headers.authorization; // Lowercase 'authorization'
  // console.log('token', req.headers.authorization)
  
  try {
    if (!authHeader) {
      return resp.status(401).json({ status: false, message: 'Token missing in headers' });
    }

    const token = authHeader.replace('Bearer ', '').trim(); // Extract token from 'Bearer '
    console.log('token', token)

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Use secret key from environment variables
    console.log('decoded', decoded)

    const userId = new mongoose.Types.ObjectId(decoded._id);    // Find user by _id from the token
    const user = await User.findOne({_id: userId});
    console.log('user', user)

    if (!user) {
      return resp.status(401).json({ status: false, message: 'User not found' });
    }

    // Attach user information to request for use in next middleware
    req.user = user._id;
    
    // Call next() to proceed if everything is valid
    next();
  } catch (error) {
    console.error(error);
    return resp.status(401).json({ status: false, message: 'Invalid or expired token' });
  }
};

module.exports = Auth;
