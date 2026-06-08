const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function getPythonExecutable() {
  return (
    process.env.PYTHON_EXECUTABLE ||
    path.resolve(__dirname, "../../../.venv/Scripts/python.exe") ||
    "python"
  );
}

function getPredictScriptPath() {
  return path.resolve(__dirname, "../../ml/symptom_triage/predict.py");
}

/**
 * Predict the appropriate medical specialty from symptom text using
 * the trained TF-IDF + classifier model.
 *
 * @param {string} symptoms - Free-text symptom description
 * @returns {object|null} Prediction result or null if model unavailable
 */
function triageSymptoms(symptoms) {
  const scriptPath = getPredictScriptPath();
  if (!fs.existsSync(scriptPath)) {
    return null;
  }

  const result = spawnSync(getPythonExecutable(), [scriptPath], {
    input: JSON.stringify({ symptoms }),
    encoding: "utf8",
    env: {
      ...process.env,
    },
    timeout: 15000,
  });

  if (result.error || result.status !== 0) {
    const message =
      result.stderr || result.error?.message || "Symptom triage model failed";
    console.error("Symptom triage recommender error:", message);
    return null;
  }

  try {
    return JSON.parse(result.stdout.trim());
  } catch (error) {
    console.error(
      "Failed to parse symptom triage output:",
      error.message || error,
    );
    return null;
  }
}

module.exports = { triageSymptoms };
