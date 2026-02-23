import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";
import api from "../utils/axios";
import { buildNotificationMessage } from "../utils/notificationHelper";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [role, setRole] = useState("");

  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      const res = await api.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Notification fetch error:", err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");
      // ✅ FIX: "userRole" matches what Login.jsx stores
      const currentRole = localStorage.getItem("userRole");

      if (token) {
        setIsLoggedIn(true);
        setUserName(name || "User");
        setRole(currentRole || "");
        if (["admin", "expert", "farmer"].includes(currentRole)) {
          fetchNotifications();
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setRole("");
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    checkLoginStatus();

    window.addEventListener("userLoggedIn", checkLoginStatus);
    window.addEventListener("userLoggedOut", checkLoginStatus);
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("userLoggedIn", checkLoginStatus);
      window.removeEventListener("userLoggedOut", checkLoginStatus);
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  // ✅ Poll every 30s for admin, expert, and farmer
  useEffect(() => {
    if (!isLoggedIn || !["admin", "expert", "farmer"].includes(role)) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, role]);

  const handleMarkRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      handleMarkRead(notification._id);
    }
    
    // Navigate based on notification type
    const navigationMap = {
      booking_assigned: `/expert-dashboard`,
      booking_accepted: `/farmer-dashboard`,
      booking_rejected: `/farmer-dashboard`,
      booking_reassigned: `/expert-dashboard`,
      sample_collected: `/farmer-dashboard`,
      report_uploaded: `/farmer-dashboard`,
      booking_completed: `/farmer-dashboard`,
    };
    
    const path = navigationMap[notification.type] || `/farmer-dashboard`;
    setShowNotifications(false);
    navigate(path);
  };

  const handleMarkAllRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);
      await Promise.all(unread.map((n) => api.put(`/notifications/${n._id}/read`)));
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getUserInitials = () => {
    if (!userName) return "U";
    const names = userName.split(" ");
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return userName.substring(0, 2).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    // ✅ FIX: "userRole" not "role"
    localStorage.removeItem("userRole");
    setIsLoggedIn(false);
    setUserName("");
    setRole("");
    setShowDropdown(false);
    setNotifications([]);
    setUnreadCount(0);
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/");
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <>
      <style>{`
        /* ── Notification Bell ── */
        .notif-container {
          position: relative;
        }

        .notif-bell-btn {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #374151;
          transition: background 0.18s, transform 0.18s;
        }
        .notif-bell-btn:hover {
          background: #f0fdf4;
          transform: scale(1.07);
        }
        .notif-bell-btn svg {
          width: 22px;
          height: 22px;
        }

        @keyframes bell-ring {
          0%,100% { transform: rotate(0deg); }
          10%      { transform: rotate(14deg); }
          20%      { transform: rotate(-12deg); }
          30%      { transform: rotate(10deg); }
          40%      { transform: rotate(-8deg); }
          50%      { transform: rotate(5deg); }
          60%      { transform: rotate(0deg); }
        }
        .notif-bell-btn.has-unread svg {
          animation: bell-ring 2s ease infinite;
        }

        .notif-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          min-width: 17px;
          height: 17px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          border: 2px solid #fff;
          line-height: 1;
        }

        /* ── Dropdown Panel ── */
        .notif-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          width: 340px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.13);
          z-index: 9999;
          overflow: hidden;
          animation: notif-drop-in 0.18s ease;
        }
        @keyframes notif-drop-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px;
          border-bottom: 1px solid #f3f4f6;
        }
        .notif-header-title {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .notif-count-pill {
          background: #dcfce7;
          color: #15803d;
          font-size: 11px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 999px;
        }
        .notif-mark-all-btn {
          background: none;
          border: none;
          font-size: 12px;
          font-weight: 600;
          color: #16a34a;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .notif-mark-all-btn:hover { background: #f0fdf4; }
        .notif-mark-all-btn:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── List ── */
        .notif-list {
          max-height: 340px;
          overflow-y: auto;
        }
        .notif-list::-webkit-scrollbar { width: 4px; }
        .notif-list::-webkit-scrollbar-track { background: transparent; }
        .notif-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

        .notif-item {
          display: flex;
          gap: 11px;
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f9fafb;
          transition: background 0.14s;
          position: relative;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: #f9fafb; }
        .notif-item.unread { background: #f0fdf4; }
        .notif-item.unread:hover { background: #dcfce7; }

        .notif-icon-wrap {
          flex-shrink: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #dcfce7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .notif-item.unread .notif-icon-wrap {
          background: #bbf7d0;
        }

        .notif-body { flex: 1; min-width: 0; }
        .notif-title {
          font-size: 13px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .notif-msg {
          font-size: 12px;
          color: #6b7280;
          line-height: 1.5;
          margin-bottom: 4px;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .notif-time {
          font-size: 11px;
          color: #9ca3af;
          font-weight: 500;
        }

        .notif-unread-dot {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #16a34a;
          flex-shrink: 0;
        }

        /* ── Empty / Loading ── */
        .notif-empty {
          padding: 36px 16px;
          text-align: center;
        }
        .notif-empty-icon {
          font-size: 32px;
          margin-bottom: 10px;
        }
        .notif-empty-text {
          font-size: 13px;
          color: #9ca3af;
          font-weight: 500;
        }

        .notif-loading {
          padding: 24px 16px;
          text-align: center;
          font-size: 13px;
          color: #9ca3af;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        @keyframes notif-spin { to { transform: rotate(360deg); } }
        .notif-spinner {
          width: 14px; height: 14px;
          border: 2px solid #e5e7eb;
          border-top-color: #16a34a;
          border-radius: 50%;
          animation: notif-spin 0.6s linear infinite;
        }

        .notif-footer {
          padding: 10px 16px;
          border-top: 1px solid #f3f4f6;
          text-align: center;
        }
        .notif-footer-btn {
          font-size: 12.5px;
          font-weight: 600;
          color: #16a34a;
          background: none;
          border: none;
          cursor: pointer;
          text-decoration: none;
        }
        .notif-footer-btn:hover { text-decoration: underline; }
      `}</style>

      <nav className="navbar">
        <Link to="/" className="logo">
          AgroSewa
        </Link>

        <div className="nav-right">
          <Link to="/expert-registration" className="nav-link">
            {t("becomeExpert")}
          </Link>

          <select
            value={i18n.language}
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="language-select"
          >
            <option value="en">English</option>
            <option value="ne">नेपाली</option>
          </select>

          {!isLoggedIn ? (
            <Link to="/register" className="nav-btn">
              {t("signUp")}
            </Link>
          ) : (
            <>
              {/* ✅ NOTIFICATION BELL FOR ADMIN, EXPERT & FARMER */}
              {["admin", "expert", "farmer"].includes(role) && (
                <div className="notif-container" ref={notificationRef}>
                  <button
                    className={`notif-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) fetchNotifications();
                    }}
                    title={t("notifications.title")}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="notif-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="notif-dropdown">
                      {/* Header */}
                      <div className="notif-header">
                        <span className="notif-header-title">
                          {t("notifications.title")}
                          {unreadCount > 0 && (
                            <span className="notif-count-pill">{unreadCount} new</span>
                          )}
                        </span>
                        {unreadCount > 0 && (
                          <button
                            className="notif-mark-all-btn"
                            onClick={handleMarkAllRead}
                          >
                            {t("notifications.markAllRead")}
                          </button>
                        )}
                      </div>

                      {/* Body */}
                      <div className="notif-list">
                        {loadingNotifs ? (
                          <div className="notif-loading">
                            <div className="notif-spinner" />
                            {t("notifications.title")}...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="notif-empty">
                            <div className="notif-empty-icon">🔔</div>
                            <p className="notif-empty-text">{t("notifications.noNotifications")}</p>
                          </div>
                        ) : (
                          notifications.map((n) => {
                            const { title: translatedTitle, message: translatedMessage } = buildNotificationMessage(n.type, n.data, t);
                            return (
                              <div
                                key={n._id}
                                className={`notif-item ${!n.isRead ? "unread" : ""}`}
                                onClick={() => handleNotificationClick(n)}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="notif-icon-wrap">
                                  {translatedTitle?.toLowerCase().includes("expert") ? "🧑‍🔬" : "📋"}
                                </div>
                                <div className="notif-body">
                                  <div className="notif-title">{translatedTitle}</div>
                                  <div className="notif-msg">{translatedMessage}</div>
                                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                                </div>
                                {!n.isRead && <div className="notif-unread-dot" />}
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="notif-footer">
                          <Link
                            to={role === "admin" ? "/admin-dashboard" : role === "expert" ? "/expert-dashboard" : "/farmer-dashboard"}
                            className="notif-footer-btn"
                            onClick={() => setShowNotifications(false)}
                          >
                            {role === "admin" ? t("notifications.viewAdminDashboard") : role === "expert" ? t("notifications.viewDashboard") : t("notifications.viewMyBookings")}
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* USER PROFILE */}
              <div className="user-profile-container" ref={dropdownRef}>
                <button
                  className="user-profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <div className="user-avatar">{getUserInitials()}</div>
                  <span className="user-name">{userName}</span>
                  <svg
                    className={`dropdown-arrow ${showDropdown ? "open" : ""}`}
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {showDropdown && (
                  <div className="user-dropdown">
                    <Link
                      to="/farmer-dashboard"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      {t("viewBookings")}
                    </Link>

                    <Link
                      to="/profile"
                      className="dropdown-item"
                      onClick={() => setShowDropdown(false)}
                    >
                      {t("updateProfile")}
                    </Link>

                    <div className="dropdown-divider"></div>

                    <button
                      className="dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;