const mongoose = require('mongoose');

// Define fixed categories
const fixedCategories = ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'NodeJS', 'ExpressJS', 'MongoDB', 'MySQL', 'Bootstrap'];

const PdfSchema = new mongoose.Schema({
  pdfName: {
    type: String,
    required: true,
    unique: true, // Ensure uniqueness to avoid duplicates
    enum: fixedCategories, // Ensure pdfName is one of the fixed categories
  },
  pdfPrice: {
    type: Number,
    required: true,
  },
  pdfLink: {
    type: String, // Store the file path or URL
    required: true,
  }
});

module.exports = mongoose.model('PDF', PdfSchema);
