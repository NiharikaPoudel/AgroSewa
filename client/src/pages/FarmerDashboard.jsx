import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { buildNotificationMessage } from "../utils/notificationHelper";
import ChatButton from "../components/ChatButton";
import ChatNotificationBadge from "../components/ChatNotificationBadge";

/* ═══════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════ */
const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const STATUS_CONFIG = (t) => ({
  pending:   { label: t("status.pending"), color: "#92400e", bg: "#fef3c7", border: "#fde68a", dot: "#f59e0b", desc: t("status.pending.desc") },
  assigned:  { label: t("status.assigned"), color: "#1e40af", bg: "#eff6ff", border: "#bfdbfe", dot: "#3b82f6", desc: t("status.assigned.desc") },
  accepted:  { label: t("status.accepted"), color: "#166534", bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", desc: t("status.accepted.desc") },
  collected: { label: t("status.collected"), color: "#5b21b6", bg: "#f5f3ff", border: "#ddd6fe", dot: "#8b5cf6", desc: t("status.collected.desc") },
  completed: { label: t("status.completed"), color: "#065f46", bg: "#ecfdf5", border: "#6ee7b7", dot: "#10b981", desc: t("status.completed.desc") },
  cancelled: { label: t("status.cancelled"), color: "#991b1b", bg: "#fef2f2", border: "#fecaca", dot: "#ef4444", desc: t("status.cancelled.desc") },
});

const getWorkflowSteps = (t) => [
  { key: "pending",   label: t("step.pending") },
  { key: "assigned",  label: t("step.assigned")  },
  { key: "accepted",  label: t("step.accepted") },
  { key: "collected", label: t("step.collected") },
  { key: "completed", label: t("step.completed") },
];

/* ═══════════════════════════════════════════════════════════
   SMALL COMPONENTS
═══════════════════════════════════════════════════════════ */
const StatusBadge = ({ status, t }) => {
  const config = STATUS_CONFIG(t);
  const c = config[status] || config.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.03em", background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
};

const WorkflowTracker = ({ status, t }) => {
  if (status === "cancelled") return null;
  const WORKFLOW_STEPS = getWorkflowSteps(t);
  const currentIdx = WORKFLOW_STEPS.findIndex((s) => s.key === status);
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "20px 0 4px", position: "relative" }}>
      {WORKFLOW_STEPS.map((step, idx) => {
        const done   = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* connector line */}
            {idx > 0 && (
              <div style={{ position: "absolute", top: 14, right: "50%", width: "100%", height: 2, background: done ? "linear-gradient(90deg,#10b981,#34d399)" : "#e5e7eb", zIndex: 0 }} />
            )}
            {/* circle */}
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: done ? (active ? "#059669" : "#10b981") : "#f3f4f6", border: `2px solid ${done ? "#10b981" : "#e5e7eb"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, position: "relative", boxShadow: active ? "0 0 0 4px rgba(16,185,129,0.15)" : "none", transition: "all 0.3s" }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 6l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <span style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af" }}>{idx + 1}</span>
              )}
            </div>
            {/* label */}
            <span style={{ marginTop: 7, fontSize: 9.5, fontWeight: active ? 700 : 600, color: done ? (active ? "#065f46" : "#059669") : "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.3, maxWidth: 60 }}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const InfoRow = ({ icon, children }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12.5, color: "#6b7280", fontWeight: 500 }}>
    {icon && <span style={{ opacity: 0.7 }}>{icon}</span>}
    {children}
  </span>
);

/* ═══════════════════════════════════════════════════════════
   MAIN FARMER DASHBOARD
═══════════════════════════════════════════════════════════ */
const FarmerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [downloading,  setDownloading]  = useState(null); // bookingId being downloaded
  const [expandedId,   setExpandedId]   = useState(null);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const token       = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  /* ── fetch bookings ── */
  const fetchBookings = async () => {
    if (!token) { navigate("/login"); return; }
    try {
      const { data } = await axios.get(`${BACKEND}/api/bookings/my`, authHeaders);
      if (data.success) setBookings(data.bookings);
    } catch (err) {
      console.error("fetchBookings:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔔 Fetch notifications
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setNotifLoading(true);
      const { data } = await axios.get(`${BACKEND}/api/notifications`, authHeaders);
      if (data.success) setNotifications(data.notifications);
    } catch (err) {
      console.error("fetchNotifications:", err);
    } finally {
      setNotifLoading(false);
    }
  };

  // Notification handlers
  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${BACKEND}/api/notifications/${notificationId}/read`, {}, authHeaders);
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${BACKEND}/api/notifications/mark-all/read`, {}, authHeaders);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  useEffect(() => { fetchBookings(); fetchNotifications(); }, []);

  /* ── report download ── */
  const downloadReport = async (booking) => {
    setDownloading(booking._id);
    try {
      const res = await axios.get(`${BACKEND}/api/bookings/${booking._id}/report`, {
        ...authHeaders,
        responseType: "blob",
      });
      const ext  = booking.reportFile?.split(".").pop() || "pdf";
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `SoilReport_${booking.fieldName}_${booking._id.slice(-6)}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Could not download the report. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  /* ── derived state ── */
  const stats = {
    total:      bookings.length,
    completed:  bookings.filter((b) => b.status === "completed").length,
    inProgress: bookings.filter((b) => !["completed", "cancelled"].includes(b.status)).length,
    reports:    bookings.filter((b) => b.status === "completed" && b.reportFile).length,
  };

  const FILTERS = [
    { key: "all",       label: "All Bookings" },
    { key: "pending",   label: "Pending"      },
    { key: "assigned",  label: "In Progress"  },
    { key: "completed", label: "Completed"    },
  ];

  const filtered = activeFilter === "all"
    ? bookings
    : activeFilter === "assigned"
      ? bookings.filter((b) => ["assigned", "accepted", "collected"].includes(b.status))
      : bookings.filter((b) => b.status === activeFilter);

  const fmt = (d) => new Date(d).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" });

  const handleNotificationClick = (notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    // No need to navigate since we're already on farmer dashboard
  };

  /* ══════════════════════════════════════════════════
     LOADING
  ══════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f8fafc", gap: 16 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 40 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{ width: 10, borderRadius: 4, background: ["#065f46", "#10b981", "#6ee7b7"][i], animation: `bounce 0.9s ease-in-out ${i * 0.15}s infinite`, height: [28, 40, 22][i] }} />
          ))}
        </div>
        <p style={{ color: "#6b7280", fontSize: 13, fontWeight: 600, margin: 0 }}>Loading your soil tests...</p>
        <style>{`@keyframes bounce{0%,100%{transform:scaleY(1)}50%{transform:scaleY(.4)}}`}</style>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════
     MAIN RENDER
  ══════════════════════════════════════════════════ */
  return (
    <>
      <div style={P.page}>

        {/* ── HEADER ── */}
        <div style={P.header}>
          <div>
            <button style={P.backBtn} onClick={() => navigate(-1)}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              {t("back")}
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", animation: "pulse 2s ease-in-out infinite" }} />
              <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "#10b981" }}>{t("farmerPortal")}</span>
            </div>
            <h1 style={{ margin: "0 0 4px", fontSize: "clamp(22px,3vw,32px)", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.04em" }}>{t("mySoilTests")}</h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#64748b", fontWeight: 500 }}>{t("trackRequestsAndReports")}</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notification Bell */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => e.target.style.color = "#10b981"}
              onMouseLeave={(e) => e.target.style.color = "#6b7280"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {notifications.filter(n => !n.isRead).length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  minWidth: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#ef4444",
                  border: "2px solid #fff",
                  fontSize: "10px",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "700",
                  padding: "0 3px",
                }}>
                  {notifications.filter(n => !n.isRead).length}
                </div>
              )}
            </button>
            <ChatNotificationBadge />
            <button style={P.newBtn} onClick={() => navigate("/book-service")}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v12M2 8h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              {t("bookNewTest")}
            </button>
          </div>
        </div>

        {/* ── NOTIFICATIONS PANEL ── */}
        {showNotifications && (
          <div style={{
            marginBottom: "24px",
            maxHeight: "400px",
            overflowY: "auto",
            background: "#fff",
            border: "1.5px solid #e5e7eb",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
              background: "#fafafa",
              position: "sticky",
              top: "0",
            }}>
              <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "700", color: "#111827" }}>
                {t("notifications.title")} {notifications.filter(n => !n.isRead).length > 0 && `(${notifications.filter(n => !n.isRead).length})`}
              </h3>
              <div style={{ display: "flex", gap: "10px" }}>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    style={{
                      padding: "5px 12px",
                      fontSize: "11px",
                      fontWeight: "600",
                      background: "#f0fdf4",
                      border: "1px solid #bbf7d0",
                      borderRadius: "6px",
                      cursor: "pointer",
                      color: "#10b981",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#dcfce7";
                      e.target.style.borderColor = "#86efac";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#f0fdf4";
                      e.target.style.borderColor = "#bbf7d0";
                    }}
                  >
                    {t("notifications.markAllRead")}
                  </button>
                )}
              </div>
            </div>

            {notifications.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center" }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 12px" }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontWeight: "500" }}>{t("notifications.noNotifications")}</p>
              </div>
            ) : (
              <div>
                {notifications.map((notif, idx) => {
                  const { title: translatedTitle, message: translatedMessage } = buildNotificationMessage(notif.type, notif.data, t);
                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      style={{
                        padding: "14px 16px",
                        borderBottom: idx === notifications.length - 1 ? "none" : "1px solid #f3f4f6",
                        background: notif.isRead ? "#fff" : "#f9fafb",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = notif.isRead ? "#f3f4f6" : "#f0fdf4";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notif.isRead ? "#fff" : "#f9fafb";
                      }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        {!notif.isRead && (
                          <div style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#10b981",
                            marginTop: "6px",
                            flexShrink: 0,
                          }} />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: "0 0 4px",
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#1f2937",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}>
                            {translatedTitle}
                          </p>
                          <p style={{
                            margin: "0 0 6px",
                            fontSize: "12px",
                            color: "#6b7280",
                            lineHeight: "1.5",
                            wordWrap: "break-word",
                            overflowWrap: "break-word",
                          }}>
                            {translatedMessage}
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: "10px",
                            color: "#9ca3af",
                          }}>
                            {new Date(notif.createdAt).toLocaleDateString()} {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div style={P.statsGrid}>
          {[
            { label: t("totalRequests"), value: stats.total,      color: "#3b82f6", bg: "#eff6ff" },
            { label: t("inProgress"),    value: stats.inProgress,  color: "#f59e0b", bg: "#fffbeb" },
            { label: t("completed"),      value: stats.completed,   color: "#10b981", bg: "#ecfdf5" },
            { label: t("reportReady"),  value: stats.reports,     color: "#8b5cf6", bg: "#f5f3ff" },
          ].map((s) => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { key: "all", label: t("allBookings") },
            { key: "pending", label: t("pending") },
            { key: "assigned", label: t("inProgressFilter") },
            { key: "completed", label: t("completed") },
          ].map((f) => (
            <button key={f.key} onClick={() => setActiveFilter(f.key)}
              style={{ padding: "7px 16px", borderRadius: 8, border: "1.5px solid", borderColor: activeFilter === f.key ? "#10b981" : "#e5e7eb", background: activeFilter === f.key ? "#f0fdf4" : "#fff", color: activeFilter === f.key ? "#065f46" : "#6b7280", fontWeight: activeFilter === f.key ? 700 : 500, fontSize: 12.5, cursor: "pointer", fontFamily: "inherit" }}>
              {f.label}
            </button>
          ))}
          {filtered.length > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 12, color: "#9ca3af", fontWeight: 500, alignSelf: "center" }}>
              {filtered.length} {filtered.length !== 1 ? t("bookings") : t("booking")}
            </span>
          )}
        </div>

        {/* ── EMPTY STATE ── */}
        {filtered.length === 0 && (
          <div style={{ background: "#fff", border: "1.5px dashed #d1fae5", borderRadius: 18, padding: "60px 40px", textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: "#ecfdf5", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
              </svg>
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 700, color: "#1f2937" }}>{t("noSoilTests")}</h3>
            <p style={{ margin: "0 0 22px", fontSize: 13.5, color: "#6b7280", lineHeight: 1.7 }}>
              {activeFilter === "all" ? t("bookYourFirstSoilTest") : t("noBookingsAtThisTime", { status: activeFilter })}
            </p>
            {activeFilter === "all" && (
              <button style={P.newBtn} onClick={() => navigate("/book-service")}>{t("bookFirstTest")}</button>
            )}
          </div>
        )}

        {/* ── BOOKING CARDS ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {filtered.map((booking, idx) => {
            const config = STATUS_CONFIG(t);
            const cfg      = config[booking.status] || config.pending;
            const expanded = expandedId === booking._id;
            const hasSoil  = booking.soilResults && Object.values(booking.soilResults).some(Boolean);

            return (
              <div key={booking._id} style={{ background: "#fff", borderRadius: 18, border: `1.5px solid ${expanded ? cfg.border : "#f1f5f9"}`, boxShadow: expanded ? `0 8px 32px rgba(0,0,0,0.08)` : "0 1px 6px rgba(0,0,0,0.04)", transition: "all 0.25s", animation: `fadeUp 0.4s ease-out ${idx * 0.06}s both`, overflow: "hidden" }}>

                {/* status accent bar */}
                <div style={{ height: 3, background: `linear-gradient(90deg, ${cfg.dot}, ${cfg.border})` }} />

                <div style={{ padding: "22px 24px 0" }}>
                  {/* ── Card Header ── */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 14, marginBottom: 14 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap", marginBottom: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#111827", letterSpacing: "-0.02em" }}>{booking.fieldName}</h3>
                        {booking.cropType && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: "#065f46", background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "2px 9px", borderRadius: 20 }}>
                            {booking.cropType}
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                        <InfoRow icon={
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        }>
                          {booking.location?.municipality}, Ward {booking.location?.ward}
                        </InfoRow>
                        <InfoRow icon={
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        }>
                          {booking.nepaliDate || fmt(booking.collectionDate)}
                        </InfoRow>
                        <InfoRow>
                          {booking.timeSlot}
                        </InfoRow>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                      <StatusBadge status={booking.status} t={t} />
                      <button onClick={() => setExpandedId(expanded ? null : booking._id)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11.5, color: "#9ca3af", fontWeight: 600, padding: "2px 0", display: "flex", alignItems: "center", gap: 3, fontFamily: "inherit" }}>
                        {expanded ? t("less") : t("details")}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                    </div>
                  </div>

                  {/* ── Status description ── */}
                  <div style={{ display: "flex", gap: 9, padding: "11px 14px", background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 10, marginBottom: 16 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={cfg.dot} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p style={{ margin: 0, fontSize: 12.5, color: cfg.color, fontWeight: 600, lineHeight: 1.55 }}>{cfg.desc}</p>
                  </div>

                  {/* ── Workflow tracker ── */}
                  {booking.status !== "cancelled" && <WorkflowTracker status={booking.status} t={t} />}
                  {booking.status === "cancelled" && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, marginBottom: 4 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      <span style={{ fontSize: 12.5, color: "#991b1b", fontWeight: 600 }}>{t("bookingCancelled")}</span>
                    </div>
                  )}
                </div>

                {/* ── EXPANDED SECTION ── */}
                {expanded && (
                  <div style={{ padding: "20px 24px 0", borderTop: "1px solid #f3f4f6", marginTop: 16 }}>

                    {/* Expert info */}
                    {booking.expert ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 13, padding: "14px 16px", background: "#f8fdf9", border: "1px solid #d1fae5", borderRadius: 12, marginBottom: 18 }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#065f46,#10b981)", color: "#fff", fontSize: 16, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {booking.expert.name?.charAt(0)?.toUpperCase() || "E"}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 2 }}>{t("assignedExpert")}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#1f2937" }}>{booking.expert.name}</div>
                          {booking.expert.labName && <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 1 }}>{booking.expert.labName}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                          <ChatButton bookingId={booking._id} booking={booking} role="farmer" />
                          {booking.expert.contactNumber && (
                            <a href={`tel:${booking.expert.contactNumber}`}
                              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "8px 14px", background: "#065f46", color: "#fff", borderRadius: 10, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.13 1 .37 1.97.72 2.91a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.08 6.08l.96-.96a2 2 0 0 1 2.11-.45c.94.35 1.91.59 2.91.72a2 2 0 0 1 1.72 2.03z"/></svg>
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: "13px 16px", background: "#fafafa", border: "1px solid #f3f4f6", borderRadius: 11, marginBottom: 18 }}>
                        <p style={{ margin: 0, fontSize: 12.5, color: "#9ca3af", fontWeight: 500 }}>{t("noExpertAssigned")}</p>
                      </div>
                    )}

                    {/* Booking details grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                      {[
                        { label: t("fieldName"),    value: booking.fieldName },
                        { label: t("fieldSize"),    value: booking.fieldSize },
                        { label: t("cropType"),     value: booking.cropType },
                        { label: t("phone"),         value: booking.phoneNumber },
                        { label: t("district"),      value: booking.location?.district },
                        { label: t("province"),      value: booking.location?.province },
                        { label: t("timeSlot"),     value: booking.timeSlot },
                        { label: t("payment"),       value: `NPR ${booking.amount || 500} — ${t("cashOnDelivery")}` },
                      ].filter((r) => r.value).map(({ label, value }) => (
                        <div key={label} style={{ padding: "10px 13px", background: "#f9fafb", borderRadius: 9, border: "1px solid #f3f4f6" }}>
                          <div style={{ fontSize: 9.5, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>{label}</div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {booking.notes && (
                      <div style={{ padding: "12px 14px", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 10, marginBottom: 18 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{t("notes")}</div>
                        <p style={{ margin: 0, fontSize: 13, color: "#78350f", lineHeight: 1.6 }}>{booking.notes}</p>
                      </div>
                    )}

                    {/* Soil test results */}
                    {booking.status === "completed" && hasSoil && (
                      <div style={{ padding: "16px 18px", background: "#ecfdf5", border: "1px solid #6ee7b7", borderRadius: 13, marginBottom: 18 }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: "#065f46", marginBottom: 13, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t("soilAnalysisResults")}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 9, marginBottom: 12 }}>
                          {[
                            { key: "ph",            label: t("phLevel"),          unit: ""      },
                            { key: "nitrogen",      label: t("nitrogen"),           unit: "mg/kg" },
                            { key: "phosphorus",    label: t("phosphorus"),         unit: "mg/kg" },
                            { key: "potassium",     label: t("potassium"),          unit: "mg/kg" },
                            { key: "organicMatter", label: t("organicMatter"),     unit: "%"     },
                          ].map(({ key, label, unit }) => booking.soilResults[key] != null ? (
                            <div key={key} style={{ background: "#fff", borderRadius: 9, padding: "10px 12px", border: "1px solid #a7f3d0" }}>
                              <div style={{ fontSize: 9.5, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{label}</div>
                              <div style={{ fontSize: 18, fontWeight: 800, color: "#065f46", lineHeight: 1 }}>
                                {booking.soilResults[key]}{unit && <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginLeft: 2 }}>{unit}</span>}
                              </div>
                            </div>
                          ) : null)}
                        </div>
                        {booking.fertilizerRecommendation && (
                          <div style={{ padding: "11px 14px", background: "#fff", borderRadius: 9, border: "1px solid #a7f3d0" }}>
                            <div style={{ fontSize: 10, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>{t("fertilizerRecommendation")}</div>
                            <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.65 }}>{booking.fertilizerRecommendation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ── CARD FOOTER ── */}
                <div style={{ padding: "14px 24px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: expanded ? 18 : 0, borderTop: "1px solid #f3f4f6" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    <span style={{ fontSize: 11.5, color: "#9ca3af", fontWeight: 500 }}>{t("cashOnCollection")}</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#065f46", background: "#dcfce7", padding: "2px 9px", borderRadius: 20 }}>NPR {booking.amount || 500}</span>
                  </div>

                  {/* ── DOWNLOAD REPORT BUTTON ── */}
                  {booking.status === "completed" && booking.reportFile ? (
                    <button
                      onClick={() => downloadReport(booking)}
                      disabled={downloading === booking._id}
                      style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", background: downloading === booking._id ? "#9ca3af" : "linear-gradient(135deg,#065f46,#059669)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: downloading === booking._id ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(6,95,70,0.3)", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { if (downloading !== booking._id) e.currentTarget.style.transform = "translateY(-1px)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; }}
                    >
                      {downloading === booking._id ? (
                        <>
                          <div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                          {t("downloading")}
                        </>
                      ) : (
                        <>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                          {t("downloadSoilReport")}
                        </>
                      )}
                    </button>
                  ) : booking.status === "completed" ? (
                    <span style={{ fontSize: 11.5, color: "#9ca3af", fontStyle: "italic" }}>{t("reportNotUploaded")}</span>
                  ) : null}
                </div>

              </div>
            );
          })}
        </div>

      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes pulse   { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.6);opacity:.4} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════ */
const P = {
  page:     { minHeight: "100vh", background: "linear-gradient(158deg,#f0fdf4 0%,#ffffff 50%,#f8fafc 100%)", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", padding: "40px 24px 80px", maxWidth: 1020, margin: "0 auto" },
  header:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, marginBottom: 32, flexWrap: "wrap" },
  backBtn:  { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, fontWeight: 700, color: "#059669", background: "transparent", border: "1.5px solid #d1fae5", borderRadius: 7, padding: "5px 12px", cursor: "pointer", marginBottom: 12, fontFamily: "inherit", letterSpacing: "0.02em" },
  newBtn:   { display: "inline-flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#065f46,#059669)", color: "#fff", padding: "11px 20px", borderRadius: 10, border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(6,95,70,0.28)", whiteSpace: "nowrap" },
  statsGrid:{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 28 },
};

export default FarmerDashboard;