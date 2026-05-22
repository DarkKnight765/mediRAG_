const aiService = require('../services/aiService');

exports.generateHealthPlan = async (req, res) => {
  try {
    const { age, weight, height, activityLevel, dietaryRestrictions, sleepIssues } = req.body;

    console.log("Received body parameters:", { age, weight, height, activityLevel, dietaryRestrictions, sleepIssues });

    const sampleData = {
      age: age || 30,
      weight: weight || 70,
      height: height || 170,
      activityLevel: activityLevel || "moderate",
      dietaryRestrictions: dietaryRestrictions || "none",
      sleepIssues: sleepIssues || "insomnia"
    };

    console.log("Using data for health plan generation:", sampleData);

    const prompt = `Generate a personalized health plan for a ${sampleData.age}-year-old individual weighing ${sampleData.weight} kg and ${sampleData.height} cm tall. Their activity level is ${sampleData.activityLevel}, and they have the following dietary restrictions: ${sampleData.dietaryRestrictions}. They also report the following sleep issues: ${sampleData.sleepIssues}. Provide a diet plan and sleep routine in JSON format. Do not use markdown formatting or code blocks. Only return the JSON object.`;

    console.log("Sending prompt to OpenAI:", prompt);

    const response = await aiService.generateHealthPlan(prompt);

    console.log("Raw API response:", JSON.stringify(response, null, 2));

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message) {
      throw new Error('Unexpected API response structure');
    }

    let cleanedContent = response.choices[0].message.content.trim();
    cleanedContent = cleanedContent.replace(/```json\s?|\s?```/g, '');

    console.log("Cleaned content:", cleanedContent);

    try {
      const healthPlan = JSON.parse(cleanedContent);
      console.log("Generated health plan:", healthPlan);
      
      res.json({
        message: 'Health plan generated successfully!',
        healthPlan: healthPlan
      });
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.log('Raw content:', cleanedContent);
      res.status(500).json({ error: 'An error occurred while parsing the health plan' });
    }
  } catch (error) {
    console.error('Error generating health plan:', error);
    res.status(500).json({ error: 'An error occurred while generating the health plan' });
  }
};
