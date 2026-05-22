const env = require("./env");

// Lazily initialize Gemini client only when an API key is provided.
let genAI = null;
if (env.geminiKey) {
  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    genAI = new GoogleGenerativeAI(env.geminiKey);
  } catch (err) {
    // If the library cannot be loaded in some environments, log and continue.
    console.error(
      "Gemini client initialization failed:",
      err && err.message ? err.message : err,
    );
    genAI = null;
  }
}

module.exports = genAI;
