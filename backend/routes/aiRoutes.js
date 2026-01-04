// 🧠 AI Routes
import express from "express";
import {
  analyzeSentiment,
  getSuggestions,
  translateMessage,
  summarizeConversation,
  detectSpam,
  recognizeIntent,
  filterProfanity,
} from "../services/aiService.js";

const router = express.Router();

router.post("/analyze-sentiment", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const sentiment = await analyzeSentiment(text);
    res.json(sentiment);
  } catch (err) {
    console.error("Sentiment route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/get-suggestions", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const suggestions = await getSuggestions(message);
    res.json(suggestions);
  } catch (err) {
    console.error("Suggestions route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/translate", async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const translation = await translateMessage(text, targetLanguage || "es");
    res.json(translation);
  } catch (err) {
    console.error("Translation route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/summarize", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages))
      return res.status(400).json({ message: "Messages array is required" });

    const summary = await summarizeConversation(messages);
    res.json(summary);
  } catch (err) {
    console.error("Summarize route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/detect-spam", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const result = await detectSpam(text);
    res.json(result);
  } catch (err) {
    console.error("Spam detection route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/recognize-intent", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const intent = await recognizeIntent(message);
    res.json(intent);
  } catch (err) {
    console.error("Intent recognition route error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/filter-profanity", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const filtered = await filterProfanity(text);
    res.json(filtered);
  } catch (err) {
    console.error("Profanity filter route error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router; // ✅ This must be present
