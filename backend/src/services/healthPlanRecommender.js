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
  return path.resolve(__dirname, "../../ml/health_plan_recommender/predict.py");
}

function recommendHealthPlan(profile) {
  const scriptPath = getPredictScriptPath();
  if (!fs.existsSync(scriptPath)) {
    return null;
  }

  const result = spawnSync(getPythonExecutable(), [scriptPath], {
    input: JSON.stringify(profile),
    encoding: "utf8",
    env: {
      ...process.env,
    },
    timeout: 15000,
  });

  if (result.error || result.status !== 0) {
    const message =
      result.stderr || result.error?.message || "ML recommender failed";
    console.error("Health-plan recommender error:", message);
    return null;
  }

  try {
    return JSON.parse(result.stdout.trim());
  } catch (error) {
    console.error(
      "Failed to parse recommender output:",
      error.message || error,
    );
    return null;
  }
}

module.exports = { recommendHealthPlan };
