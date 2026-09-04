const fs = require("fs");
const path = require("path");
const aiService = require("../services/aiService");
const { parseAIResponse } = require("../utils/responseParser");
const { classifyXray } = require("../services/xrayVisionRecommender");

exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let imagePath = req.file.path;
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    if (fileExtension === ".pdf") {
      const imageService = require("../services/imageService");
      imagePath = await imageService.convertPdfToImage(imagePath);
      // Delete the original PDF file
      fs.unlinkSync(req.file.path);
    } else if (![".png", ".jpg", ".jpeg"].includes(fileExtension)) {
      return res.status(400).json({
        error: "Unsupported file format. Please upload a PDF or image file.",
      });
    }

    // ── Try local CNN model first ───────────────────────────
    const cnnResult = classifyXray(imagePath);

    // ── Fall back to LLM-based analysis ─────────────────────
    const aiAnalysis = await aiService.analyzeImageWithAI(imagePath);
    const diagnosisResult = parseAIResponse(aiAnalysis);

    // Clean up the uploaded file
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    if (cnnResult && !cnnResult.error) {
      console.log("Image analysis: CNN model prediction used");
      res.json({
        ...diagnosisResult,
        aiAnalysis,
        cnnPrediction: cnnResult.prediction,
        cnnConfidence: cnnResult.confidence,
        cnnClassProbabilities: cnnResult.class_probabilities,
        engine: "CNN + LLM",
      });
    } else {
      console.log("Image analysis: CNN unavailable, using LLM only");
      res.json({
        ...diagnosisResult,
        aiAnalysis,
        engine: "LLM",
      });
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    res
      .status(500)
      .json({ error: "An error occurred while analyzing the image" });
  }
};
