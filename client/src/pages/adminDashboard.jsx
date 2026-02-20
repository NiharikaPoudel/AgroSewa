import { useState, useEffect } from "react";
import api from "../utils/axios";

const DOCS = [
  { label: "Education Certificate",  key: "educationCertificate"  },
  { label: "Government Certificate", key: "governmentCertificate" },
  { label: "Experience Certificate", key: "experienceCertificate" },
  { label: "ID / Citizenship Proof", key: "idProof"               },
];

const AdminDashboard = () => {
  const [stats,         setStats]         = useState(null);
  const [applications,  setApplications]  = useState([]);
  const [activeTab,     setActiveTab]     = useState("pending");
  const [selected,      setSelected]      = useState(null);
  const [rejectReason,  setRejectReason]  = useState("");
  const [showReject,    setShowReject]    = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message,       setMessage]       = useState({ text: "", type: "" });

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const [statsRes, appsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/applications?status=" + activeTab),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (appsRes.data.success)  setApplications(appsRes.data.applications);
    } catch (err) {
      console.error("Load error:", err);
      setMessage({ text: "Failed to load data.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

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
    } catch (err) {
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
    } catch (err) {
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
    <div style={S.page}>

      {/* Header */}
      <div style={S.header}>
        <h1 style={S.title}>Admin Dashboard</h1>
        <p style={S.sub}>Manage expert applications and platform users</p>
      </div>

      {/* Flash message */}
      {message.text && (
        <div style={{
          ...S.flash,
          background:  message.type === "success" ? "#f0fdf4" : "#fef2f2",
          borderColor: message.type === "success" ? "#bbf7d0" : "#fecaca",
          color:       message.type === "success" ? "#16a34a" : "#dc2626",
        }}>
          <span style={{ flex: 1 }}>{message.text}</span>
          <button
            onClick={() => setMessage({ text: "", type: "" })}
            style={S.flashClose}
          >
            ×
          </button>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div style={S.statsGrid}>
          <StatCard label="Total Users"          value={stats.totalUsers}          color="#3b82f6" />
          <StatCard label="Total Farmers"         value={stats.totalFarmers}        color="#2d8a4f" />
          <StatCard label="Total Experts"         value={stats.totalExperts}        color="#8b5cf6" />
          <StatCard label="Pending Applications"  value={stats.pendingApplications} color="#f59e0b" />
          <StatCard label="Approved Experts"      value={stats.approvedExperts}     color="#10b981" />
          <StatCard label="Rejected"              value={stats.rejectedExperts}     color="#ef4444" />
        </div>
      )}

      {/* Applications table */}
      <div style={S.section}>
        <div style={S.sectionHead}>
          <h2 style={S.sectionTitle}>Expert Applications</h2>
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
            <p style={{ color: "#6b7280", marginTop: "12px" }}>Loading...</p>
          </div>
        ) : applications.length === 0 ? (
          <div style={S.empty}>
            <p style={{ color: "#6b7280", margin: 0 }}>
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
                      <p style={S.appName}>{app.name}</p>
                      <p style={S.appEmail}>{app.email}</p>
                    </td>

                    {/* Contact Number column */}
                    <td style={S.td}>
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                        {app.contactNumber || "-"}
                      </p>
                    </td>

                    <td style={S.td}>
                      <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                        {app.labAddress || "-"}
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

      {/* Modal */}
      {selected && (
        <div style={S.overlay} onClick={closeModal}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>

            <div style={S.modalHead}>
              <h3 style={S.modalTitle}>
                {showReject ? "Reject Application" : "Application Details"}
              </h3>
              <button onClick={closeModal} style={S.closeBtn}>×</button>
            </div>

            {/* Detail view */}
            {!showReject && (
              <div style={S.modalBody}>
                <SectionBlock title="Applicant Info">
                  <InfoRow label="Name"           value={selected.name} />
                  <InfoRow label="Email"          value={selected.email} />
                  <InfoRow label="Contact"        value={selected.contactNumber || "-"} />
                  <InfoRow label="Status"         value={selected.status.toUpperCase()} />
                  <InfoRow
                    label="Applied"
                    value={new Date(selected.createdAt).toLocaleString()}
                  />
                  {selected.reviewedAt && (
                    <InfoRow
                      label="Reviewed"
                      value={new Date(selected.reviewedAt).toLocaleString()}
                    />
                  )}
                  {selected.adminNote && (
                    <InfoRow label="Admin Note" value={selected.adminNote} />
                  )}
                </SectionBlock>

                {selected.labAddress && (
                  <SectionBlock title="Lab / Office Address">
                    <p style={{ margin: 0, fontSize: "14px", color: "#374151" }}>
                      {selected.labAddress}
                    </p>
                  </SectionBlock>
                )}

                <SectionBlock title="Uploaded Documents">
                  {DOCS.map(function(doc) {
                    var fileValue = selected[doc.key];
                    return (
                      <div key={doc.key} style={S.docRow}>
                        <span style={{ fontSize: "13px", color: "#374151" }}>
                          {doc.label}
                        </span>
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
                          <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                            Not uploaded
                          </span>
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
                      style={{ ...S.approveBtn, padding: "10px 24px", fontSize: "14px" }}
                    >
                      {actionLoading ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => setShowReject(true)}
                      disabled={actionLoading}
                      style={{ ...S.rejectBtn, padding: "10px 24px", fontSize: "14px" }}
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
                <p style={{ color: "#374151", fontSize: "14px", marginBottom: "20px" }}>
                  You are rejecting <strong>{selected.name}</strong>'s expert
                  application. An email will be sent to notify them.
                </p>

                <label style={S.label}>
                  Reason for Rejection
                  <span style={{ color: "#9ca3af", fontWeight: "400", marginLeft: "6px" }}>
                    (optional)
                  </span>
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
                    style={{ ...S.rejectBtn, padding: "10px 24px", fontSize: "14px" }}
                  >
                    {actionLoading ? "Processing..." : "Confirm Rejection"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div style={{
    background: "#fff",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    padding: "18px 16px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
  }}>
    <div style={{
      width: "44px",
      height: "44px",
      borderRadius: "10px",
      background: color + "18",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      borderLeft: "4px solid " + color,
    }} />
    <div>
      <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: "700", color: "#1a1a1a" }}>
        {value}
      </p>
      <p style={{ margin: 0, fontSize: "11px", color: "#6b7280", fontWeight: "500" }}>
        {label}
      </p>
    </div>
  </div>
);

const SectionBlock = ({ title, children }) => (
  <div style={{ marginBottom: "20px", paddingBottom: "20px", borderBottom: "1px solid #f3f4f6" }}>
    <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
      {title}
    </p>
    {children}
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={{ display: "flex", gap: "12px", marginBottom: "8px", alignItems: "flex-start" }}>
    <span style={{ fontSize: "12px", color: "#9ca3af", fontWeight: "600", minWidth: "90px", paddingTop: "2px" }}>
      {label}
    </span>
    <span style={{ fontSize: "13px", color: "#1f2937", flex: 1 }}>
      {value}
    </span>
  </div>
);

const S = {
  page:        { padding: "32px", maxWidth: "1200px", margin: "0 auto", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" },
  header:      { marginBottom: "28px" },
  title:       { margin: "0 0 4px", fontSize: "26px", fontWeight: "700", color: "#1a1a1a" },
  sub:         { margin: 0, fontSize: "14px", color: "#6b7280" },
  flash:       { display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "24px", border: "1.5px solid", borderRadius: "8px", fontSize: "13px", fontWeight: "500" },
  flashClose:  { background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "inherit", padding: "0 4px" },
  statsGrid:   { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "16px", marginBottom: "32px" },
  section:     { background: "#fff", border: "1.5px solid #e5e7eb", borderRadius: "12px", overflow: "hidden" },
  sectionHead: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f3f4f6", flexWrap: "wrap", gap: "12px" },
  sectionTitle:{ margin: 0, fontSize: "16px", fontWeight: "700", color: "#1a1a1a" },
  tabs:        { display: "flex", gap: "6px" },
  tab:         { padding: "7px 16px", borderRadius: "6px", border: "1.5px solid #e5e7eb", background: "#fafafa", cursor: "pointer", fontSize: "13px", fontWeight: "500", color: "#6b7280", display: "flex", alignItems: "center", gap: "4px" },
  tabActive:   { background: "#f0fdf4", borderColor: "#2d8a4f", color: "#2d8a4f" },
  badge:       { background: "#ef4444", color: "#fff", borderRadius: "999px", fontSize: "10px", fontWeight: "700", padding: "1px 6px", marginLeft: "4px" },
  center:      { padding: "60px", textAlign: "center" },
  spinner:     { width: "32px", height: "32px", border: "3px solid #e5e7eb", borderTopColor: "#2d8a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" },
  empty:       { padding: "60px", textAlign: "center" },
  tableWrap:   { overflowX: "auto" },
  table:       { width: "100%", borderCollapse: "collapse" },
  thead:       { background: "#f9fafb" },
  th:          { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px", borderBottom: "1px solid #f3f4f6" },
  tr:          { borderBottom: "1px solid #f3f4f6" },
  td:          { padding: "14px 16px", verticalAlign: "middle" },
  appName:     { margin: "0 0 2px", fontSize: "14px", fontWeight: "600", color: "#1f2937" },
  appEmail:    { margin: 0, fontSize: "12px", color: "#9ca3af" },
  statusBadge: { padding: "4px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: "600" },
  approveBtn:  { padding: "7px 14px", background: "#2d8a4f", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  rejectBtn:   { padding: "7px 14px", background: "#ef4444", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  detailBtn:   { padding: "6px 14px", background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: "500" },
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" },
  modal:       { background: "#fff", borderRadius: "12px", width: "100%", maxWidth: "580px", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHead:   { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f3f4f6" },
  modalTitle:  { margin: 0, fontSize: "17px", fontWeight: "700", color: "#1a1a1a" },
  closeBtn:    { background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "#9ca3af", padding: "4px" },
  modalBody:   { padding: "24px", overflowY: "auto", flex: 1 },
  modalActions:{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #f3f4f6" },
  cancelBtn:   { padding: "10px 24px", background: "#f3f4f6", color: "#374151", border: "1.5px solid #e5e7eb", borderRadius: "6px", cursor: "pointer", fontSize: "14px", fontWeight: "500" },
  docRow:      { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #f9fafb" },
  docLink:     { fontSize: "12px", color: "#2d8a4f", fontWeight: "600", textDecoration: "none" },
  label:       { display: "block", marginBottom: "8px", fontSize: "13px", fontWeight: "600", color: "#374151" },
  textarea:    { width: "100%", padding: "12px", fontSize: "14px", border: "1.5px solid #e5e7eb", borderRadius: "8px", outline: "none", fontFamily: "inherit", resize: "vertical", boxSizing: "border-box", color: "#1f2937", backgroundColor: "#fafafa" },
};

export default AdminDashboard;