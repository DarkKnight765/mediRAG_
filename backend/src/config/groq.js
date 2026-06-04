const env = require("./env");

// Lazily initialize Groq client only when an API key is provided.
let groqClient = null;
if (env.groqKey) {
  try {
    const Groq = require("groq-sdk");
    groqClient = new Groq({ apiKey: env.groqKey });
  } catch (err) {
    // If the library cannot be loaded in some environments, log and continue.
    console.error(
      "Groq client initialization failed:",
      err && err.message ? err.message : err,
    );
    groqClient = null;
  }
}

module.exports = groqClient;
