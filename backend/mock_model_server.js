const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const axios = require("axios");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
app.use(express.json());

// Helpers: language/tone detection and simple translation map accessor
function detectLangAndToneFrom(text, acceptHeader) {
  const accept = String(acceptHeader || "").toLowerCase();
  const p = String(text || "").toLowerCase();
  let lang = "en";
  if (
    accept.startsWith("es") ||
    p.includes("hola") ||
    p.includes("gracias") ||
    p.includes("fiebre")
  )
    lang = "es";
  const tone = (process.env.MOCK_TONE || "casual").toLowerCase();
  return { lang, tone };
}

function t(map, lang) {
  if (!map) return "";
  return map[lang] || map["en"] || "";
}

function getOllamaConfig() {
  const baseUrl =
    process.env.OLLAMA_BASE_URL || process.env.LOCAL_MODEL_BASE_URL;
  const model = process.env.OLLAMA_MODEL || process.env.LOCAL_MODEL_NAME;

  if (!baseUrl || !model) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    model,
  };
}

function buildMessages(history, userMessage) {
  const messages = Array.isArray(history)
    ? history
        .filter((item) => item && item.role && item.content)
        .map((item) => ({
          role:
            item.role === "assistant" || item.role === "model"
              ? "assistant"
              : "user",
          content: String(item.content),
        }))
    : [];

  if (userMessage) {
    messages.push({ role: "user", content: String(userMessage) });
  }

  return messages;
}

async function callOllamaGenerate(prompt) {
  const config = getOllamaConfig();
  if (!config) {
    return null;
  }

  const response = await axios.post(
    `${config.baseUrl}/api/generate`,
    {
      model: config.model,
      prompt: String(prompt),
      stream: false,
    },
    { timeout: 120000 },
  );

  return response.data && response.data.response
    ? String(response.data.response)
    : null;
}

async function callOllamaChat(message, history) {
  const config = getOllamaConfig();
  if (!config) {
    return null;
  }

  const messages = buildMessages(history, message);
  const response = await axios.post(
    `${config.baseUrl}/api/chat`,
    {
      model: config.model,
      messages,
      stream: false,
    },
    { timeout: 120000 },
  );

  return response.data && response.data.message && response.data.message.content
    ? String(response.data.message.content)
    : null;
}

