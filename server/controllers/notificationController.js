import Notification from "../models/Notification.js";

// ─── GET MY NOTIFICATIONS ───────────────────────
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json({ success: true, notifications });
  } catch (error) {
    console.error("getMyNotifications error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MARK SINGLE AS READ ────────────────────────
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    return res.json({ success: true, notification });
  } catch (error) {
    console.error("markAsRead error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── MARK ALL AS READ ───────────────────────────
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true }
    );

    return res.json({ success: true, message: "All notifications marked as read." });
  } catch (error) {
    console.error("markAllAsRead error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};