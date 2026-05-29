// Quick test script to call analyzeImageWithAI directly using an existing image file
const path = require("path");
const aiService = require("../src/services/aiService");

async function run() {
  try {
    const img = path.resolve(__dirname, "..", "Images", "X-ray.png");
    console.log("Using image:", img);
    const res = await aiService.analyzeImageWithAI(img);
    console.log("AI analysis result:\n", res);
  } catch (err) {
    console.error("Error running analyzeImageWithAI:", err);
    process.exit(1);
  }
}

run();
