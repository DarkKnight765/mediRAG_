const fs = require('fs');
const genAI = require('../config/gemini');
const env = require('../config/env');
const { getImageDataUrl } = require('./imageService');

// Helper to convert local image to Gemini inline data
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function analyzeImageWithAI(imagePath) {
  // Use gemini-1.5-flash which is multimodal and good for general visual tasks
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = "You are an expert radiologist analyzing X-ray images. Provide a detailed diagnosis, confidence level, additional findings, and recommended actions. Analyze this X-ray image and provide a detailed diagnosis.";
  
  // Extract mimetype from path (naively for png/jpg)
  const ext = imagePath.split('.').pop().toLowerCase();
  const mimeType = ext === 'png' ? 'image/png' : 'image/jpeg';
  
  const imagePart = fileToGenerativePart(imagePath, mimeType);

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

async function generateHealthPlan(prompt) {
  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction: "You are a helpful assistant specialized in creating personalized health plans.",
  });
  
  const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        topP: 1.0,
      }
  });
  
  // Return the resolved object matching the expected structure of the old OpenAI service as closely as possible,
  // or return the raw text if the controller gets updated. Returning raw text is better and we'll update the controller.
  return result.response.text();
}

async function chatWithAssistant(conversationHistory) {
  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction: "You are a helpful mental health assistant. Provide empathetic and supportive responses to users seeking mental health support.",
  });

  // Filter out the 'system' role since Gemini handles it via systemInstruction. 
  // Map 'assistant' to 'model' for Gemini compatibility.
  const history = conversationHistory
    .filter(msg => msg.role !== "system")
    .map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

  const chat = model.startChat({
    history: history.slice(0, -1) // All but the last message is history
  });

  // The last message is the current user input
  const lastUserMessage = history[history.length - 1].parts[0].text;
  
  const result = await chat.sendMessage(lastUserMessage);
  return result.response.text();
}

async function testAssistant() {
  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction: "You are a helpful assistant.",
  });
  
  const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "What is the capital of France?" }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1000,
        topP: 1.0,
      }
  });

  return result.response.text();
}

module.exports = {
  analyzeImageWithAI,
  generateHealthPlan,
  chatWithAssistant,
  testAssistant
};
