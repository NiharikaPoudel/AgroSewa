import express from "express";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
// ✅ FIX: "protect" does NOT exist in adminAuth.js — it only has "export default adminAuth"
// userAuth is the correct middleware that works for ANY logged-in user
import userAuth from "../middleware/userAuth.js";

const router = express.Router();

router.get("/",              userAuth, getMyNotifications);
router.put("/:id/read",      userAuth, markAsRead);
router.put("/mark-all/read", userAuth, markAllAsRead);

export default router;