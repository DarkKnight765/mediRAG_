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
  return path.resolve(__dirname, "../../ml/xray_vision/predict.py");
}

/**
 * Classify a chest X-ray image using the trained ResNet18 CNN model.
 *
 * @param {string} imagePath - Absolute path to the X-ray image file
 * @returns {object|null} Prediction result or null if model unavailable
 */
function classifyXray(imagePath) {
  const scriptPath = getPredictScriptPath();
  if (!fs.existsSync(scriptPath)) {
    return null;
  }

  const result = spawnSync(getPythonExecutable(), [scriptPath], {
    input: JSON.stringify({ image_path: imagePath }),
    encoding: "utf8",
    env: {
      ...process.env,
    },
    timeout: 30000,
  });

  if (result.error || result.status !== 0) {
    const message =
      result.stderr || result.error?.message || "X-ray vision model failed";
    console.error("X-ray vision recommender error:", message);
    return null;
  }

  try {
    return JSON.parse(result.stdout.trim());
  } catch (error) {
    console.error(
      "Failed to parse X-ray vision output:",
      error.message || error,
    );
    return null;
  }
}

module.exports = { classifyXray };
