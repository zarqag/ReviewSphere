const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

exports.analyzeReview = async (reviewText) => {
  try {
    const response = await client.chat.completions.create({
      model: "google/gemma-3-4b-it",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Analyze this student review about a college or company.

Respond with valid JSON only. No markdown, no backticks, no extra text.

Return exactly this format:
{
  "sentiment": "positive",
  "summary": "one sentence summary under 20 words",
  "pros": ["pro 1", "pro 2", "pro 3"],
  "cons": ["con 1", "con 2"]
}

Rules:
- sentiment must be exactly "positive", "neutral", or "negative"
- summary must be one sentence under 20 words
- pros and cons must be short phrases under 6 words each
- if no clear pros or cons, return empty arrays []

Review:
"${reviewText}"`,
        },
      ],
    });

    const raw = response.choices[0].message.content.trim();
    const cleaned = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (err) {
    console.error("❌ NVIDIA AI analysis failed:", err.message);
    return {
      sentiment: "neutral",
      summary: "",
      pros: [],
      cons: [],
    };
  }
};
