const express = require('express');
const router = express.Router();
const AdminController = require('./../Controllers/AdminController');
const Auth = require('./../Middleware/Auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/pdf'); // Directory to store PDFs
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // Store file with a unique name
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
  limits: { fileSize: 1024 * 1024 * 20 }, // 20MB limit
  fileFilter: fileFilter,
});


router.post('/admin/grantAdminAccess', Auth, AdminController.AdminAccessController)
router.post('/order', Auth, AdminController.createOrder);
router.post('/verify', AdminController.verifyPayment);
router.get('/getAllOrders', AdminController.getAllOrders);
router.post('/admin/login', AdminController.AdminloginUser);


router.post('/upload', upload.single('pdf'), AdminController.uploadPdf);

module.exports = router;
