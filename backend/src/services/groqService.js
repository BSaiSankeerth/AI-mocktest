const axios = require("axios");
const { parseAIResponse } = require("../utils/aiUtils");


const generateMockTestFromResume = async (resumeText) => {
    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert technical interviewer. Always return valid JSON only."
                    },
                    {
                        role: "user",
                        content: `
Based on the following resume:

${resumeText}

Generate 25 multiple choice technical questions.

Each question must follow this JSON structure:

{
  "question": string,
  "options": string[],
  "correctAnswer": string,
  "topic": string,
  "difficulty": "easy" | "medium" | "hard"
}

Return ONLY valid JSON array.
Each object must have "options" as an array of 4 strings.
Do not add explanations.
Do not add markdown.
Do not add text outside JSON.
            `
                    }
                ],
                temperature: 0.7
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

        if (!parsed) {
            throw new Error("Failed to parse AI response into JSON");
        }

        return parsed;

    } catch (error) {
        console.error("Groq API Full Error:", error.response?.data || error.message);
        throw new Error("AI generation failed");
    }
};

module.exports = { generateMockTestFromResume };