app.post("/generate", async (req, res) => {
  const prompt =
    req.body.prompt || (Array.isArray(req.body) && req.body[0]) || "";

  try {
    const text = await callOllamaGenerate(prompt);
    if (text) {
      return res.json({ text });
    }
  } catch (error) {
    console.error(
      "Ollama generate failed, falling back to mock response:",
      error.message || error,
    );
  }

  // Rule-based mock generator with simple i18n and tone support
  function detectLangAndTone(s) {
    const accept = String(req.headers["accept-language"] || "").toLowerCase();
    const p = String(s || "").toLowerCase();
    let lang = "en";
    if (
      accept.startsWith("es") ||
      p.includes("hola") ||
      p.includes("gracias") ||
      p.includes("fiebre")
    )
      lang = "es";
    const tone = (process.env.MOCK_TONE || "casual").toLowerCase();
    return { lang, tone };
  }

  function t(map, lang) {
    if (!map) return "";
    return map[lang] || map["en"] || "";
  }

  function generateMockFromPrompt(p) {
    const lower = String(p || "").toLowerCase();
    const { lang } = detectLangAndTone(p);

    // Health plan detection
    if (
      lower.includes("health plan") ||
      lower.includes("plan") ||
      lower.includes("diet") ||
      lower.includes("sleep")
    ) {
      const sample = {
        diet_plan: {
          caloric_intake: 2000,
          macronutrients: {
            carbohydrates: "45%",
            proteins: "30%",
            fats: "25%",
          },
          meal_plan: {
            breakfast: {
              time: t({ en: "8:00 AM", es: "8:00" }, lang),
              items: t(
                {
                  en: ["Oatmeal", "Greek yogurt", "Berries"],
                  es: ["Avena", "Yogur griego", "Bayas"],
                },
                lang,
              ),
            },
            lunch: {
              time: t({ en: "1:00 PM", es: "13:00" }, lang),
              items: t(
                {
                  en: ["Grilled chicken", "Quinoa", "Salad"],
                  es: ["Pollo a la parrilla", "Quinoa", "Ensalada"],
                },
                lang,
              ),
            },
            dinner: {
              time: t({ en: "7:00 PM", es: "19:00" }, lang),
              items: t(
                {
                  en: ["Baked salmon", "Roasted vegetables", "Brown rice"],
                  es: ["Salmón al horno", "Verduras asadas", "Arroz integral"],
                },
                lang,
              ),
            },
          },
        },
        sleep_routine: {
          bedtime: t({ en: "10:30 PM", es: "22:30" }, lang),
          wake_time: t({ en: "6:30 AM", es: "6:30" }, lang),
          pre_sleep_activities: t(
            {
              en: [
                "Reduce screen time 60 minutes before bed",
                "Light stretching",
                "Deep breathing exercises",
              ],
              es: [
                "Reducir tiempo de pantalla 60 minutos antes de dormir",
                "Estiramientos suaves",
                "Ejercicios de respiración profunda",
              ],
            },
            lang,
          ),
        },
      };
      return JSON.stringify(sample);
    }

    // Image analysis detection
    if (
      lower.includes("x-ray") ||
      lower.includes("xray") ||
      lower.includes("radiology") ||
      lower.includes("image")
    ) {
      return t(
        {
          en: [
            "Diagnosis: No acute cardiopulmonary disease identified.",
            "Confidence: 76%",
            "Additional Findings: Mild bilateral interstitial markings that may reflect chronic change or mild atelectasis.",
            "Recommended Actions: Correlate clinically and consider follow-up radiographs if symptoms persist.",
          ].join("\n"),
          es: [
            "Diagnóstico: No se identifica enfermedad cardiopulmonar aguda.",
            "Confianza: 76%",
            "Hallazgos adicionales: Marcaciones intersticiales bilaterales leves que pueden reflejar un cambio crónico o atelectasia leve.",
            "Acciones recomendadas: Correlacionar clínicamente y considerar radiografías de seguimiento si los síntomas persisten.",
          ].join("\n"),
        },
        lang,
      );
    }

    // Generic short generate reply (localized)
    if (lower.length < 200) {
      return t(
        {
          en: `Assistant mock reply: ${String(p).trim()}\n\nI'm here to help — tell me more.`,
          es: `Respuesta simulada: ${String(p).trim()}\n\nEstoy aquí para ayudar — cuéntame más.`,
        },
        lang,
      );
    }

    return t(
      {
        en: `Mock model response for prompt: ${String(p).slice(0, 200)}`,
        es: `Respuesta simulada: ${String(p).slice(0, 200)}`,
      },
      lang,
    );
  }

  const mockText = generateMockFromPrompt(prompt);
  res.json({ text: mockText });
});

