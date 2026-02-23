import express from "express";
import { expertChat, analyzeChat, getSuggestions } from "../controllers/chatControllerr.js";
import authMiddleware from "../middleware/userAuth.js";

const router = express.Router();

/* ════════════════════════════════════════════════════════════════
   CHAT ROUTES
   Base path: /api/chat  (registered in server/app.js)

   GET  /api/chat/suggestions     — static suggestion chips (no auth)
   POST /api/chat/expert          — analytics: queries expert's own DB data
   POST /api/chat/analyze         — Groq AI: farming advice (personalized)
════════════════════════════════════════════════════════════════ */

// Static suggestions — no auth needed
router.get("/suggestions", getSuggestions);

// Analytics engine — expert JWT required
router.post("/expert", authMiddleware, expertChat);

// Groq AI farming advice — any logged-in user (expert, farmer, admin)
router.post("/analyze", authMiddleware, analyzeChat);

export default router;