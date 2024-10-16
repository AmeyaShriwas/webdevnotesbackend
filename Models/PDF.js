const mongoose = require('mongoose');

// Define fixed categories
const fixedCategories = ['HTML', 'CSS', 'JavaScript', 'ReactJS', 'NodeJS', 'ExpressJS', 'MongoDB', 'MySQL', 'Bootstrap'];

const PdfSchema = new mongoose.Schema({
  pdfName: {
    type: String,
    required: true,
  },
  pdfPrice: {
    type: Number,
    required: true, // Ensure price is provided
  },
  pdfLink: {
    type: String, // Store the file path or URL to the PDF
  }
});

const PDF = mongoose.model('PDF', PdfSchema)

module.exports = PDF
