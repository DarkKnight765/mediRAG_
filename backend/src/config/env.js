const dotenv = require("dotenv");
dotenv.config();

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
  modelName: process.env.MODEL_NAME || "gemini-1.5-flash",
  corsOrigins: (process.env.CORS_ORIGIN || defaultCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  requireEnv,
};
