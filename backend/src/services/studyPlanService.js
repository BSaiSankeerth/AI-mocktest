const axios = require("axios");
const { parseAIResponse } = require("../utils/aiUtils");

/**
 * Generates a structured study plan from topic performance stats.
 * Returns a guaranteed structure even if AI fails.
 */
const generateStudyPlan = async (topicStats) => {
    // Build weak areas list (< 60% accuracy)
    const weakAreas = [];
    const formattedStats = Object.entries(topicStats)
        .map(([topic, stats]) => {
            const percent = ((stats.correct / stats.total) * 100).toFixed(0);
            if (parseFloat(percent) < 60) {
                weakAreas.push(topic);
            }
            return `${topic}: ${percent}% (${stats.correct}/${stats.total})`;
        })
        .join("\n");

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert coding mentor. Return ONLY valid JSON. No markdown. No explanations."
                    },
                    {
                        role: "user",
                        content: `Based on this topic performance from a mock interview test:

${formattedStats}

Return a JSON object with EXACTLY this structure:
{
  "weakAreas": ["topic1", "topic2"],
  "studyPlan": [
    { "day": 1, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 2, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 3, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 4, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 5, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 6, "focus": "Topic Name", "tasks": "What to study" },
    { "day": 7, "focus": "Topic Name", "tasks": "What to study" }
  ],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Return ONLY the JSON object. No text before or after.`
                    }
                ],
                temperature: 0.5
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`
                }
            }
        );

        const content = response.data.choices[0].message.content;

        const parsed = parseAIResponse(content);

        // Validate the structure
        if (parsed && typeof parsed === "object") {
            return {
                weakAreas: parsed.weakAreas || weakAreas,
                studyPlan: Array.isArray(parsed.studyPlan) ? parsed.studyPlan : [],
                recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : []
            };
        }

        // AI returned something but wrong structure — use fallback
        return buildFallback(weakAreas);

    } catch (error) {
        console.error("❌ Study Plan Error:", error.response?.data || error.message);
        return buildFallback(weakAreas);
    }
};

/**
 * Fallback recommendation when AI fails.
 * Always returns a valid structure so the frontend never gets null.
 */
function buildFallback(weakAreas) {
    return {
        weakAreas: weakAreas,
        studyPlan: weakAreas.slice(0, 7).map((topic, i) => ({
            day: i + 1,
            focus: topic,
            tasks: `Review ${topic} fundamentals and practice problems`
        })),
        recommendations: [
            "Focus on your weak areas identified above",
            "Practice coding problems daily on LeetCode or HackerRank",
            "Review core concepts before attempting another mock test"
        ]
    };
}

module.exports = { generateStudyPlan };
