import express from "express";
import Groq from "groq-sdk";

const router = express.Router();

/* ==========================================
   Initialize Groq
========================================== */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

/* ==========================================
   GET /api/chat/suggestions
========================================== */
router.get("/suggestions", (req, res) => {
  return res.json({
    success: true,
    data: {
      suggestions: [
        "How to improve crop yield?",
        "Best fertilizer for rice?",
        "How to control pests naturally?",
        "Weather impact on farming?",
        "Soil health improvement tips?",
        "Irrigation methods for dry season?",
      ],
    },
  });
});

/* ==========================================
   POST /api/chat/analyze
========================================== */
router.post("/analyze", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        success: false,
        message: "GROQ_API_KEY missing in .env",
      });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // ✅ Updated working free model
      messages: [
        {
          role: "system",
          content:
            "You are AgroSewa AI, an agriculture expert assistant. Give helpful farming advice in simple language.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply =
      completion.choices?.[0]?.message?.content || "No response";

    return res.json({
      success: true,
      data: {
        response: reply,
      },
    });
  } catch (error) {
    console.log("🔥 GROQ ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.error?.message ||
        error.message ||
        "Chatbot failed",
    });
  }
});

export default router;
