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
  geminiKey: requireEnv("GEMINI_API_KEY"),
  modelName: process.env.MODEL_NAME || "gemini-1.5-flash",
  corsOrigins: (process.env.CORS_ORIGIN || defaultCorsOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};
