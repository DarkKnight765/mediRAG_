const aiService = require("../services/aiService");

/**
 * POST /api/symptoms/analyze
 * Uses the existing AI service to analyze symptoms and recommend a specialty.
 */
exports.analyzeSymptoms = async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
      return res.status(400).json({ success: false, message: "Symptoms are required" });
    }

    const prompt = `You are a medical triage assistant. A patient describes the following symptoms:

"${symptoms}"

Based on these symptoms, recommend the most appropriate medical specialty. Return your response as valid JSON (no markdown) in this exact format:
{
  "recommendedSpecialty": "Cardiologist",
  "confidence": "High",
  "reasoning": "Brief 1-2 sentence explanation of why this specialty is recommended",
  "alternativeSpecialties": ["Pulmonologist", "General Practitioner"],
  "urgencyLevel": "Moderate"
}

Important:
- recommendedSpecialty must be one of: General Practice, Cardiology, Orthopedics, Dermatology, Pediatrics, Neurology, Gastroenterology, Ophthalmology, ENT, Pulmonology, Psychiatry, Gynecology, Urology
- confidence must be one of: High, Medium, Low
- urgencyLevel must be one of: Low, Moderate, High, Emergency
- Return ONLY valid JSON, no markdown code blocks`;

    const aiResponse = await aiService.generateHealthPlan(prompt);

    // Try to parse as JSON
    let result;
    try {
      // Strip markdown code block if present
      const cleaned = aiResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      // Fallback if AI doesn't return valid JSON
      result = {
        recommendedSpecialty: "General Practice",
        confidence: "Medium",
        reasoning: "Based on the symptoms described, a general practitioner can perform initial evaluation and refer to a specialist if needed.",
        alternativeSpecialties: ["Internal Medicine"],
        urgencyLevel: "Moderate",
      };
    }

    res.json(result);
  } catch (error) {
    console.error("Symptom analysis error:", error);
    res.status(500).json({ success: false, message: "Failed to analyze symptoms" });
  }
};
