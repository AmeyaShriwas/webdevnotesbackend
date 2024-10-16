const PDF = require('./../Models/PDF');

// Create a new PDF entry
exports.createPdf = async (pdfData) => {
  const pdf = new PDF(pdfData);
  return await pdf.save();
};

