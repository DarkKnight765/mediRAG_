const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/generate", (req, res) => {
  const prompt =
    req.body.prompt || (Array.isArray(req.body) && req.body[0]) || "";
  // Very small deterministic mock response to allow dry-runs
  res.json({
    text: `Mock model response for prompt: ${String(prompt).slice(0, 200)}`,
  });
});

app.post("/chat", (req, res) => {
  const message = req.body.message || "";
  res.json({ text: `Mock chat reply to: ${String(message).slice(0, 200)}` });
});

const port = process.env.MOCK_MODEL_PORT || 8000;
app.listen(port, () => console.log(`Mock model server listening on ${port}`));

module.exports = app;
