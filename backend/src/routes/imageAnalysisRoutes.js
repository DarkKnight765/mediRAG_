const express = require('express');
const router = express.Router();
const imageAnalysisController = require('../controllers/imageAnalysisController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/analyze-image', upload.single('file'), imageAnalysisController.analyzeImage);

module.exports = router;
