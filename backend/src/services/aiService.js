const fs = require("fs");
const genAI = require("../config/gemini");
const env = require("../config/env");

// Helper to convert local image to Gemini inline data
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

async function analyzeImageWithAI(imagePath) {
  // Prefer Gemini for multimodal image analysis. Ensure genAI is available.
  if (!genAI) {
    throw new Error(
      "No multimodal model available for image analysis. Configure LOCAL_MODEL_URL (multimodal) or GEMINI_API_KEY.",
    );
  }

  // Use the configured Gemini model for multimodal image analysis.
  const model = genAI.getGenerativeModel({ model: env.modelName });

  const prompt =
    "You are an expert radiologist analyzing X-ray images. Provide a detailed diagnosis, confidence level, additional findings, and recommended actions. Analyze this X-ray image and provide a detailed diagnosis.";

  // Extract mimetype from path (naively for png/jpg)
  const ext = imagePath.split(".").pop().toLowerCase();
  const mimeType = ext === "png" ? "image/png" : "image/jpeg";

  const imagePart = fileToGenerativePart(imagePath, mimeType);

  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text();
}

async function generateHealthPlan(prompt) {
  // If a local model server is available, call it for development.
  const localUrl = process.env.LOCAL_MODEL_URL || env.localModelUrl;
  if (localUrl) {
    try {
      let axios;
      try {
        axios = require("axios");
      } catch (e) {
        axios = null;
      }
      if (axios) {
        const res = await doPostWithRetry(
          axios,
          `${localUrl.replace(/\/$/, "")}/generate`,
          { prompt },
        );
        return res.data.text;
      }
    } catch (err) {
      console.error(
        "Local model request failed, falling back to Gemini:",
        err.message || err,
      );
    }
  }

  if (!genAI) {
    throw new Error(
      "No text-generation model configured. Set LOCAL_MODEL_URL or GEMINI_API_KEY.",
    );
  }

  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction:
      "You are a helpful assistant specialized in creating personalized health plans.",
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1000, topP: 1.0 },
  });

  return result.response.text();
}

async function chatWithAssistant(conversationHistory) {
  if (!genAI) {
    throw new Error(
      "Gemini is not configured. Set GEMINI_API_KEY (or GEMINI_API_KEY_FILE) and restart the backend.",
    );
  }

  // If local model server is configured, call its chat endpoint with the last message
  const localUrl = process.env.LOCAL_MODEL_URL || env.localModelUrl;
  const history = conversationHistory
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      text: msg.content,
    }));

  if (localUrl) {
    try {
      let axios;
      try {
        axios = require("axios");
      } catch (e) {
        axios = null;
      }
      if (axios) {
        const last = history[history.length - 1]?.text || "";
        const res = await doPostWithRetry(
          axios,
          `${localUrl.replace(/\/$/, "")}/chat`,
          { message: last, history },
        );
        return res.data.text;
      }
    } catch (err) {
      console.error(
        "Local chat request failed, falling back to Gemini:",
        err.message || err,
      );
    }
  }

  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction:
      "You are a helpful mental health assistant. Provide empathetic and supportive responses to users seeking mental health support.",
  });

  // Map 'assistant' to 'model' for Gemini compatibility.
  const chatHistory = history.map((msg) => ({
    role: msg.role === "model" ? "model" : "user",
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({ history: chatHistory.slice(0, -1) });
  const lastUserMessage = chatHistory[chatHistory.length - 1].parts[0].text;

  const result = await chat.sendMessage(lastUserMessage);
  return result.response.text();
}

async function testAssistant() {
  const localUrl = process.env.LOCAL_MODEL_URL || env.localModelUrl;
  if (localUrl) {
    try {
      let axios;
      try {
        axios = require("axios");
      } catch (e) {
        axios = null;
      }
      if (axios) {
        const res = await doPostWithRetry(
          axios,
          `${localUrl.replace(/\/$/, "")}/generate`,
          { prompt: "What is the capital of France?" },
        );
        return res.data.text;
      }
    } catch (err) {
      console.error(
        "Local model request failed for testAssistant, falling back to Gemini:",
        err.message || err,
      );
    }
  }

  if (!genAI) {
    throw new Error(
      "No model available for testAssistant. Set LOCAL_MODEL_URL or GEMINI_API_KEY.",
    );
  }

  const model = genAI.getGenerativeModel({
    model: env.modelName,
    systemInstruction: "You are a helpful assistant.",
  });
  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: "What is the capital of France?" }] },
    ],
    generationConfig: { temperature: 0.3, maxOutputTokens: 1000, topP: 1.0 },
  });

  return result.response.text();
}

module.exports = {
  analyzeImageWithAI,
  generateHealthPlan,
  chatWithAssistant,
  testAssistant,
};

// Helper: POST with retries and exponential backoff
async function doPostWithRetry(axios, url, data, retries = 3, backoff = 200) {
  let attempt = 0;
  while (attempt <= retries) {
    try {
      return await axios.post(url, data, { timeout: 5000 });
    } catch (err) {
      attempt += 1;
      if (attempt > retries) throw err;
      const delay = backoff * Math.pow(2, attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}
