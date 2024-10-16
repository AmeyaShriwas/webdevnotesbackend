const express = require('express');
const router = express.Router();
const AdminController = require('./../Controllers/AdminController');
const Auth = require('./../Middleware/Auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadDir = './uploads';

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir); // Create 'uploads' folder if it doesn't exist
}

// Multer config for storing PDFs
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // Ensure correct file path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Store the file with a unique name
  }
});
  
  // File filter to allow only PDFs
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

// Limit file size to 20MB
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB,
  fileFilter: fileFilter,
});

  


router.post('/admin/grantAdminAccess', Auth, AdminController.AdminAccessController)
router.post('/order', Auth, AdminController.createOrder);
router.post('/verify', AdminController.verifyPayment);
router.get('/getAllOrders', AdminController.getAllOrders);
router.post('/admin/login', AdminController.AdminloginUser);


router.post('/upload', upload.single('file'), AdminController.uploadPdf);

module.exports = router;
