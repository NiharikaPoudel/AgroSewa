import Chat from "../models/Chat.js";
import Booking from "../models/Booking.js";
import userModel from "../models/usermodel.js";

/* ═══════════════════════════════════════════════════════════════════
   GET ALL CONVERSATIONS FOR A USER
═══════════════════════════════════════════════════════════════════ */
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    const chats = await Chat.find({
      $or: [{ farmer: userId }, { expert: userId }],
      active: true,
    })
      .populate("farmer", "name email profilePhoto")
      .populate("expert", "name email profilePhoto")
      .populate("booking", "fieldName status collectionDate")
      .sort({ lastMessageTime: -1 });

    return res.json({
      success: true,
      conversations: chats,
    });
  } catch (err) {
    console.error("Get conversations error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET SPECIFIC CHAT BY BOOKING ID
═══════════════════════════════════════════════════════════════════ */
export const getChatByBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    // Verify user is part of this booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    if (
      booking.farmer.toString() !== userId &&
      booking.expert.toString() !== userId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this chat",
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ booking: bookingId });

    if (!chat) {
      chat = await Chat.create({
        booking: bookingId,
        farmer: booking.farmer,
        expert: booking.expert,
        messages: [],
      });
    }

    // Populate data
    chat = await chat.populate([
      { path: "farmer", select: "name email profilePhoto" },
      { path: "expert", select: "name email profilePhoto" },
      { path: "booking", select: "fieldName status collectionDate" },
    ]);

    return res.json({
      success: true,
      chat,
    });
  } catch (err) {
    console.error("Get chat error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat",
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   SEND MESSAGE
═══════════════════════════════════════════════════════════════════ */
export const sendMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // Get booking to verify authorization
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    const isExpert = booking.expert.toString() === userId;
    const isFarmer = booking.farmer.toString() === userId;

    if (!isExpert && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to chat on this booking",
      });
    }

    // Check booking status - chat only allowed if expert accepted
    if (booking.status !== "accepted" && booking.status !== "collected" && booking.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Chat is only available after expert accepts the booking",
      });
    }

    // Get or create chat
    let chat = await Chat.findOne({ booking: bookingId });

    if (!chat) {
      chat = await Chat.create({
        booking: bookingId,
        farmer: booking.farmer,
        expert: booking.expert,
        messages: [],
      });
    }

    // Get sender info
    const user = await userModel.findById(userId).select("name email");

    // Add message
    chat.messages.push({
      sender: userId,
      senderRole: isExpert ? "expert" : "farmer",
      senderName: user.name,
      message: message.trim(),
      isRead: false,
      createdAt: new Date(),
    });

    // Update last message
    chat.lastMessage = message.trim();
    chat.lastMessageTime = new Date();
    chat.lastMessageSender = userId;

    await chat.save();

    // Populate and return
    const updatedChat = await chat.populate([
      { path: "farmer", select: "name email profilePhoto" },
      { path: "expert", select: "name email profilePhoto" },
      { path: "booking", select: "fieldName status collectionDate" },
    ]);

    return res.json({
      success: true,
      chat: updatedChat,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error("Send message error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   MARK MESSAGE AS READ
═══════════════════════════════════════════════════════════════════ */
export const markMessageAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const chat = await Chat.findOne({ booking: bookingId });

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found",
      });
    }

    // Mark all unread messages from other user as read
    let updated = false;
    chat.messages.forEach((msg) => {
      if (!msg.isRead && msg.sender.toString() !== userId) {
        msg.isRead = true;
        updated = true;
      }
    });

    if (updated) {
      await chat.save();
    }

    return res.json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
};

/* ═══════════════════════════════════════════════════════════════════
   GET UNREAD MESSAGE COUNT FOR NOTIFICATIONS
═══════════════════════════════════════════════════════════════════ */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      $or: [{ farmer: userId }, { expert: userId }],
      active: true,
    });

    let totalUnread = 0;
    chats.forEach((chat) => {
      const unreadCount = chat.messages?.filter(
        (msg) => !msg.isRead && msg.sender.toString() !== userId
      ).length || 0;
      totalUnread += unreadCount;
    });

    return res.json({
      success: true,
      unreadCount: totalUnread,
    });
  } catch (err) {
    console.error("Get unread count error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread count",
    });
  }
};
