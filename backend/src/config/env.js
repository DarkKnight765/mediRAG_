const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  port: process.env.PORT || 3001,
  geminiKey: process.env.GEMINI_API_KEY,
  modelName: process.env.MODEL_NAME || "gemini-1.5-flash",
};
