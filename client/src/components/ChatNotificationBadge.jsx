import { useEffect, useState } from "react";
import api from "../utils/axios";

const ChatNotificationBadge = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    checkUnreadCount();
    // Check every 5 seconds
    const interval = setInterval(checkUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const checkUnreadCount = async () => {
    try {
      const res = await api.get("/user-chat/unread-count");
      if (res.data.success) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  if (unreadCount === 0) {
    return null;
  }

  return (
    <div style={S.badge}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span style={S.count}>{unreadCount > 9 ? "9+" : unreadCount}</span>
    </div>
  );
};

const S = {
  badge: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#10b981",
  },
  count: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    minWidth: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "9px",
    fontWeight: "700",
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
  },
};

export default ChatNotificationBadge;
