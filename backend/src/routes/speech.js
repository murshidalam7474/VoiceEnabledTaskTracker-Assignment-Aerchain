import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

const router = express.Router();
const rawAudio = express.raw({ type: "audio/*", limit: "10mb" });
dotenv.config();

router.post("/", rawAudio, async (req, res) => {
  try {
    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "DEEPGRAM_API_KEY is not configured" });
    }

    const audioBuffer = req.body;
    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: "No audio received" });
    }

    const dgRes = await fetch(
      "https://api.deepgram.com/v1/listen?punctuate=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": "audio/webm",
        },
        body: audioBuffer,
      }
    );

    if (!dgRes.ok) {
      const text = await dgRes.text();
      console.error("Deepgram error:", text);
      return res.status(502).json({ error: "Failed to transcribe audio" });
    }

    const data = await dgRes.json();
    const transcript =
      data.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcript) {
      return res
        .status(502)
        .json({ error: "No transcript returned from Deepgram" });
    }

    return res.json({ transcript });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to process audio" });
  }
});

export default router;


