const mongoose = require('mongoose');

const PdfSchema = new mongoose.Schema({
  pdfName: {
    type: String,
    required: true,
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