app.post("/chat", async (req, res) => {
  const message = req.body.message || "";
  const history = req.body.history || [];

  try {
    const text = await callOllamaChat(message, history);
    if (text) {
      return res.json({ text });
    }
  } catch (error) {
    console.error(
      "Ollama chat failed, falling back to mock response:",
      error.message || error,
    );
  }

  // Rule-based mock chat responses to make the UI feel realistic during development
  function chatMockReply(msg, hist, lang) {
    const m = String(msg || "").trim();
    const lower = m.toLowerCase();
    // lang is now passed from the route handler

    const replies = {
      greeting: {
        en: "Hello! I'm Atlas, your virtual support assistant. How are you feeling today?",
        es: "¡Hola! Soy Atlas, tu asistente virtual. ¿Cómo te sientes hoy?",
      },
      sleep: {
        en: "I hear that sleep has been difficult. Small changes can help — would you like a short relaxation exercise or ideas to improve sleep hygiene?",
        es: "Escucho que dormir ha sido difícil. Pequeños cambios pueden ayudar: ¿quieres un ejercicio de relajación corto o ideas para mejorar el sueño?",
      },
      overwhelm: {
        en: "That sounds overwhelming — I'm sorry you're going through that. Can you tell me one thing that's been on your mind lately?",
        es: "Eso suena abrumador — lamento que estés pasando por eso. ¿Puedes decirme una cosa que te preocupe recientemente?",
      },
      fever: {
        en: "I'm sorry you're feeling unwell. For a fever, check your temperature and rest. Stay hydrated and consider taking paracetamol/ibuprofen according to the label. Seek urgent care if you have difficulty breathing, severe chest pain, confusion, persistent vomiting, or a temperature above 39°C (102.2°F). Do you have any other symptoms?",
        es: "Siento que no te encuentres bien. Para la fiebre, toma la temperatura y descansa. Mantente hidratado y considera paracetamol/ibuprofeno según el prospecto. Busca atención urgente si tienes dificultad para respirar, dolor intenso en el pecho, confusión, vómitos persistentes o temperatura por encima de 39°C. ¿Tienes otros síntomas?",
      },
      image: {
        en: "Thanks — I received your image. I'll run a quick analysis and share what I find. (This is a mock analysis in development mode.)",
        es: "Gracias — recibí tu imagen. Haré un análisis rápido y compartiré lo que encuentre. (Modo de desarrollo: análisis simulado.)",
      },
      default: {
        en: "Thanks for sharing. I hear you — could you say a bit more about how this is affecting you or what outcome you'd like?",
        es: "Gracias por compartir. Te escucho — ¿puedes contar un poco más cómo te está afectando o qué resultado te gustaría?",
      },
    };

    if (/^(hi|hello|hey|hola)\b/i.test(m)) return replies.greeting[lang];
    if (
      lower.includes("sleep") ||
      lower.includes("insomnia") ||
      lower.includes("tired")
    )
      return replies.sleep[lang];
    if (
      lower.includes("overwhelm") ||
      lower.includes("stress") ||
      lower.includes("anxious")
    )
      return replies.overwhelm[lang];
    if (
      lower.includes("fever") ||
      lower.includes("temperature") ||
      lower.includes("hot")
    )
      return replies.fever[lang];
    if (
      lower.includes("x-ray") ||
      lower.includes("image") ||
      lower.includes("pdf")
    )
      return replies.image[lang];

    // Intent: appointment scheduling
    if (
      lower.includes("appointment") ||
      lower.includes("book") ||
      lower.includes("schedule")
    ) {
      return t(
        {
          en: "I can help you schedule an appointment. What day/time works best for you?",
          es: "Puedo ayudarte a programar una cita. ¿Qué día/hora te viene mejor?",
        },
        lang,
      );
    }

    // Intent: medication question
    if (
      lower.includes("medication") ||
      lower.includes("ibuprofen") ||
      lower.includes("paracetamol") ||
      lower.includes("pill")
    ) {
      return t(
        {
          en: "I can provide general info about common medications, but I can't give medical advice. What's the medication name and dosing question?",
          es: "Puedo dar información general sobre medicamentos comunes, pero no puedo dar asesoramiento médico. ¿Cuál es el medicamento y qué duda tienes sobre la dosis?",
        },
        lang,
      );
    }

    // Thanks / closing
    if (
      lower.includes("thanks") ||
      lower.includes("thank you") ||
      lower.includes("gracias")
    ) {
      return t(
        {
          en: "You're welcome — I'm here if you need anything else.",
          es: "De nada — estoy aquí si necesitas algo más.",
        },
        lang,
      );
    }

    return replies.default[lang];
  }

  const { lang } = detectLangAndToneFrom(
    message,
    req.headers["accept-language"],
  );
  const reply = chatMockReply(message, history, lang);
  res.json({ text: reply });
});

const port = process.env.MOCK_MODEL_PORT || 8000;
app.listen(port, () => console.log(`Local model server listening on ${port}`));

module.exports = app;
