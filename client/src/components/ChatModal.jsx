import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const ChatModal = ({ bookingId, booking, role, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Check if chat is allowed (expert must have accepted)
  const chatAllowed =
    booking?.status === "accepted" ||
    booking?.status === "collected" ||
    booking?.status === "completed";

  useEffect(() => {
    if (isOpen && chatAllowed) {
      fetchChat();
    }
  }, [bookingId, isOpen, chatAllowed]);

  useEffect(() => {
    // Auto-scroll to latest message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages every 2 seconds when modal is open
  useEffect(() => {
    if (!isOpen || !chatAllowed) return;
    const interval = setInterval(fetchChat, 2000);
    return () => clearInterval(interval);
  }, [bookingId, isOpen, chatAllowed]);

  const fetchChat = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/user-chat/booking/${bookingId}`);
      if (res.data.success) {
        const chatData = res.data.chat;
        setChat(chatData);
        setMessages(chatData.messages || []);

        // Count unread messages from other user
        const unread = chatData.messages?.filter(
          (msg) => msg.senderRole !== role && !msg.isRead
        ).length || 0;
        setUnreadCount(unread);

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

  if (!isOpen) return null;

  const otherUser = role === "farmer" ? chat?.expert : chat?.farmer;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.headerLeft}>
            <button
              onClick={onClose}
              style={S.backBtn}
              title="Close chat"
            >
              ← Back
            </button>
            <div style={S.headerInfo}>
              <h2 style={S.headerTitle}>
                {role === "farmer"
                  ? t("chat.chatWithExpert", { expertName: otherUser?.name || "Expert" })
                  : t("chat.chatWithFarmer", { farmerName: otherUser?.name || "Farmer" })}
              </h2>
              <p style={S.headerStatus}>
                {chat?.booking?.fieldName} • {chat?.booking?.status?.toUpperCase()}
              </p>
            </div>
          </div>
          <div style={S.otherUserAvatar}>
            {otherUser?.profilePhoto ? (
              <img
                src={otherUser.profilePhoto}
                alt={otherUser.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={S.avatarText}>{otherUser?.name?.[0]?.toUpperCase() || "?"}</span>
            )}
          </div>
        </div>

        {/* User Details Card */}
        <div style={S.userDetailsCard}>
          <div style={S.userDetailsFlex}>
            <div>
              <p style={S.detailLabel}>
                {role === "farmer" ? "Expert Name" : "Farmer Name"}
              </p>
              <p style={S.detailValue}>{otherUser?.name || "—"}</p>
            </div>
            <div>
              <p style={S.detailLabel}>Email</p>
              <p style={S.detailValue}>{otherUser?.email || "—"}</p>
            </div>
            <div>
              <p style={S.detailLabel}>Phone</p>
              <p style={S.detailValue}>{otherUser?.phoneNumber || "—"}</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        {loading ? (
          <div style={S.messagesContainer}>
            <div style={S.loadingContainer}>
              <div style={S.spinner} />
              <p style={S.loadingText}>{t("chat.loading")}</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div style={S.messagesContainer}>
            <div style={S.emptyContainer}>
              <div style={S.emptyIcon}>💬</div>
              <p style={S.emptyText}>
                {t("chat.startChatAfterAccept")}
              </p>
            </div>
          </div>
        ) : (
          <div style={S.messagesContainer}>
            {messages.map((msg, idx) => {
              const isCurrentUser = msg.senderRole === role;
              return (
                <div
                  key={idx}
                  style={{
                    ...S.messageGroup,
                    justifyContent: isCurrentUser ? "flex-end" : "flex-start",
                  }}
                >
                  {!isCurrentUser && (
                    <div style={S.senderAvatar}>
                      {otherUser?.profilePhoto ? (
                        <img
                          src={otherUser.profilePhoto}
                          alt={msg.senderName}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span>{msg.senderName?.[0]?.toUpperCase() || "?"}</span>
                      )}
                    </div>
                  )}
                  <div
                    style={{
                      ...S.messageBubble,
                      ...(isCurrentUser ? S.messageBubbleOwn : S.messageBubbleOther),
                    }}
                  >
                    {!isCurrentUser && (
                      <p style={S.messageSenderName}>{msg.senderName}</p>
                    )}
                    <p style={S.messageText}>{msg.message}</p>
                    <span style={S.messageTime}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  {isCurrentUser && <div style={S.spacing} />}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Message Input */}
        {chatAllowed && (
          <form onSubmit={sendMessage} style={S.inputForm}>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder={t("chat.messagePlaceholder")}
              disabled={sending}
              style={S.input}
              autoFocus
            />
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              style={{
                ...S.sendBtn,
                ...(sending || !messageInput.trim() ? S.sendBtnDisabled : {}),
              }}
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        )}

        {!chatAllowed && (
          <div style={S.disabledFooter}>
            <p style={S.disabledFooterText}>{t("chat.startChatAfterAccept")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

const S = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    padding: "20px",
  },

  modal: {
    display: "flex",
    flexDirection: "column",
    background: "#fff",
    borderRadius: "16px",
    width: "100%",
    maxWidth: "600px",
    maxHeight: "85vh",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    animation: "modalSlideIn 0.3s ease-out",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    borderBottom: "1.5px solid #f3f4f6",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
  },

  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flex: 1,
    minWidth: 0,
  },

  backBtn: {
    background: "rgba(22, 101, 52, 0.1)",
    border: "none",
    color: "#166534",
    padding: "8px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "12px",
    transition: "all 0.2s",
  },

  headerInfo: {
    minWidth: 0,
  },

  headerTitle: {
    margin: "0 0 3px",
    fontSize: "16px",
    fontWeight: "700",
    color: "#111827",
  },

  headerStatus: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },

  otherUserAvatar: {
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    background: "#dcfce7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: "700",
    color: "#166534",
    flexShrink: 0,
    border: "2px solid #bbf7d0",
  },

  avatarText: {
    fontWeight: "700",
  },

  userDetailsCard: {
    padding: "16px 24px",
    background: "#fafafa",
    borderBottom: "1px solid #f3f4f6",
  },

  userDetailsFlex: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "16px",
  },

  detailLabel: {
    margin: "0 0 4px",
    fontSize: "10px",
    fontWeight: "700",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  detailValue: {
    margin: 0,
    fontSize: "13px",
    fontWeight: "600",
    color: "#1f2937",
    wordBreak: "break-all",
  },

  messagesContainer: {
    flex: 1,
    overflowY: "auto",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    backgroundColor: "#fff",
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
    width: "28px",
    height: "28px",
    border: "3px solid #f3f4f6",
    borderTopColor: "#10b981",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },

  loadingText: {
    margin: 0,
    fontSize: "13px",
    color: "#6b7280",
  },

  emptyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: "12px",
  },

  emptyIcon: {
    fontSize: "48px",
  },

  emptyText: {
    margin: 0,
    fontSize: "14px",
    color: "#9ca3af",
    textAlign: "center",
  },

  messageGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "4px",
    alignItems: "flex-end",
  },

  senderAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "700",
    color: "#6b7280",
    flexShrink: 0,
  },

  spacing: {
    width: "32px",
    flexShrink: 0,
  },

  messageBubble: {
    maxWidth: "65%",
    padding: "12px 16px",
    borderRadius: "12px",
    wordWrap: "break-word",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },

  messageBubbleOwn: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    borderBottomRightRadius: "4px",
  },

  messageBubbleOther: {
    background: "#f3f4f6",
    color: "#1f2937",
    borderBottomLeftRadius: "4px",
  },

  messageSenderName: {
    margin: "0 0 4px",
    fontSize: "11px",
    fontWeight: "700",
    opacity: 0.8,
  },

  messageText: {
    margin: "0 0 4px",
    fontSize: "14px",
    lineHeight: "1.5",
  },

  messageTime: {
    fontSize: "10px",
    opacity: 0.7,
    display: "block",
    marginTop: "4px",
  },

  inputForm: {
    display: "flex",
    gap: "12px",
    padding: "16px 24px",
    borderTop: "1.5px solid #f3f4f6",
    background: "#fafafa",
    flexShrink: 0,
  },

  input: {
    flex: 1,
    padding: "11px 14px",
    fontSize: "14px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    fontFamily: "inherit",
    transition: "all 0.2s",
  },

  sendBtn: {
    padding: "11px 24px",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "all 0.2s",
    flexShrink: 0,
  },

  sendBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  disabledFooter: {
    padding: "16px 24px",
    background: "#fef9c3",
    border: "1.5px solid #fde68a",
    textAlign: "center",
  },

  disabledFooterText: {
    margin: 0,
    fontSize: "13px",
    color: "#92400e",
    fontWeight: "600",
  },
};

export default ChatModal;
