const aiService = require('../services/aiService');

exports.testAPI = async (req, res) => {
  try {
    const aiResponse = await aiService.testAssistant();

    res.json({ 
      message: 'Backend is working!',
      aiResponse: aiResponse
    });
  } catch (error) {
    console.error('Error in test route:', error);
    res.status(500).json({ error: 'An error occurred while processing the request' });
  }
};
