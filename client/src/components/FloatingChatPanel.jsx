import { useEffect, useState, useRef } from "react";
import api from "../utils/axios";
import ChatModal from "./ChatModal";

/**
 * FloatingChatPanel - A floating sidebar for managing all active chats
 * Shows unread message count and quick access to conversations
 */
const FloatingChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  // Poll for conversations every 3 seconds when panel is open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(fetchConversations, 3000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user-chat/conversations");
      if (res.data.success) {
        const convos = res.data.conversations || [];
        setConversations(convos);

        // Calculate total unread
        let unread = 0;
        convos.forEach((conv) => {
          unread += conv.messages?.filter((msg) => !msg.isRead).length || 0;
        });
        setTotalUnread(unread);
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          ...S.floatingBtn,
          position: "fixed",
          bottom: "24px",
          right: "24px",
          zIndex: 998,
        }}
        title="Open chat"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>

        {totalUnread > 0 && <span style={S.badge}>{totalUnread > 99 ? "99+" : totalUnread}</span>}
      </button>

      {/* Chat Panel Sidebar */}
      {isOpen && (
        <div style={S.panelOverlay} onClick={() => setIsOpen(false)}>
          <div style={S.panel} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={S.panelHeader}>
              <div>
                <h2 style={S.panelTitle}>Messages</h2>
                <p style={S.panelSubtitle}>{conversations.length} active chat{conversations.length !== 1 ? "s" : ""}</p>
              </div>
              <button onClick={() => setIsOpen(false)} style={S.closeBtn}>
                ✕
              </button>
            </div>

            {/* Conversations List */}
            <div style={S.conversationsList}>
              {loading ? (
                <div style={S.loadingContainer}>
                  <div style={S.spinner} />
                  <p style={S.loadingText}>Loading chats...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div style={S.emptyContainer}>
                  <div style={S.emptyIcon}>💬</div>
                  <p style={S.emptyText}>No active chats yet</p>
                  <p style={S.emptySubtext}>Your chats will appear here after expert accepts</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const unread = conv.messages?.filter((msg) => !msg.isRead).length || 0;
                  const lastMsg = conv.messages?.[conv.messages.length - 1];
                  const otherUser = conv.farmer?.email === localStorage.getItem("currentUserEmail") ? conv.expert : conv.farmer;

                  return (
                    <button
                      key={conv._id}
                      onClick={() => setSelectedBookingId(conv.booking._id)}
                      style={{
                        ...S.convItem,
                        ...(selectedBookingId === conv.booking._id ? S.convItemActive : {}),
                      }}
                    >
                      <div style={S.convAvatar}>
                        {otherUser?.profilePhoto ? (
                          <img
                            src={otherUser.profilePhoto}
                            alt={otherUser.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <span>{otherUser?.name?.[0]?.toUpperCase() || "?"}</span>
                        )}
                      </div>
                      <div style={S.convContent}>
                        <div style={S.convHeader}>
                          <p style={S.convName}>{otherUser?.name || "User"}</p>
                          {unread > 0 && <span style={S.unreadBadge}>{unread}</span>}
                        </div>
                        <p style={S.convMessage}>
                          {lastMsg?.message?.length > 40
                            ? lastMsg.message.substring(0, 40) + "..."
                            : lastMsg?.message || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal when conversation is selected */}
      {selectedBookingId && (
        <ChatModal
          bookingId={selectedBookingId}
          booking={{ _id: selectedBookingId }}
          role={localStorage.getItem("userRole") || "farmer"}
          isOpen={true}
          onClose={() => {
            setSelectedBookingId(null);
            fetchConversations(); // Refresh after closing
          }}
        />
      )}
    </>
  );
};

const S = {
  floatingBtn: {
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 28px rgba(16, 185, 129, 0.4)",
    transition: "all 0.3s ease",
  },

  badge: {
    position: "absolute",
    top: "-6px",
    right: "-6px",
    minWidth: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "#ef4444",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "700",
    border: "2px solid #fff",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
  },

  panelOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.3)",
    zIndex: 997,
    backdropFilter: "blur(2px)",
  },

  panel: {
    position: "fixed",
    right: 0,
    top: 0,
    width: "100%",
    maxWidth: "380px",
    height: "100vh",
    background: "#fff",
    boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    zIndex: 998,
    animation: "slideInRight 0.3s ease-out",
  },

  panelHeader: {
    padding: "20px 24px",
    borderBottom: "1.5px solid #f3f4f6",
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  panelTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: "700",
    color: "#111827",
  },

  panelSubtitle: {
    margin: "4px 0 0",
    fontSize: "12px",
    color: "#9ca3af",
  },

  closeBtn: {
    background: "rgba(22, 101, 52, 0.1)",
    border: "none",
    color: "#166534",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "700",
    transition: "all 0.2s",
  },

  conversationsList: {
    flex: 1,
    overflowY: "auto",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
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
    width: "32px",
    height: "32px",
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
    textAlign: "center",
    padding: "20px",
  },

  emptyIcon: {
    fontSize: "48px",
  },

  emptyText: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "#1f2937",
  },

  emptySubtext: {
    margin: 0,
    fontSize: "12px",
    color: "#9ca3af",
  },

  convItem: {
    display: "flex",
    gap: "12px",
    padding: "12px 14px",
    background: "transparent",
    border: "1.5px solid transparent",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "inherit",
    textAlign: "left",
  },

  convItemActive: {
    background: "#f0fdf4",
    border: "1.5px solid #bbf7d0",
    boxShadow: "0 2px 8px rgba(16, 185, 129, 0.1)",
  },

  convAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "10px",
    background: "#e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#6b7280",
    flexShrink: 0,
  },

  convContent: {
    flex: 1,
    minWidth: 0,
  },

  convHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: "4px",
  },

  convName: {
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

  convMessage: {
    margin: 0,
    fontSize: "11px",
    color: "#9ca3af",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};

export default FloatingChatPanel;
