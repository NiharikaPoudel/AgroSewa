import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const DOCS = [
  { label: "Education Certificate",  key: "educationCertificate"  },
  { label: "Government Certificate", key: "governmentCertificate" },
  { label: "Experience Certificate", key: "experienceCertificate" },
  { label: "ID / Citizenship Proof", key: "idProof"               },
  { label: "Lab Certificate",        key: "labCertificate"        },
];

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [stats,         setStats]         = useState(null);
  const [applications,  setApplications]  = useState([]);
  const [activeTab,     setActiveTab]     = useState("pending");
  const [selected,      setSelected]      = useState(null);
  const [rejectReason,  setRejectReason]  = useState("");
  const [showReject,    setShowReject]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message,       setMessage]       = useState({ text: "", type: "" });
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // All files (profilePhoto, labCertificate, idProof, etc.) are stored as
  // bare filenames e.g. "1771729982116-880669453.png"
  // Multer saves them to: uploads/certificates/
  // Express serves:       app.use("/uploads", static("./uploads"))
  // So correct URL =      backendUrl + "/uploads/certificates/" + filename
  const fileUrl = (filename) => {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) return filename;
    // Already a path like "uploads/certificates/abc.png" — prefix backendUrl
    if (filename.includes("/")) return `${backendUrl}/${filename.replace(/^\/+/, "")}`;
    // Bare filename — append the certificates folder
    return `${backendUrl}/uploads/certificates/${filename}`;
  };

  useEffect(() => { loadData(); }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const [statsRes, appsRes, notifRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/applications?status=" + activeTab),
        api.get("/notifications"),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (appsRes.data.success)  setApplications(appsRes.data.applications);
      if (notifRes.data.success) setNotifications(notifRes.data.notifications);
    } catch (err) {
      console.error("Load error:", err);
      setMessage({ text: "Failed to load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get("/notifications");
        if (res.data.success) {
          setNotifications(res.data.notifications);
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    loadNotifications();
  }, []);

  const handleApprove = async (applicationId, name) => {
    if (!window.confirm("Approve " + name + "'s application?")) return;
    try {
      setActionLoading(true);
      const res = await api.patch("/admin/applications/" + applicationId + "/approve");
      if (res.data.success) {
        setMessage({ text: res.data.message, type: "success" });
        setSelected(null);
        loadData();
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch {
      setMessage({ text: "Action failed. Please try again.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId) => {
    try {
      setActionLoading(true);
      const res = await api.patch("/admin/applications/" + applicationId + "/reject", {
        reason: rejectReason,
      });
      if (res.data.success) {
        setMessage({ text: res.data.message, type: "success" });
        setSelected(null);
        setShowReject(false);
        setRejectReason("");
        loadData();
      } else {
        setMessage({ text: res.data.message, type: "error" });
      }
    } catch {
      setMessage({ text: "Action failed. Please try again.", type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setSelected(null);
    setShowReject(false);
    setRejectReason("");
  };

  const statusColor = (status) => {
    if (status === "approved") return { background: "#dcfce7", color: "#16a34a" };
    if (status === "rejected") return { background: "#fee2e2", color: "#dc2626" };
    return { background: "#fef9c3", color: "#ca8a04" };
  };

  return (
    <>
      <div style={S.page}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div style={S.headerInner}>
            <div style={S.headerIcon}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2d8a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <h1 style={S.title}>Admin Dashboard</h1>
              <p style={S.sub}>Manage expert applications and platform users</p>
            </div>
          </div>
        </div>

        {/* ── Flash message ── */}
        {message.text && (
          <div style={{
            ...S.flash,
            background:  message.type === "success" ? "#f0fdf4" : "#fef2f2",
            borderColor: message.type === "success" ? "#bbf7d0" : "#fecaca",
            color:       message.type === "success" ? "#16a34a" : "#dc2626",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              {message.type === "success"
                ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>
              }
            </svg>
            <span style={{ flex: 1, fontSize: "13px", fontWeight: "500" }}>{message.text}</span>
            <button onClick={() => setMessage({ text: "", type: "" })} style={S.flashClose}>×</button>
          </div>
        )}

        {/* ── Stats Grid ── */}
        {stats && (
          <div style={S.statsGrid}>
            <StatCard label="Total Users"         value={stats.totalUsers}          color="#3b82f6" icon={<UserIcon />} />
            <StatCard label="Total Farmers"        value={stats.totalFarmers}        color="#2d8a4f" icon={<FarmerIcon />} />
            <StatCard label="Total Experts"        value={stats.totalExperts}        color="#8b5cf6" icon={<ExpertIcon />} />
            <StatCard label="Pending"              value={stats.pendingApplications} color="#f59e0b" icon={<ClockIcon />} />
            <StatCard label="Approved Experts"     value={stats.approvedExperts}     color="#10b981" icon={<CheckIcon />} />
            <StatCard label="Rejected"             value={stats.rejectedExperts}     color="#ef4444" icon={<XIcon />} />
          </div>
        )}

        {/* ── Applications Table ── */}
        <div style={S.section}>
          <div style={S.sectionHead}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={S.sectionIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2d8a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h2 style={S.sectionTitle}>Expert Applications</h2>
            </div>

            <div style={S.tabs}>
              {["pending", "approved", "rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setSelected(null); }}
                  style={{ ...S.tab, ...(activeTab === tab ? S.tabActive : {}) }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === "pending" && stats && stats.pendingApplications > 0 && (
                    <span style={S.badge}>{stats.pendingApplications}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={S.center}>
              <div style={S.spinner} />
              <p style={{ color: "#9ca3af", marginTop: "14px", fontSize: "13px" }}>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div style={S.empty}>
              <div style={S.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <p style={{ color: "#9ca3af", margin: "8px 0 0", fontSize: "13px" }}>
                No {activeTab} applications found.
              </p>
            </div>
          ) : (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr style={S.thead}>
                    <th style={S.th}>Applicant</th>
                    <th style={S.th}>Contact Number</th>
                    <th style={S.th}>Lab Address</th>
                    <th style={S.th}>Applied On</th>
                    <th style={S.th}>Status</th>
                    {activeTab === "pending" && <th style={S.th}>Actions</th>}
                    <th style={S.th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app, i) => (
                    <tr
                      key={app._id}
                      style={{ ...S.tr, background: i % 2 === 0 ? "#fff" : "#fafafa" }}
                    >
                      <td style={S.td}>
                        <div style={S.applicantCell}>
                          <Avatar name={app.name} src={fileUrl(app.profilePhoto)} size={34} />
                          <div>
                            <p style={S.appName}>{app.name}</p>
                            <p style={S.appEmail}>{app.email}</p>
                          </div>
                        </div>
                      </td>

                      <td style={S.td}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                          {app.contactNumber || "—"}
                        </p>
                      </td>

                      <td style={S.td}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151", maxWidth: "180px" }}>
                          {app.labAddress || "—"}
                        </p>
                      </td>

                      <td style={S.td}>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                          {new Date(app.createdAt).toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                          })}
                        </p>
                      </td>

                      <td style={S.td}>
                        <span style={{ ...S.statusBadge, ...statusColor(app.status) }}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                      </td>

                      {activeTab === "pending" && (
                        <td style={S.td}>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button
                              onClick={() => handleApprove(app._id, app.name)}
                              disabled={actionLoading}
                              style={S.approveBtn}
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => { setSelected(app); setShowReject(true); }}
                              disabled={actionLoading}
                              style={S.rejectBtn}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      )}

                      <td style={S.td}>
                        <button
                          onClick={() => { setSelected(app); setShowReject(false); }}
                          style={S.detailBtn}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Modal ── */}
        {selected && (
          <div style={S.overlay} onClick={closeModal}>
            <div style={S.modal} onClick={(e) => e.stopPropagation()}>

              <div style={S.modalHead}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={S.modalIcon}>
                    {showReject
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2d8a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    }
                  </div>
                  <h3 style={S.modalTitle}>
                    {showReject ? "Reject Application" : "Application Details"}
                  </h3>
                </div>
                <button onClick={closeModal} style={S.closeBtn}>×</button>
              </div>

              {/* Detail view */}
              {!showReject && (
                <div style={S.modalBody}>

                  {/* Profile photo header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px", padding: "14px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #f3f4f6" }}>
                    <Avatar name={selected.name} src={fileUrl(selected.profilePhoto)} size={52} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 2px", fontSize: "15px", fontWeight: "700", color: "#111827" }}>{selected.name}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected.email}</p>
                    </div>
                    <span style={{ ...S.statusBadge, ...statusColor(selected.status), flexShrink: 0 }}>
                      {selected.status.toUpperCase()}
                    </span>
                  </div>

                  <SectionBlock title="Applicant Info">
                    <InfoRow label="Name"     value={selected.name} />
                    <InfoRow label="Email"    value={selected.email} />
                    <InfoRow label="Contact"  value={selected.contactNumber || "—"} />
                    <InfoRow label="Status"   value={selected.status.toUpperCase()} />
                    <InfoRow label="Applied"  value={new Date(selected.createdAt).toLocaleString()} />
                    {selected.reviewedAt && (
                      <InfoRow label="Reviewed" value={new Date(selected.reviewedAt).toLocaleString()} />
                    )}
                    {selected.adminNote && (
                      <InfoRow label="Admin Note" value={selected.adminNote} />
                    )}
                  </SectionBlock>

                  {selected.labAddress && (
                    <SectionBlock title="Lab / Office Address">
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151", lineHeight: "1.6" }}>
                        {selected.labAddress}
                      </p>
                    </SectionBlock>
                  )}

                  <SectionBlock title="Uploaded Documents">
                    {DOCS.map((doc) => {
                      const fileValue = selected[doc.key];
                      return (
                        <div key={doc.key} style={S.docRow}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={fileValue ? "#2d8a4f" : "#d1d5db"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                              <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span style={{ fontSize: "13px", color: "#374151" }}>{doc.label}</span>
                          </div>
                          {fileValue ? (
                            <a
                              href={backendUrl + "/uploads/certificates/" + fileValue}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={S.docLink}
                            >
                              View File
                            </a>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Not uploaded</span>
                          )}
                        </div>
                      );
                    })}
                  </SectionBlock>

                  {selected.status === "pending" && (
                    <div style={S.modalActions}>
                      <button
                        onClick={() => handleApprove(selected._id, selected.name)}
                        disabled={actionLoading}
                        style={{ ...S.approveBtn, padding: "10px 24px", fontSize: "13px" }}
                      >
                        {actionLoading ? "Processing..." : "Approve"}
                      </button>
                      <button
                        onClick={() => setShowReject(true)}
                        disabled={actionLoading}
                        style={{ ...S.rejectBtn, padding: "10px 24px", fontSize: "13px" }}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reject view */}
              {showReject && (
                <div style={S.modalBody}>
                  <div style={S.rejectWarning}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <p style={{ margin: 0, fontSize: "13px", color: "#92400e", lineHeight: "1.6" }}>
                      You are rejecting <strong>{selected.name}</strong>'s expert application. An email will be sent to notify them.
                    </p>
                  </div>

                  <label style={S.label}>
                    Reason for Rejection
                    <span style={{ color: "#9ca3af", fontWeight: "400", marginLeft: "6px", fontSize: "12px" }}>(optional)</span>
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Documents are unclear, incomplete information..."
                    rows={4}
                    style={S.textarea}
                  />

                  <div style={S.modalActions}>
                    <button
                      onClick={() => { setShowReject(false); setRejectReason(""); }}
                      style={S.cancelBtn}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReject(selected._id)}
                      disabled={actionLoading}
                      style={{ ...S.rejectBtn, padding: "10px 24px", fontSize: "13px" }}
                    >
                      {actionLoading ? "Processing..." : "Confirm Rejection"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </>
  );
};

/* ─────────────────────────────────────────────────────
   Avatar — shows profile photo, falls back to initial
   profilePhoto is a bare filename like "17717299.png"
   served at /uploads/certificates/17717299.png
───────────────────────────────────────────────────── */
const Avatar = ({ name, src, size = 34 }) => {
  const [err, setErr] = useState(false);
  const radius   = size >= 48 ? "10px" : "8px";
  const fontSize = size >= 48 ? "18px" : "13px";
  const base = {
    width: `${size}px`, height: `${size}px`, borderRadius: radius,
    flexShrink: 0, border: "1.5px solid #bbf7d0",
  };

  if (src && !err) {
    return (
      <img
        src={src}
        alt={name}
        style={{ ...base, objectFit: "cover" }}
        onError={() => setErr(true)}
      />
    );
  }
  return (
    <div style={{
      ...base,
      background: "#f0fdf4",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize, fontWeight: "700", color: "#2d8a4f",
    }}>
      {name ? name.charAt(0).toUpperCase() : "?"}
    </div>
  );
};

/* ── Stat Card ── */
const StatCard = ({ label, value, color, icon }) => (
  <div style={{
    background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px",
    padding: "20px 18px", display: "flex", alignItems: "center", gap: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "box-shadow 0.2s",
  }}>
    <div style={{
      width: "44px", height: "44px", borderRadius: "10px", background: color + "15",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, borderLeft: "3px solid " + color, color,
    }}>
      {icon}
    </div>
    <div>
      <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
        {value ?? "—"}
      </p>
      <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.4px" }}>
        {label}
      </p>
    </div>
  </div>
);

/* ── Section Block ── */
const SectionBlock = ({ title, children }) => (
  <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f3f4f6" }}>
    <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.8px" }}>
      {title}
    </p>
    {children}
  </div>
);

/* ── Info Row ── */
const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
    <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", minWidth: "90px", paddingTop: "1px" }}>
      {label}
    </span>
    <span style={{ fontSize: "13px", color: "#1f2937", flex: 1, lineHeight: "1.5" }}>
      {value}
    </span>
  </div>
);

/* ── Icons ── */
const UserIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const FarmerIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const ExpertIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>;
const ClockIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const CheckIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const XIcon      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;

/* ── Styles ── */
const S = {
  page:        { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", animation: "fadeInUp 0.4s ease-out" },
  header:      { marginBottom: "28px", padding: "24px 28px", background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  headerInner: { display: "flex", alignItems: "center", gap: "14px" },
  headerIcon:  { width: "42px", height: "42px", borderRadius: "10px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  title:       { margin: "0 0 3px", fontSize: "22px", fontWeight: "700", color: "#111827" },
  sub:         { margin: 0, fontSize: "13px", color: "#6b7280" },
  flash:       { display: "flex", alignItems: "flex-start", gap: "10px", padding: "13px 16px", marginBottom: "24px", border: "1.5px solid", borderRadius: "10px" },
  flashClose:  { background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "inherit", padding: "0 4px", lineHeight: 1, flexShrink: 0 },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "14px", marginBottom: "24px" },
  section:     { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", gap: "12px", background: "#fafafa" },
  sectionIcon: { width: "32px", height: "32px", borderRadius: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  sectionTitle:{ margin: 0, fontSize: "15px", fontWeight: "700", color: "#111827" },
  tabs:        { display: "flex", gap: "6px" },
  tab:         { padding: "7px 16px", borderRadius: "7px", border: "1.5px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px", transition: "all 0.15s ease" },
  tabActive:   { background: "#f0fdf4", borderColor: "#2d8a4f", color: "#2d8a4f", fontWeight: "600" },
  badge:       { background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: "10px", fontWeight: "700", padding: "2px 7px" },
  center:      { padding: "64px", textAlign: "center" },
  spinner:     { width: "28px", height: "28px", border: "2.5px solid #e5e7eb", borderTopColor: "#2d8a4f", borderRadius: "50%", animation: "spin 0.75s linear infinite", margin: "0 auto" },
  empty:       { padding: "64px", textAlign: "center" },
  emptyIcon:   { width: "64px", height: "64px", borderRadius: "16px", background: "#f9fafb", border: "1.5px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },
  tableWrap:   { overflowX: "auto" },
  table:       { width: "100%", borderCollapse: "collapse" },
  thead:       { background: "#f9fafb" },
  th:          { padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px", borderBottom: "1px solid #f3f4f6" },
  tr:          { borderBottom: "1px solid #f3f4f6", transition: "background 0.1s" },
  td:          { padding: "14px 16px", verticalAlign: "middle" },
  applicantCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar:      { width: "34px", height: "34px", borderRadius: "8px", background: "#f0fdf4", border: "1.5px solid #bbf7d0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#2d8a4f", flexShrink: 0 },
  appName:     { margin: "0 0 2px", fontSize: "13px", fontWeight: "600", color: "#1f2937" },
  appEmail:    { margin: 0, fontSize: "11px", color: "#9ca3af" },
  statusBadge: { padding: "4px 10px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.4px" },
  approveBtn:  { padding: "7px 13px", background: "#2d8a4f", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "opacity 0.15s" },
  rejectBtn:   { padding: "7px 13px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "opacity 0.15s" },
  detailBtn:   { padding: "6px 14px", background: "#f9fafb", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "7px", cursor: "pointer", fontSize: "12px", fontWeight: "500", transition: "all 0.15s" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px", backdropFilter: "blur(2px)" },
  modal:       { background: "#fff", borderRadius: "14px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)" },
  modalHead:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" },
  modalIcon:   { width: "30px", height: "30px", borderRadius: "7px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  modalTitle:  { margin: 0, fontSize: "15px", fontWeight: "700", color: "#111827" },
  closeBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#9ca3af", padding: "4px", lineHeight: 1 },
  modalBody:   { padding: "22px", overflowY: "auto", flex: 1 },
  modalActions:{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" },
  cancelBtn:   { padding: "10px 22px", background: "#f9fafb", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "7px", cursor: "pointer", fontSize: "13px", fontWeight: "500" },
  rejectWarning: { display: "flex", gap: "10px", alignItems: "flex-start", padding: "13px 15px", background: "#fffbeb", border: "1.5px solid #fde68a", borderRadius: "9px", marginBottom: "20px" },
  docRow:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f9fafb" },
  docLink:     { fontSize: "12px", color: "#2d8a4f", fontWeight: "600", textDecoration: "none" },
  label:       { display: "block", marginBottom: "8px", fontSize: "12px", fontWeight: "700", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" },
  textarea:    { width: "100%", padding: "12px 14px", fontSize: "13px", border: "1.5px solid #e5e7eb", borderRadius: "8px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", color: "#1f2937", backgroundColor: "#fafafa", lineHeight: "1.6" },
};

export default AdminDashboard;