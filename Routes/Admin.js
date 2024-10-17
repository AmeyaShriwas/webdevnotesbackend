const express = require('express');
const router = express.Router();
const AdminController = require('./../Controllers/AdminController');
const Auth = require('./../Middleware/Auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = './uploads';

// Create 'uploads' folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config for storing PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Store in 'uploads' directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Create unique file name
  }
});

// File filter to allow only PDFs and Images (jpeg, png)
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only PDF and image files are allowed!'), false); // Reject other files
  }
};

// Limit file size to 50MB (adjust this value as needed)
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // Increased limit to 50MB
  fileFilter: fileFilter,
});

// Routes
router.post('/admin/grantAdminAccess', Auth, AdminController.AdminAccessController);
router.post('/order', Auth, AdminController.createOrder);
router.post('/verify', AdminController.verifyPayment);
router.get('/getAllOrders', AdminController.getAllOrders);
router.post('/admin/login', AdminController.AdminloginUser);

// Upload PDF route
// Handle both single image and single PDF upload
router.post('/upload', upload.fields([
  { name: 'file', maxCount: 1 },  // Single PDF upload
  { name: 'pdfImg', maxCount: 1 } // Single image upload
]), AdminController.uploadPdf);

module.exports = router;
