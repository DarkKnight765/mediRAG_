const aiService = require("../services/aiService");
const { recommendHealthPlan } = require("../services/healthPlanRecommender");
const db = require("../config/db");

async function saveHealthPlanToDB(userId, inputData, planResult, engine) {
  try {
    await db.healthPlan.create({
      data: {
        userId,
        input: JSON.stringify(inputData),
        result: JSON.stringify(planResult),
        engine,
      },
    });
  } catch (err) {
    console.error("Failed to save health plan to DB:", err);
  }
}

function extractJsonObject(text) {
  if (typeof text !== "string") {
    return null;
  }

  const trimmed = text.trim().replace(/```json\s?|\s?```/g, "");

  try {
    return JSON.parse(trimmed);
  } catch (firstError) {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch (secondError) {
        return null;
      }
    }
  }

  return null;
}

function sanitizeHealthPlanForRestrictions(healthPlan, dietaryRestrictionsRaw) {
  if (!healthPlan || typeof healthPlan !== "object") return healthPlan;

  const restrictions = String(dietaryRestrictionsRaw || "").toLowerCase();
  const isVegan = restrictions.includes("vegan");
  const isVegetarian = isVegan || restrictions.includes("vegetarian");

  if (!isVegetarian) return healthPlan;

  const bannedPatterns = [
    /chicken/i,
    /salmon/i,
    /beef/i,
    /pork/i,
    /turkey/i,
    /fish/i,
    /shrimp/i,
    /meat/i,
    /seafood/i,
  ];

  if (isVegan) {
    bannedPatterns.push(/yogurt/i, /milk/i, /cheese/i, /egg/i, /paneer/i);
  }

  const replacement = isVegan
    ? "Plant-protein option (tofu, lentils, chickpeas)"
    : "Vegetarian-protein option (tofu, paneer, beans, lentils)";

  const cloned = JSON.parse(JSON.stringify(healthPlan));
  const mealPlan = cloned?.diet_plan?.meal_plan;

  if (!mealPlan || typeof mealPlan !== "object") return cloned;

  for (const key of Object.keys(mealPlan)) {
    const meal = mealPlan[key];
    if (!meal || !Array.isArray(meal.items)) continue;
    meal.items = meal.items.map((item) => {
      const text = String(item || "");
      return bannedPatterns.some((pattern) => pattern.test(text))
        ? replacement
        : text;
    });
  }

  return cloned;
}

exports.generateHealthPlan = async (req, res) => {
  try {
    const {
      age,
      weight,
      height,
      activityLevel,
      dietaryRestrictions,
      sleepIssues,
    } = req.body;

    console.log("Received body parameters:", {
      age,
      weight,
      height,
      activityLevel,
      dietaryRestrictions,
      sleepIssues,
    });

    const sampleData = {
      age: age || 30,
      weight: weight || 70,
      height: height || 170,
      activityLevel: activityLevel || "moderate",
      dietaryRestrictions: dietaryRestrictions || "none",
      sleepIssues: sleepIssues || "insomnia",
    };

    console.log("Using data for health plan generation:", sampleData);

    const mlHealthPlan = recommendHealthPlan({
      age: sampleData.age,
      weight: sampleData.weight,
      height: sampleData.height,
      activityLevel: sampleData.activityLevel,
      dietaryRestrictions: sampleData.dietaryRestrictions,
      sleepIssues: sampleData.sleepIssues,
    });

    if (mlHealthPlan) {
      console.log("ML recommender selected health plan:", mlHealthPlan);
      const finalPlan = sanitizeHealthPlanForRestrictions(
        mlHealthPlan,
        sampleData.dietaryRestrictions,
      );
      await saveHealthPlanToDB(req.user.id, sampleData, finalPlan, "ML Recommender");
      return res.json({
        message: "Health plan generated successfully!",
        healthPlan: finalPlan,
      });
    }

    const prompt = `Generate a personalized health plan for a ${sampleData.age}-year-old individual weighing ${sampleData.weight} kg and ${sampleData.height} cm tall. Their activity level is ${sampleData.activityLevel}, and they have the following dietary restrictions: ${sampleData.dietaryRestrictions}. They also report the following sleep issues: ${sampleData.sleepIssues}. Provide a diet plan and sleep routine in JSON format. Do not use markdown formatting or code blocks. Only return the JSON object.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await aiService.generateHealthPlan(prompt);

    console.log("Raw API response:", JSON.stringify(response, null, 2));

    const parsedHealthPlan = extractJsonObject(response);

    if (parsedHealthPlan) {
      console.log("Generated health plan:", parsedHealthPlan);
      const finalPlan = sanitizeHealthPlanForRestrictions(
        parsedHealthPlan,
        sampleData.dietaryRestrictions,
      );
      await saveHealthPlanToDB(req.user.id, sampleData, finalPlan, "LLM");
      return res.json({
        message: "Health plan generated successfully!",
        healthPlan: finalPlan,
      });
    }

    console.warn("Falling back to default structured health plan.");

    const fallbackPlan = sanitizeHealthPlanForRestrictions(
      {
        diet_plan: {
          caloric_intake: 2200,
          macronutrients: {
            carbohydrates: "45%",
            proteins: "30%",
            fats: "25%",
          },
          meal_plan: {
            breakfast: {
              time: "8:00 AM",
              items: ["Oatmeal", "Greek yogurt", "Berries"],
            },
            lunch: {
              time: "1:00 PM",
              items: ["Grilled chicken bowl", "Brown rice", "Leafy greens"],
            },
            dinner: {
              time: "7:00 PM",
              items: ["Salmon", "Roasted vegetables", "Quinoa"],
            },
          },
        },
        sleep_routine: {
          bedtime: "10:30 PM",
          wake_time: "6:30 AM",
          pre_sleep_activities: [
            "Reduce screen time 60 minutes before bed",
            "Light stretching or breathing exercises",
            "Keep the room cool and dark",
          ],
        },
      },
      sampleData.dietaryRestrictions,
    );

    await saveHealthPlanToDB(req.user.id, sampleData, fallbackPlan, "Fallback");

    return res.json({
      message: "Health plan generated successfully!",
      healthPlan: fallbackPlan,
    });
  } catch (error) {
    console.error("Error generating health plan:", error);
    res
      .status(500)
      .json({ error: "An error occurred while generating the health plan" });
  }
};
