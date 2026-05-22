const fs = require('fs');
const path = require('path');
const imageService = require('../services/imageService');
const aiService = require('../services/aiService');
const { parseAIResponse } = require('../utils/responseParser');

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let imagePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === '.pdf') {
      imagePath = await imageService.convertPdfToImage(imagePath);
      // Delete the original PDF file
      fs.unlinkSync(req.file.path);
    } else if (!['.png', '.jpg', '.jpeg'].includes(fileExtension)) {
      return res.status(400).json({ error: 'Unsupported file format. Please upload a PDF or image file.' });
    }

    const aiAnalysis = await aiService.analyzeImageWithAI(imagePath);
    const diagnosisResult = parseAIResponse(aiAnalysis);

    // Clean up the uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      ...diagnosisResult,
      aiAnalysis // Include the full AI analysis for detailed display
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the image' });
  }
};
