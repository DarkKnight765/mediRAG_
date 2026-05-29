const http = require("http");
const env = require("../config/env");

exports.health = async (req, res) => {
  const runtime = require("../config/runtime");
  const localUrl = runtime.getLocalModelUrl();
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

exports.setMode = async (req, res) => {
  try {
    const runtime = require("../config/runtime");
    const mode = req.body && req.body.mode ? String(req.body.mode) : null;
    if (!mode)
      return res
        .status(400)
        .json({ error: "mode required (auto|mock|gemini)" });
    const ok = runtime.setMode(mode);
    if (!ok) return res.status(400).json({ error: "invalid mode" });
    return res.json({ status: "ok", mode: runtime.getMode() });
  } catch (e) {
    console.error("Error setting mode", e);
    return res.status(500).json({ error: "internal" });
  }
};

module.exports = exports;
