const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../Models/UserModel');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const PDF = require('./../Models/PDF')
const path = require('path'); // Ensure path is imported


const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET,
});

const createRazorpayOrder = async (amount) => {
    const options = {
        amount: Number(amount * 100), // Convert to paise
        currency: "INR",
        receipt: crypto.randomBytes(10).toString("hex"),
    };

    return new Promise((resolve, reject) => {
        razorpayInstance.orders.create(options, (error, order) => {
            if (error) {
                console.log('Razorpay order creation error:', error);
                return reject(error);
            }
            resolve(order);
        });
    });
};

const verifyRazorpaySignature = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(sign.toString())
        .digest("hex");

    return expectedSign === razorpay_signature;
};

const AdminGrantAccessService = async (userId) => {
    console.log('id', userId)
    try {
        const findUser = await User.findOne({_id: userId});  // Directly passing the userId
        if (findUser) {
            findUser.role = 'admin';
            await findUser.save();
            return { status: true, message: 'User role updated to admin' };
        } else {
            return { status: false, message: 'Failed to find user yes' };
        }
    } catch (error) {
        return { status: false, message: 'Internal server error' };
    }
};


// Auth Service for logging in the user
const AdminServicesloginUser = async (email, password, secret, expiresIn) => {
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

      if(user.role !== 'admin'){
         return {error: "invalid admin credentials"}
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

  const UploadPdfService = async (pdfFile, imageFile, fileData) => {
    const { pdfName, pdfPrice, pdfSubTypes } = fileData;
  
    try {
      // Check if the file or file path is missing
      if (!pdfFile || !pdfFile.path) {
        return { status: false, message: 'No PDF file path provided' };
      }
  
      if (!imageFile || !imageFile.path) {
        return { status: false, message: 'No image file path provided' };
      }
  
      // Check if a PDF with the same name already exists
      const existingPdf = await PDF.findOne({ pdfName });
      if (existingPdf) {
        return { status: false, message: 'PDF with this name already exists' };
      }
  
      // Create relative file paths for saving to the database
      const pdfPath = `/uploads/${pdfFile.filename}`; // Store relative path for the PDF
      const imagePath = `/uploads/${imageFile.filename}`; // Store relative path for the image
  
      // Create a new PDF entry in the database
      const newPdfData = new PDF({
        pdfName: pdfName,
        pdfPrice: pdfPrice,
        pdfLink: pdfPath, // Storing the relative PDF file path
        pdfImg: imagePath, // Storing the relative image file path
        pdfSubTypes: JSON.parse(pdfSubTypes), // Assuming subcategories is a JSON string
      });
  
      await newPdfData.save();
      return { status: true, message: 'PDF uploaded successfully' };
  
    } catch (error) {
      console.error('Error while saving PDF:', error);
      return { status: false, message: error.message };
    }
  };
  

module.exports = {
    createRazorpayOrder,
    verifyRazorpaySignature,
    AdminGrantAccessService,
    AdminServicesloginUser,
    UploadPdfService
};
