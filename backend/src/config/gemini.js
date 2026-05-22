const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('./env');

const genAI = new GoogleGenerativeAI(env.geminiKey);

module.exports = genAI;
