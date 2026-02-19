/**
 * Parses AI response content to extract validation JSON.
 * Removes markdown code blocks (```json ... ```) if present.
 * Finds the first JSON-like structure ({} or []) and parses it.
 * @param {string} content - The raw string response from AI.
 * @returns {object|array|null} - The parsed JSON object/array or null if parsing fails.
 */
const parseAIResponse = (response) => {
    if (!response) return null;
    try {
        console.log("Raw Response received:", response.substring(0, 100)); // Log first 100 chars

        // 1. Try finding JSON array [ ... ]
        const arrayMatch = response.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
            const parsed = JSON.parse(arrayMatch[0]);
            return parsed;
        }

        // 2. Try finding JSON object { ... }
        const objectMatch = response.match(/\{[\s\S]*\}/);
        if (objectMatch) {
            const parsed = JSON.parse(objectMatch[0]);
            return parsed.questions || parsed;
        }

        return null;
    } catch (error) {
        console.error("JSON Parsing Failed:", error.message);
        return null;
    }
};

module.exports = { parseAIResponse };
