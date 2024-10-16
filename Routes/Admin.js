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

// File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept file
  } else {
    cb(new Error('Only PDF files are allowed!'), false); // Reject non-PDF file
  }
};

// Limit file size to 20MB (adjusted based on your comment)
const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: fileFilter,
});

// Routes
router.post('/admin/grantAdminAccess', Auth, AdminController.AdminAccessController);
router.post('/order', Auth, AdminController.createOrder);
router.post('/verify', AdminController.verifyPayment);
router.get('/getAllOrders', AdminController.getAllOrders);
router.post('/admin/login', AdminController.AdminloginUser);

// Upload PDF route
router.post('/upload', upload.single('file'), AdminController.uploadPdf);

module.exports = router;
