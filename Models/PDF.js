const mongoose = require('mongoose');

// Define fixed categories
const fixedCategories = ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'NodeJS', 'ExpressJS', 'MongoDB', 'MySQL', 'Bootstrap'];

const PdfSchema = new mongoose.Schema({
  pdfName: {
    type: String,
    required: true,
  },
  pdfPrice: {
    type: String,
    required: true, // Ensure price is provided
  },
  pdfLink: {
    type: String, // Store the file path or URL to the PDF
    required: true,
  }
});

const PDF = mongoose.model('PdfModel', PdfSchema)

module.exports = PDF
