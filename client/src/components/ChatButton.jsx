import { useEffect, useState } from "react";
import api from "../utils/axios";
import ChatModal from "./ChatModal";

const ChatButton = ({ bookingId, booking, role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasChatAccess, setHasChatAccess] = useState(false);

  const chatAllowed =
    booking?.status === "accepted" ||
    booking?.status === "collected" ||
    booking?.status === "completed";

  useEffect(() => {
    setHasChatAccess(chatAllowed);
  }, [booking?.status, chatAllowed]);

  // Check for unread messages every 4 seconds
  useEffect(() => {
    if (!hasChatAccess) return;
    
    const checkUnread = async () => {
      try {
        const res = await api.get(`/user-chat/booking/${bookingId}`);
        if (res.data.success) {
          const chat = res.data.chat;
          const unread = chat.messages?.filter(
            (msg) => msg.senderRole !== role && !msg.isRead
          ).length || 0;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to check unread messages:", err);
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 4000);
    return () => clearInterval(interval);
  }, [bookingId, role, hasChatAccess]);

  if (!hasChatAccess) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        style={{
          ...S.chatButton,
          position: "relative",
        }}
        title="Open chat"
      >
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

        {unreadCount > 0 && (
          <span style={S.badge}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <ChatModal
        bookingId={bookingId}
        booking={booking}
        role={role}
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          setUnreadCount(0);
        }}
      />
    </>
  );
};

const S = {
  chatButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
  },

  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
    border: "2px solid #fff",
    boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
  },
};

export default ChatButton;
