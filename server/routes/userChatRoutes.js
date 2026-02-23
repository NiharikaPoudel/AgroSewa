import express from "express";
import userAuth from "../middleware/userAuth.js";
import {
  getConversations,
  getChatByBooking,
  sendMessage,
  markMessageAsRead,
  getUnreadCount,
} from "../controllers/userChatController.js";

const router = express.Router();

// All routes require authentication
router.use(userAuth);

// Get all conversations for current user
router.get("/conversations", getConversations);

// Get unread message count
router.get("/unread-count", getUnreadCount);

// Get chat for specific booking
router.get("/booking/:bookingId", getChatByBooking);

// Send message to booking chat
router.post("/send", sendMessage);

// Mark messages as read
router.put("/booking/:bookingId/read", markMessageAsRead);

export default router;
