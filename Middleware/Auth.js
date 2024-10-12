const jwt = require('jsonwebtoken');
const User = require('./../Models/UserModel');

const Auth = async (req, resp, next) => {
    const authHeader = req.headers.Authorization; // get the Authorization header

    try {
        if (!authHeader) {
            return resp.status(401).json({ status: false, message: 'Token missing in headers' });
        }

        // const token = authHeader.replace("Bearer ", "").trim(); // Extract token from 'Bearer '

        // Verify and decode token
        const decoded = jwt.verify(authHeader, process.env.JWT_SECRET); // Ensure you have a secret key set in environment variables

        // Find user by _id from the token
        const user = await User.findById(decoded._id);

        if (!user) {
            return resp.status(401).json({ status: false, message: 'User not found' });
        }

        // Attach user information to request for use in next middleware
        req.user = user;
        
        // Call next() to proceed if everything is valid
        next();
    } catch (error) {
        console.error(error);
        return resp.status(401).json({ status: false, message: 'Invalid or expired token' });
    }
};

module.exports = Auth;
