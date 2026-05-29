let mode = process.env.RUNTIME_MODEL_MODE || "auto"; // 'auto' | 'mock' | 'gemini'

function setMode(m) {
  if (["auto", "mock", "gemini"].includes(String(m))) {
    mode = String(m);
    return true;
  }
  return false;
}

function getMode() {
  return mode;
}

function getLocalModelUrl() {
  if (mode === "gemini") return null;
  // If forced mock or auto, return LOCAL_MODEL_URL if present, otherwise default mock port
  return process.env.LOCAL_MODEL_URL || "http://localhost:8000";
}

module.exports = { setMode, getMode, getLocalModelUrl };
