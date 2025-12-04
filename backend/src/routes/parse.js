import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

const router = express.Router();

dotenv.config();

// Initialize OpenAI client with OpenRouter
const apiKey = process.env.OPENROUTER_API_KEY;
const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: apiKey,
});

router.post("/", async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || typeof transcript !== "string") {
      return res.status(400).json({ error: "Transcript is required" });
    }

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    const prompt = `
You are a parser for task creation commands spoken by a user.
Extract structured fields from the following transcript.

Transcript: "${transcript}"

Return a JSON object with:
- title: string
- description: string (optional longer context, may be same as title)
- priority: one of ["LOW","MEDIUM","HIGH","CRITICAL"] (default "MEDIUM")
- status: one of ["TO_DO","IN_PROGRESS","DONE"] (default "TO_DO")
- dueDate: ISO 8601 datetime string if you can determine a due date, otherwise null.

Interpret relative dates like "tomorrow", "next Monday", "in 3 days" based on the current date.
Do not include any extra keys, markdown or explanation. Return only valid JSON.
`;

    const apiResponse = await client.chat.completions.create({
      model: "openai/gpt-oss-20b:free",
      messages: [
        { role: "system", content: "You are a helpful JSON API." },
        { role: "user", content: prompt },
      ],
      temperature: 0.2,
    });

    const content = apiResponse.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse LLM JSON:", content);
      return res.status(502).json({ error: "Invalid parser response" });
    }

    return res.json({
      transcript,
      parsed,
    });
  } catch (err) {
    console.error("OpenRouter error:", err);
    return res.status(500).json({ error: "Failed to parse transcript" });
  }
});

export default router;


