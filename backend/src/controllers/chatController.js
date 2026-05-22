const aiService = require('../services/aiService');
const conversationState = require('../utils/conversationState');

exports.mentalHealthChat = async (req, res) => {
  try {
    const userMessage = req.body.message;
    
    // Add user message to conversation history
    conversationState.addMessage({ role: "user", content: userMessage });

    const assistantReply = await aiService.chatWithAssistant(conversationState.getHistory());

    // Add assistant's reply to conversation history
    conversationState.addMessage({ role: "assistant", content: assistantReply });

    // Keep only the last 10 messages
    conversationState.trimHistory(11);

    res.json({ response: assistantReply });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
};
