const fs = require("fs");
const path = require("path");
const genAI = require("../config/gemini");
const env = require("../config/env");
const runtime = require("../config/runtime");

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
    const localUrl = runtime.getLocalModelUrl();

    if (localUrl) {
      try {
        let axios;
        try {
          axios = require("axios");
        } catch (e) {
          axios = null;
        }

        if (axios) {
          const prompt = [
            "You are an expert radiology assistant.",
            "A user uploaded an image or PDF for analysis.",
            "Return plain text with these lines exactly:",
            "Diagnosis: ...",
            "Confidence: ...",
            "Additional Findings: ...",
            "Recommended Actions: ...",
            `File name: ${path.basename(imagePath)}`,
          ].join(" ");

          const res = await doPostWithRetry(
            axios,
            `${localUrl.replace(/\/$/, "")}/generate`,
            { prompt },
          );

          if (res.data && res.data.text) {
            return String(res.data.text);
          }
        }
      } catch (err) {
        console.error(
          "Local image analysis fallback failed:",
          err.message || err,
        );
      }
    }

    return [
      "Diagnosis: Unable to perform multimodal analysis in the current environment",
      "Confidence: 25%",
      "Additional Findings: File received successfully, but no vision model is configured",
      "Recommended Actions: Connect Gemini or a vision-capable local model for real image interpretation",
    ].join("\n");
  }

  try {
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
  } catch (err) {
    console.error(
      "Gemini image analysis failed, falling back:",
      err.message || err,
    );

    const localUrl = runtime.getLocalModelUrl();
    if (localUrl) {
      try {
        let axios;
        try {
          axios = require("axios");
        } catch (e) {
          axios = null;
        }

        if (axios) {
          const prompt = [
            "You are an expert radiology assistant.",
            "A user uploaded an image or PDF for analysis.",
            "Return plain text with these lines exactly:",
            "Diagnosis: ...",
            "Confidence: ...",
            "Additional Findings: ...",
            "Recommended Actions: ...",
            `File name: ${path.basename(imagePath)}`,
          ].join(" ");

          const res = await doPostWithRetry(
            axios,
            `${localUrl.replace(/\/$/, "")}/generate`,
            { prompt },
          );

          if (res.data && res.data.text) {
            return String(res.data.text);
          }
        }
      } catch (localErr) {
        console.error(
          "Local image analysis fallback failed:",
          localErr.message || localErr,
        );
      }
    }

    return [
      "Diagnosis: Unable to perform multimodal analysis in the current environment",
      "Confidence: 25%",
      "Additional Findings: File received successfully, but no vision model is configured",
      "Recommended Actions: Connect Gemini or a vision-capable local model for real image interpretation",
    ].join("\n");
  }
}

async function generateHealthPlan(prompt) {
  // If a local model server is available, call it for development.
  const runtime = require("../config/runtime");
  const localUrl = runtime.getLocalModelUrl();
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

  try {
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
  } catch (err) {
    console.error(
      "Gemini health plan generation failed, falling back:",
      err.message || err,
    );
    return JSON.stringify({
      diet_plan: {
        caloric_intake: 2200,
        macronutrients: {
          carbohydrates: "45%",
          proteins: "30%",
          fats: "25%",
        },
        meal_plan: {
          breakfast: {
            time: "8:00 AM",
            items: ["Oatmeal", "Greek yogurt", "Berries"],
          },
          lunch: {
            time: "1:00 PM",
            items: ["Grilled chicken bowl", "Brown rice", "Leafy greens"],
          },
          dinner: {
            time: "7:00 PM",
            items: ["Salmon", "Roasted vegetables", "Quinoa"],
          },
        },
      },
      sleep_routine: {
        bedtime: "10:30 PM",
        wake_time: "6:30 AM",
        pre_sleep_activities: [
          "Reduce screen time 60 minutes before bed",
          "Light stretching or breathing exercises",
          "Keep the room cool and dark",
        ],
      },
    });
  }
}

async function chatWithAssistant(conversationHistory) {
  // If local model server is configured, call its chat endpoint with the last message
  const runtime = require("../config/runtime");
  const localUrl = runtime.getLocalModelUrl();
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

  if (!genAI) {
    throw new Error(
      "No model available for chat. Set LOCAL_MODEL_URL or GEMINI_API_KEY.",
    );
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
  const localUrl = runtime.getLocalModelUrl();
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

function buildFallbackHealthPlan(sampleData) {
  return {
    diet_plan: {
      caloric_intake: 2200,
      macronutrients: {
        carbohydrates: "45%",
        proteins: "30%",
        fats: "25%",
      },
      meal_plan: {
        breakfast: {
          time: "8:00 AM",
          items: ["Oatmeal", "Greek yogurt", "Berries"],
        },
        lunch: {
          time: "1:00 PM",
          items: ["Grilled chicken bowl", "Brown rice", "Leafy greens"],
        },
        dinner: {
          time: "7:00 PM",
          items: ["Salmon", "Roasted vegetables", "Quinoa"],
        },
      },
    },
    sleep_routine: {
      bedtime: "10:30 PM",
      wake_time: "6:30 AM",
      pre_sleep_activities: [
        "Reduce screen time 60 minutes before bed",
        "Light stretching or breathing exercises",
        "Keep the room cool and dark",
      ],
    },
    metadata: sampleData,
  };
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
