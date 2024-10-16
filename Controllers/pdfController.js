const PdfService = require('../services/pdf.service');

// Upload a PDF
exports.uploadPdf = async (req, res) => {
  try {
    const { pdfName, pdfPrice } = req.body;
    const pdfLink = req.file.path; // Multer saves the file and adds `file` to `req`

    const newPdf = await PdfService.createPdf({ pdfName, pdfPrice, pdfLink });
    res.status(201).json({ message: 'PDF uploaded successfully', data: newPdf });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading PDF', error: error.message });
  }
};

