const http = require("http");
const env = require("../config/env");

exports.health = async (req, res) => {
  const localUrl = process.env.LOCAL_MODEL_URL || env.localModelUrl;
  const statuses = { localModel: "not-configured", gemini: "not-configured" };

  if (localUrl) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.request(
          `${localUrl.replace(/\/$/, "")}/chat`,
          { method: "POST", timeout: 2000 },
          (r) => resolve(),
        );
        req.on("error", reject);
        req.on("timeout", () => req.destroy(new Error("timeout")));
        req.end();
      });
      statuses.localModel = "ok";
    } catch (e) {
      statuses.localModel = "unreachable";
    }
  }

  // Check Gemini availability by verifying the presence of the client
  try {
    const genAI = require("../config/gemini");
    statuses.gemini = genAI ? "ok" : "not-configured";
  } catch (e) {
    statuses.gemini = "not-configured";
  }

  res.json({ status: "ok", models: statuses });
};

module.exports = exports;
