import { useEffect, useState } from "react";
import api from "../utils/axios";
import ChatModal from "./ChatModal";

/**
 * ChatNotificationsSection - Displays unread chat messages in the notifications panel
 */
const ChatNotificationsSection = ({ isOpen }) => {
  const [chats, setChats] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchChats();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchChats, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user-chat/conversations");
      if (res.data.success) {
        // Filter only conversations with unread messages
        const unreadChats = (res.data.conversations || []).filter((conv) => {
          const unread = conv.messages?.filter((msg) => !msg.isRead).length || 0;
          return unread > 0;
        });
        setChats(unreadChats);
      }
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || chats.length === 0) {
    return null;
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h3 style={S.title}>💬 Unread Messages</h3>
        <span style={S.count}>{chats.length} chat{chats.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div style={S.loadingContainer}>
          <div style={S.spinner} />
          <p style={S.loadingText}>Loading...</p>
        </div>
      ) : (
        <div style={S.chatsList}>
          {chats.map((chat) => {
            const userRole = localStorage.getItem("userRole") || "farmer";
            const otherUser = userRole === "farmer" ? chat.expert : chat.farmer;
            const unreadCount = chat.messages?.filter((msg) => !msg.isRead).length || 0;
            const lastMsg = chat.messages?.[chat.messages.length - 1];

            return (
              <button
                key={chat._id}
                onClick={() => setSelectedBookingId(chat.booking._id)}
                style={S.chatItem}
              >
                <div style={S.avatar}>
                  {otherUser?.profilePhoto ? (
                    <img
                      src={otherUser.profilePhoto}
                      alt={otherUser.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <span>{otherUser?.name?.[0]?.toUpperCase() || "?"}</span>
                  )}
                  {unreadCount > 0 && <span style={S.unreadDot} />}
                </div>

                <div style={S.chatContent}>
                  <div style={S.chatHeader}>
                    <p style={S.userName}>{otherUser?.name || "User"}</p>
                    <span style={S.unreadBadge}>{unreadCount}</span>
                  </div>
                  <p style={S.lastMessage}>
                    {lastMsg?.message?.length > 35
                      ? lastMsg.message.substring(0, 35) + "..."
                      : lastMsg?.message || "No messages"}
                  </p>
                </div>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, color: "#10b981" }}
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}

      {selectedBookingId && (
        <ChatModal
          bookingId={selectedBookingId}
          booking={{ _id: selectedBookingId }}
          role={localStorage.getItem("userRole") || "farmer"}
          isOpen={true}
          onClose={() => {
            setSelectedBookingId(null);
            fetchChats();
          }}
        />
      )}
    </div>
  );
};

const S = {
  container: {
    marginBottom: "24px",
    background: "#fff",
    border: "1.5px solid #f3f4f6",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    background: "#fafafa",
  },

  title: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#111827",
  },

  count: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#9ca3af",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    gap: "12px",
  },

  spinner: {
    width: "24px",
    height: "24px",
    border: "2.5px solid #f3f4f6",
    borderTopColor: "#10b981",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },

  loadingText: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
  },

  chatsList: {
    display: "flex",
    flexDirection: "column",
  },

  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    background: "none",
    border: "none",
    borderBottom: "1px solid #f3f4f6",
    cursor: "pointer",
    transition: "background 0.15s",
    fontFamily: "inherit",
    textAlign: "left",

    "&:last-child": {
      borderBottom: "none",
    },
  },

  avatar: {
    position: "relative",
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    flexShrink: 0,
  },

  unreadDot: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#10b981",
    border: "2px solid #fff",
    boxShadow: "0 0 4px rgba(16, 185, 129, 0.4)",
  },

  chatContent: {
    flex: 1,
    minWidth: 0,
  },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "3px",
  },

  userName: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "700",
    color: "#1f2937",
  },

  unreadBadge: {
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
    flexShrink: 0,
  },

  lastMessage: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default ChatNotificationsSection;
