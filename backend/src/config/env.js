const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const defaultCorsOrigins = ["http://localhost:3000", "http://localhost:8080"];

function requireEnv(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

module.exports = {
  port: process.env.PORT || 3001,
  // Make GEMINI_API_KEY optional at process startup so CI/smoke checks don't fail.
  // Support reading secret from a file (e.g. Kubernetes secret, Docker secret)
  geminiKey: (() => {
    const file = process.env.GEMINI_API_KEY_FILE;
    if (file) {
      try {
        const fs = require("fs");
        const val = fs.readFileSync(file, "utf8").trim();
        if (val) return val;
      } catch (e) {
        // ignore and fallback
      }
    }
    return process.env.GEMINI_API_KEY || null;
  })(),
  modelName: process.env.MODEL_NAME || "gemini-2.0-flash",
  // Groq API configuration (optional, like Gemini)
  groqKey: process.env.GROQ_API_KEY || null,
  groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  // JWT secret for user authentication
  jwtSecret: process.env.JWT_SECRET || "medirag-dev-secret-change-in-production",
  corsOrigins: (process.env.CORS_ORIGIN || defaultCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  smtpUser: process.env.SMTP_USER || null,
  smtpPass: process.env.SMTP_PASS || null,
  smtpFrom: process.env.SMTP_FROM || null,
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY || null,
  fast2smsApiKey: process.env.FAST2SMS_API_KEY || null,
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || null,
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || null,
  twilioWhatsAppFrom: process.env.TWILIO_WHATSAPP_FROM || null,
  requireEnv,
};
