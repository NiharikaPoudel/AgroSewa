import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const ChatBox = ({ bookingId, booking, role }) => {
  const { t } = useTranslation();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Check if chat is allowed (expert must have accepted)
  const chatAllowed = booking?.status === "accepted" || booking?.status === "collected" || booking?.status === "completed";

  useEffect(() => {
    fetchChat();
  }, [bookingId]);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!chatAllowed) return;
    const interval = setInterval(fetchChat, 3000);
    return () => clearInterval(interval);
  }, [bookingId, chatAllowed]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user-chat/booking/${bookingId}`);
      if (res.data.success) {
        const chatData = res.data.chat;
        setChat(chatData);
        setMessages(chatData.messages || []);

        // Mark messages as read
        await api.put(`/user-chat/booking/${bookingId}/read`);
      }
    } catch (err) {
      console.error("Failed to fetch chat:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    if (!chatAllowed) {
      alert(t("chat.messageNotAllowed"));
      return;
    }

    try {
      setSending(true);
      const res = await api.post("/user-chat/send", {
        bookingId,
        message: messageInput,
      });

      if (res.data.success) {
        setMessages(res.data.chat.messages);
        setMessageInput("");
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      alert(t("chat.errorSendingMessage"));
    } finally {
      setSending(false);
    }
  };

  if (!chatAllowed) {
    return (
      <div style={S.disabledContainer}>
        <div style={S.disabledIcon}>💬</div>
        <p style={S.disabledTitle}>{t("chat.title")}</p>
        <p style={S.disabledText}>{t("chat.startChatAfterAccept")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={S.container}>
        <div style={S.loadingContainer}>
          <div style={S.spinner} />
          <p style={S.loadingText}>{t("chat.loading")}</p>
        </div>
      </div>
    );
  }

  const otherUser = role === "farmer" ? chat?.expert : chat?.farmer;

  return (
    <div style={S.container}>
      {/* Chat Header */}
      <div style={S.header}>
        <div style={S.headerContent}>
          <h3 style={S.headerTitle}>
            {role === "farmer"
              ? t("chat.chatWithExpert", { expertName: otherUser?.name || "Expert" })
              : t("chat.chatWithFarmer", { farmerName: otherUser?.name || "Farmer" })}
          </h3>
          <p style={S.headerSub}>
            {t("chat.field")}: <strong>{chat?.booking?.fieldName}</strong> •{" "}
            {t("chat.status")}:{" "}
            <strong style={{ textTransform: "capitalize" }}>
              {chat?.booking?.status}
            </strong>
          </p>
        </div>
        <div style={S.userAvatar}>
          {otherUser?.profilePhoto ? (
            <img
              src={otherUser.profilePhoto}
              alt={otherUser.name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          ) : (
            <span>{otherUser?.name?.[0]?.toUpperCase() || "?"}</span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div style={S.messagesContainer}>
        {messages.length === 0 ? (
          <div style={S.emptyContainer}>
            <p style={S.emptyText}>{t("chat.startChatAfterAccept")}</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isCurrentUser = msg.senderRole === role;
            return (
              <div
                key={idx}
                style={{
                  ...S.messageWrapper,
                  justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...S.messageBubble,
                    ...(isCurrentUser ? S.messageBubbleOwn : S.messageBubbleOther),
                  }}
                >
                  <p style={S.messageSenderName}>
                    {isCurrentUser ? t("chat.you") : msg.senderName}
                  </p>
                  <p style={S.messageText}>{msg.message}</p>
                  <span style={S.messageTime}>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} style={S.inputForm}>
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder={t("chat.messagePlaceholder")}
          disabled={sending}
          style={S.input}
        />
        <button
          type="submit"
          disabled={sending || !messageInput.trim()}
          style={{
            ...S.sendBtn,
            ...(sending || !messageInput.trim() ? S.sendBtnDisabled : {}),
          }}
        >
          {sending ? t("chat.sending") : t("chat.send")}
        </button>
      </form>
    </div>
  );
};

const S = {
  container: {
    display: "flex",
    flexDirection: "column",
    height: "500px",
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },

  disabledContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "300px",
    background: "#f9fafb",
    border: "1.5px dashed #e5e7eb",
    borderRadius: "12px",
    padding: "24px",
    textAlign: "center",
  },

  disabledIcon: {
    fontSize: "48px",
    marginBottom: "12px",
  },

  disabledTitle: {
    margin: "0 0 8px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },

  disabledText: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
    maxWidth: "280px",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #f3f4f6",
    background: "#fafafa",
  },

  headerContent: {
    flex: 1,
    minWidth: 0,
  },

  headerTitle: {
    margin: "0 0 4px",
    fontSize: "15px",
    fontWeight: "700",
    color: "#111827",
  },

  headerSub: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
  },

  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#6b7280",
    marginLeft: "12px",
    flexShrink: 0,
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    backgroundColor: "#fff",
  },

  emptyContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },

  emptyText: {
    margin: 0,
    fontSize: "13px",
    color: "#9ca3af",
    textAlign: "center",
  },

  messageWrapper: {
    display: "flex",
    gap: "8px",
    marginBottom: "4px",
  },

  messageBubble: {
    maxWidth: "70%",
    padding: "10px 14px",
    borderRadius: "10px",
    wordWrap: "break-word",
  },

  messageBubbleOwn: {
    background: "#10b981",
    color: "#fff",
  },

  messageBubbleOther: {
    background: "#f3f4f6",
    color: "#1f2937",
  },

  messageSenderName: {
    margin: "0 0 2px",
    fontSize: "10px",
    fontWeight: "600",
    opacity: 0.8,
  },

  messageText: {
    margin: "0 0 4px",
    fontSize: "13px",
    lineHeight: "1.4",
  },

  messageTime: {
    fontSize: "9px",
    opacity: 0.7,
  },

  inputForm: {
    display: "flex",
    gap: "8px",
    padding: "14px 16px",
    borderTop: "1px solid #f3f4f6",
    background: "#fafafa",
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    fontSize: "13px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    outline: "none",
    fontFamily: "inherit",
    transitionDuration: "0.15s",
  },

  sendBtn: {
    padding: "10px 20px",
    background: "#10b981",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "opacity 0.15s, background 0.15s",
  },

  sendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "12px",
  },

  spinner: {
    width: "24px",
    height: "24px",
    border: "2.5px solid #e5e7eb",
    borderTopColor: "#10b981",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },

  loadingText: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },
};

export default ChatBox;
