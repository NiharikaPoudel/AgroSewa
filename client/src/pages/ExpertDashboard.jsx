import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatButton from "../components/ChatButton";
import ChatNotificationBadge from "../components/ChatNotificationBadge";

/* ═══════════════════════════════════════════════════════════════
   CONFIG
═══════════════════════════════════════════════════════════════ */
const PROFILE_KEY = "user"; // match your localStorage key
const BACKEND     = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/* ═══════════════════════════════════════════════════════════════
   STATUS META
═══════════════════════════════════════════════════════════════ */
const STATUS_META = {
  pending:   { label: "Pending",   bg: "#fef9c3", color: "#92400e", dot: "#f59e0b" },
  assigned:  { label: "Assigned",  bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
  accepted:  { label: "Accepted",  bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  collected: { label: "Collected", bg: "#ede9fe", color: "#5b21b6", dot: "#8b5cf6" },
  completed: { label: "Completed", bg: "#f0fdf4", color: "#15803d", dot: "#10b981" },
  cancelled: { label: "Cancelled", bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
};

/* ═══════════════════════════════════════════════════════════════
   SMALL SHARED COMPONENTS
═══════════════════════════════════════════════════════════════ */
const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.5px", background:m.bg, color:m.color }}>
      <span style={{ width:5, height:5, borderRadius:"50%", background:m.dot }} />
      {m.label}
    </span>
  );
};

const InitialAvatar = ({ name, size = 38 }) => (
  <div style={{ width:size, height:size, borderRadius:8, background:"linear-gradient(135deg,#f0fdf4,#dcfce7)", border:"1.5px solid #bbf7d0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:size>=48?20:14, fontWeight:800, color:"#166534", flexShrink:0 }}>
    {name ? name.charAt(0).toUpperCase() : "E"}
  </div>
);

const StatPill = ({ label, value, color, bg }) => (
  <div style={{ padding:"10px 18px", background:bg||"#fff", border:"1px solid #e5e7eb", borderRadius:12, textAlign:"center", minWidth:80 }}>
    <div style={{ fontSize:24, fontWeight:800, color, lineHeight:1, marginBottom:3 }}>{value}</div>
    <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px" }}>{label}</div>
  </div>
);

const TABS = [
  { key:"assigned",  label:"New Jobs"  },
  { key:"accepted",  label:"Accepted"  },
  { key:"collected", label:"Collected" },
  { key:"completed", label:"Completed" },
  { key:"all",       label:"All"       },
];

/* ═══════════════════════════════════════════════════════════════
   REPORT UPLOAD PANEL  (fully preserved from previous version)
═══════════════════════════════════════════════════════════════ */
const ReportUploadPanel = ({ booking, token, onSuccess, onError }) => {
  const [file,      setFile]      = useState(null);
  const [dragOver,  setDragOver]  = useState(false);
  const [uploading, setUploading] = useState(false);
  const [soilData,  setSoilData]  = useState({
    ph:"", nitrogen:"", phosphorus:"", potassium:"", organicMatter:"", fertilizerRecommendation:"",
  });
  const fileRef = useRef();

  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); const f=e.dataTransfer.files[0]; if(f) setFile(f); };

  const handleSubmit = async () => {
    if (!file) { onError("Please select a report file."); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("reportFile", file);
      Object.entries(soilData).forEach(([k,v]) => { if(v) fd.append(k,v); });
      const res = await axios.post(`${BACKEND}/api/bookings/${booking._id}/upload-report`, fd, {
        headers: { Authorization:`Bearer ${token}`, "Content-Type":"multipart/form-data" },
      });
      if (res.data.success) onSuccess("Report uploaded successfully.");
      else onError(res.data.message);
    } catch { onError("Upload failed. Please try again."); }
    finally { setUploading(false); }
  };

  return (
    <div style={{ marginTop:16, padding:20, background:"#fafafa", border:"1.5px solid #e5e7eb", borderRadius:12 }}>
      <p style={{ margin:"0 0 14px", fontSize:13, fontWeight:700, color:"#111827" }}>
        {booking.reportFile ? "Replace Soil Test Report" : "Upload Soil Test Report"}
      </p>
      {booking.reportFile && (
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 14px", background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, marginBottom:14 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span style={{ fontSize:12, color:"#166534", fontWeight:600 }}>Report already uploaded — you can replace it below.</span>
        </div>
      )}
      <div onClick={() => fileRef.current.click()} onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        style={{ border:`2px dashed ${dragOver?"#16a34a":file?"#16a34a":"#d1d5db"}`, borderRadius:10, padding:"24px 16px", textAlign:"center", cursor:"pointer", background:dragOver?"#f0fdf4":file?"#f9fffe":"#fff", transition:"all 0.2s" }}>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display:"none" }} onChange={(e) => setFile(e.target.files[0])} />
        {file ? (
          <div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:6 }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p style={{ margin:0, fontSize:12, fontWeight:700, color:"#166534" }}>{file.name}</p>
            <p style={{ margin:"3px 0 0", fontSize:11, color:"#9ca3af" }}>{(file.size/1024/1024).toFixed(2)} MB — click to change</p>
          </div>
        ) : (
          <div>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom:8 }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <p style={{ margin:0, fontSize:12, fontWeight:600, color:"#6b7280" }}>Drag & drop or click to select</p>
            <p style={{ margin:"3px 0 0", fontSize:11, color:"#9ca3af" }}>PDF, JPG, PNG — max 10 MB</p>
          </div>
        )}
      </div>
      <div style={{ marginTop:16 }}>
        <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.5px" }}>Soil Test Results (optional)</p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[{key:"ph",label:"pH Level"},{key:"nitrogen",label:"Nitrogen (mg/kg)"},{key:"phosphorus",label:"Phosphorus (mg/kg)"},{key:"potassium",label:"Potassium (mg/kg)"},{key:"organicMatter",label:"Organic Matter (%)"}]
            .map(({ key, label }) => (
            <div key={key}>
              <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#9ca3af", marginBottom:4 }}>{label}</label>
              <input type="number" step="0.01" value={soilData[key]} placeholder="—"
                onChange={(e) => setSoilData((p) => ({ ...p, [key]:e.target.value }))}
                style={{ width:"100%", padding:"7px 10px", fontSize:12, border:"1px solid #e5e7eb", borderRadius:7, outline:"none", boxSizing:"border-box" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop:8 }}>
          <label style={{ display:"block", fontSize:10, fontWeight:600, color:"#9ca3af", marginBottom:4 }}>FERTILIZER RECOMMENDATION</label>
          <textarea value={soilData.fertilizerRecommendation} rows={2} placeholder="e.g. Apply 50 kg urea per bigha..."
            onChange={(e) => setSoilData((p) => ({ ...p, fertilizerRecommendation:e.target.value }))}
            style={{ width:"100%", padding:"8px 10px", fontSize:12, border:"1px solid #e5e7eb", borderRadius:7, outline:"none", resize:"vertical", boxSizing:"border-box", fontFamily:"inherit" }} />
        </div>
      </div>
      <button onClick={handleSubmit} disabled={uploading||!file}
        style={{ marginTop:14, width:"100%", padding:11, background:uploading||!file?"#9ca3af":"#166534", color:"#fff", border:"none", borderRadius:8, fontWeight:700, fontSize:13, cursor:uploading||!file?"not-allowed":"pointer", fontFamily:"inherit" }}>
        {uploading ? "Uploading..." : "Upload Report"}
      </button>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS MINI CARDS  (shown inside chat panel on Analytics tab)
═══════════════════════════════════════════════════════════════ */
const AnalyticsCards = ({ bookings }) => {
  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status]||0)+1; return acc; }, {});
  const earned = bookings.filter((b) => b.status==="completed").reduce((s,b) => s+(b.amount||500),0);
  const pendingReports = bookings.filter((b) => b.status==="collected" && !b.reportFile).length;

  const cards = [
    { label:"Total",     value:bookings.length,              color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe" },
    { label:"Completed", value:counts.completed||0,           color:"#059669", bg:"#ecfdf5", border:"#6ee7b7" },
    { label:"Active",    value:(counts.assigned||0)+(counts.accepted||0), color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
    { label:"Earnings",  value:`₨${(earned/1000).toFixed(1)}k`, color:"#b45309", bg:"#fffbeb", border:"#fde68a" },
    { label:"Missing Reports", value:pendingReports,          color:"#dc2626", bg:"#fef2f2", border:"#fecaca" },
    { label:"Collected", value:counts.collected||0,           color:"#5b21b6", bg:"#ede9fe", border:"#ddd6fe" },
  ];

  return (
    <div style={{ padding:"12px 14px", borderBottom:"1px solid #f3f4f6" }}>
      <p style={{ margin:"0 0 9px", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.6px" }}>Live Analytics</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:7 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ padding:"8px 10px", background:c.bg, border:`1px solid ${c.border}`, borderRadius:9, textAlign:"center" }}>
            <div style={{ fontSize:16, fontWeight:800, color:c.color, lineHeight:1 }}>{c.value}</div>
            <div style={{ fontSize:9, color:"#6b7280", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.4px", marginTop:2 }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   CHAT ASSISTANT  — dual tab: Analytics (DB) + AI Advice (Groq)
═══════════════════════════════════════════════════════════════ */
const ANALYTICS_CHIPS = [
  "Give me an overview",
  "How many tests this week?",
  "What is my next booking?",
  "Show pending reports",
  "Estimate earnings this month",
  "Top locations",
  "List my farmers",
];

const AI_CHIPS = [
  "Best fertilizer for rice?",
  "How to fix low soil pH?",
  "Signs of nitrogen deficiency?",
  "Natural pest control methods",
  "Irrigation tips for dry season",
  "How to read soil test results?",
  "Best crops for clay soil?",
];

const TypingDots = () => (
  <div style={{ display:"flex", gap:4, padding:"11px 14px", background:"#fff", borderRadius:"3px 12px 12px 12px", border:"1px solid #f3f4f6", width:"fit-content" }}>
    {[0,1,2].map((i) => (
      <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"#16a34a", animation:`tdot 1.2s ease-in-out ${i*0.2}s infinite` }} />
    ))}
  </div>
);

const ChatAssistant = ({ token, isOpen, onClose, bookings }) => {
  const [activeTab, setActiveTab] = useState("analytics"); // "analytics" | "ai"
  const [analyticsMessages, setAnalyticsMessages] = useState([{
    role:"assistant",
    text:"Hello! Ask me anything about your bookings — completions, earnings, upcoming visits, pending reports, and more. You can also use the live cards above for a quick overview.",
    time:new Date(),
  }]);
  const [aiMessages, setAiMessages] = useState([{
    role:"assistant",
    text:"Hello! I am AgroSewa AI, powered by Llama 3. Ask me any farming or soil science question — I will give you advice personalized to your work area and recent tests.",
    time:new Date(),
  }]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  const messages    = activeTab==="analytics" ? analyticsMessages : aiMessages;
  const setMessages = activeTab==="analytics" ? setAnalyticsMessages : setAiMessages;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [analyticsMessages, aiMessages, loading, activeTab]);
  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 150); }, [isOpen, activeTab]);

  const send = async (text) => {
    const msg = (text||input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role:"user", text:msg, time:new Date() }]);
    setLoading(true);

    try {
      let reply = "";
      if (activeTab==="analytics") {
        const res = await axios.post(`${BACKEND}/api/chat/expert`, { message:msg }, { headers:{ Authorization:`Bearer ${token}` } });
        reply = res.data.success ? res.data.reply : (res.data.message||"Something went wrong.");
      } else {
        const res = await axios.post(`${BACKEND}/api/chat/analyze`, { message:msg }, { headers:{ Authorization:`Bearer ${token}` } });
        reply = res.data.success ? res.data.data?.response : (res.data.message||"AI service unavailable.");
      }
      setMessages((prev) => [...prev, { role:"assistant", text:reply, time:new Date() }]);
    } catch {
      setMessages((prev) => [...prev, { role:"assistant", text:"Connection error. Please try again.", time:new Date() }]);
    } finally {
      setLoading(false);
    }
  };

  const fmtTime = (d) => new Date(d).toLocaleTimeString([],{ hour:"2-digit", minute:"2-digit" });
  const chips   = activeTab==="analytics" ? ANALYTICS_CHIPS : AI_CHIPS;

  if (!isOpen) return null;

  return (
    <div style={CP.panel}>
      {/* ── Header ── */}
      <div style={CP.header}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={CP.headerIcon}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#fff" }}>AgroSewa Assistant</p>
            <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.75)" }}>
              {activeTab==="analytics" ? "Your booking data & analytics" : "AI farming advice · Powered by Llama 3"}
            </p>
          </div>
        </div>
        <button onClick={onClose} style={{ background:"rgba(255,255,255,0.15)", border:"none", borderRadius:6, cursor:"pointer", padding:"5px 10px", color:"#fff", fontSize:16, lineHeight:1 }}>×</button>
      </div>

      {/* ── Tab switcher ── */}
      <div style={{ display:"flex", background:"#f8fafc", borderBottom:"1px solid #e5e7eb" }}>
        {[
          { key:"analytics", icon:"📊", label:"My Analytics" },
          { key:"ai",        icon:"🤖", label:"AI Farming Advice" },
        ].map((t) => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setInput(""); }}
            style={{ flex:1, padding:"10px 4px", border:"none", background:"transparent", cursor:"pointer", fontSize:11.5, fontWeight:activeTab===t.key?700:500, color:activeTab===t.key?"#166534":"#6b7280", borderBottom:activeTab===t.key?"2.5px solid #166534":"2.5px solid transparent", display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"inherit", transition:"all 0.15s" }}>
            <span>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── Analytics mini cards (only on analytics tab) ── */}
      {activeTab==="analytics" && <AnalyticsCards bookings={bookings} />}

      {/* ── Messages ── */}
      <div style={CP.messages}>
        {messages.map((m, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:m.role==="user"?"flex-end":"flex-start", marginBottom:12 }}>
            {m.role==="assistant" && (
              <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:4 }}>
                <div style={{ width:19, height:19, borderRadius:"50%", background:activeTab==="ai"?"linear-gradient(135deg,#7c3aed,#a855f7)":"linear-gradient(135deg,#166534,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>
                  {activeTab==="ai" ? "🤖" : <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18M3 21L21 3"/></svg>}
                </div>
                <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>{activeTab==="ai"?"AgroSewa AI":"Analytics"} · {fmtTime(m.time)}</span>
              </div>
            )}
            <div style={{
              maxWidth:"88%", padding:"9px 13px",
              borderRadius:m.role==="user"?"12px 12px 3px 12px":"3px 12px 12px 12px",
              background:m.role==="user"
                ? (activeTab==="ai"?"linear-gradient(135deg,#5b21b6,#7c3aed)":"linear-gradient(135deg,#166534,#15803d)")
                : "#fff",
              color:m.role==="user"?"#fff":"#1f2937",
              fontSize:12.5, lineHeight:1.7, fontWeight:500,
              border:m.role==="assistant"?"1px solid #f3f4f6":"none",
              boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
              whiteSpace:"pre-wrap", wordBreak:"break-word",
            }}>
              {m.text}
            </div>
            {m.role==="user" && <span style={{ fontSize:10, color:"#9ca3af", marginTop:3 }}>{fmtTime(m.time)}</span>}
          </div>
        ))}

        {loading && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-start", marginBottom:12 }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:5 }}>
              <div style={{ width:19, height:19, borderRadius:"50%", background:activeTab==="ai"?"linear-gradient(135deg,#7c3aed,#a855f7)":"linear-gradient(135deg,#166534,#16a34a)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:9 }}>
                {activeTab==="ai"?"🤖":"⚡"}
              </div>
              <span style={{ fontSize:10, color:"#9ca3af" }}>{activeTab==="ai"?"AI is thinking...":"Looking up your data..."}</span>
            </div>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Quick chips ── */}
      <div style={CP.chips}>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
          {chips.map((c, i) => (
            <button key={i} onClick={() => send(c)} disabled={loading}
              style={{ padding:"4px 10px", background:activeTab==="ai"?"#f5f3ff":"#f0fdf4", color:activeTab==="ai"?"#5b21b6":"#166534", border:`1px solid ${activeTab==="ai"?"#ddd6fe":"#bbf7d0"}`, borderRadius:20, fontSize:10.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit", opacity:loading?0.5:1 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input bar ── */}
      <div style={CP.inputRow}>
        <textarea ref={inputRef} value={input} rows={1}
          placeholder={activeTab==="analytics" ? "Ask about your bookings..." : "Ask any farming question..."}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); send(); } }}
          style={{ ...CP.input, borderColor:activeTab==="ai"?"#ddd6fe":"#e5e7eb" }} />
        <button onClick={() => send()} disabled={!input.trim()||loading}
          style={{ ...CP.sendBtn, background:activeTab==="ai"?"linear-gradient(135deg,#5b21b6,#7c3aed)":"linear-gradient(135deg,#166534,#16a34a)", opacity:!input.trim()||loading?0.5:1, cursor:!input.trim()||loading?"not-allowed":"pointer" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
};

const CP = {
  panel:    { position:"fixed", bottom:90, right:24, width:400, maxWidth:"calc(100vw - 32px)", height:580, background:"#f8fafc", borderRadius:18, boxShadow:"0 24px 70px rgba(0,0,0,0.18)", display:"flex", flexDirection:"column", overflow:"hidden", zIndex:900, border:"1px solid #e5e7eb", animation:"chatUp 0.25s ease-out" },
  header:   { background:"linear-gradient(135deg,#14532d,#166534,#15803d)", padding:"13px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 },
  headerIcon:{ width:36, height:36, borderRadius:10, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  messages: { flex:1, overflowY:"auto", padding:"14px 14px 8px", display:"flex", flexDirection:"column" },
  chips:    { padding:"8px 12px", borderTop:"1px solid #f3f4f6", background:"#fff", flexShrink:0 },
  inputRow: { display:"flex", gap:8, padding:"10px 12px", borderTop:"1px solid #e5e7eb", background:"#fff", flexShrink:0, alignItems:"flex-end" },
  input:    { flex:1, padding:"9px 12px", fontSize:12.5, border:"1.5px solid #e5e7eb", borderRadius:10, outline:"none", resize:"none", fontFamily:"inherit", color:"#1f2937", lineHeight:1.5, maxHeight:80, overflowY:"auto" },
  sendBtn:  { width:38, height:38, border:"none", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.2s" },
};

/* ═══════════════════════════════════════════════════════════════
   MAIN EXPERT DASHBOARD
═══════════════════════════════════════════════════════════════ */
const ExpertDashboard = () => {
  const navigate = useNavigate();
  const token    = localStorage.getItem("token");

  const [bookings,      setBookings]      = useState([]);
  const [profile,       setProfile]       = useState(null);
  const [activeTab,     setActiveTab]     = useState("assigned");
  const [selected,      setSelected]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [flash,         setFlash]         = useState({ text:"", type:"" });
  const [showUpload,    setShowUpload]    = useState(null);
  const [chatOpen,      setChatOpen]      = useState(false);

  useEffect(() => {
    try { const s=localStorage.getItem(PROFILE_KEY); if(s) setProfile(JSON.parse(s)); } catch {}
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BACKEND}/api/bookings/expert/my`, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.data.success) setBookings(res.data.bookings);
    } catch { setFlash({ text:"Failed to load bookings.", type:"error" }); }
    finally { setLoading(false); }
  };

  const counts  = bookings.reduce((acc,b) => { acc[b.status]=(acc[b.status]||0)+1; return acc; }, {});
  const visible = activeTab==="all" ? bookings : bookings.filter((b) => b.status===activeTab);

  const doAction = async (endpoint, msg) => {
    setActionLoading(true);
    try {
      const res = await axios.patch(`${BACKEND}/api${endpoint}`, {}, { headers:{ Authorization:`Bearer ${token}` } });
      if (res.data.success) {
        setFlash({ text:res.data.message||msg, type:"success" });
        setSelected(null); setShowUpload(null);
        await load();
      } else { setFlash({ text:res.data.message, type:"error" }); }
    } catch { setFlash({ text:"Action failed.", type:"error" }); }
    finally { setActionLoading(false); }
  };

  const fmt = (d) => new Date(d).toLocaleDateString("en-US",{ year:"numeric", month:"short", day:"numeric" });

  const pendingReports = bookings.filter((b) => b.status==="collected" && !b.reportFile).length;

  return (
    <>
      <div style={S.page}>

        {/* ── Top bar ── */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Back
          </button>
          <div>
            <span style={{ fontSize:11, color:"#9ca3af", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>Expert Dashboard</span>
          </div>
          {pendingReports > 0 && (
            <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7, padding:"7px 13px", background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, cursor:"pointer" }} onClick={() => setChatOpen(true)}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:"#ef4444" }} />
              <span style={{ fontSize:12, color:"#b91c1c", fontWeight:700 }}>{pendingReports} report{pendingReports!==1?"s":""} pending upload</span>
            </div>
          )}
          <ChatNotificationBadge />
        </div>

        {/* ── Profile + Stats card ── */}
        <div style={{ ...S.card, marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:18, flexWrap:"wrap" }}>
            <InitialAvatar name={profile?.name} size={58} />
            <div style={{ flex:1, minWidth:0 }}>
              <h1 style={{ margin:"0 0 3px", fontSize:19, fontWeight:800, color:"#0f172a", letterSpacing:"-0.02em" }}>{profile?.name||"Expert"}</h1>
              <p style={{ margin:"0 0 3px", fontSize:13, color:"#6b7280" }}>{profile?.email}</p>
              {profile?.labName && (
                <p style={{ margin:0, fontSize:12, color:"#166534", fontWeight:700 }}>
                  {profile.labName}{profile.labMunicipality?` · ${profile.labMunicipality}`:""}{profile.labWard?`, Ward ${profile.labWard}`:""}
                </p>
              )}
            </div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <StatPill label="Active"    value={(counts.assigned||0)+(counts.accepted||0)} color="#3b82f6" bg="#eff6ff" />
              <StatPill label="Assigned"  value={counts.assigned||0}  color="#1e40af" bg="#dbeafe" />
              <StatPill label="Accepted"  value={counts.accepted||0}  color="#166534" bg="#dcfce7" />
              <StatPill label="Collected" value={counts.collected||0} color="#5b21b6" bg="#ede9fe" />
              <StatPill label="Done"      value={counts.completed||0} color="#059669" bg="#ecfdf5" />
            </div>
          </div>
        </div>

        {/* ── Flash ── */}
        {flash.text && (
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 16px", marginBottom:18, border:"1px solid", borderRadius:9, background:flash.type==="success"?"#f0fdf4":"#fef2f2", borderColor:flash.type==="success"?"#bbf7d0":"#fecaca", color:flash.type==="success"?"#166534":"#b91c1c" }}>
            <span style={{ flex:1, fontSize:13 }}>{flash.text}</span>
            <button onClick={() => setFlash({text:"",type:""})} style={{ background:"none", border:"none", cursor:"pointer", fontSize:17, color:"inherit" }}>×</button>
          </div>
        )}

        {/* ── Bookings table card ── */}
        <div style={{ ...S.card, padding:0 }}>
          {/* section header + tabs */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", borderBottom:"1px solid #f3f4f6", background:"#fafafa", flexWrap:"wrap", gap:10 }}>
            <h2 style={{ margin:0, fontSize:15, fontWeight:700, color:"#111827" }}>My Bookings</h2>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
              {TABS.map((tab) => (
                <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSelected(null); }}
                  style={{ padding:"6px 13px", borderRadius:7, border:"1.5px solid", borderColor:activeTab===tab.key?"#166534":"#e5e7eb", background:activeTab===tab.key?"#f0fdf4":"#fff", color:activeTab===tab.key?"#166534":"#6b7280", fontWeight:activeTab===tab.key?700:500, fontSize:12, cursor:"pointer", display:"flex", alignItems:"center", gap:5, fontFamily:"inherit" }}>
                  {tab.label}
                  {tab.key!=="all" && (counts[tab.key]||0)>0 && (
                    <span style={{ background:activeTab===tab.key?"#166534":"#9ca3af", color:"#fff", borderRadius:999, fontSize:9, fontWeight:700, padding:"1px 6px" }}>{counts[tab.key]}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* table body */}
          {loading ? (
            <div style={{ padding:60, textAlign:"center" }}>
              <div style={{ width:26, height:26, border:"2.5px solid #e5e7eb", borderTopColor:"#166534", borderRadius:"50%", animation:"spin 0.75s linear infinite", margin:"0 auto 14px" }} />
              <p style={{ color:"#9ca3af", fontSize:13 }}>Loading bookings...</p>
            </div>
          ) : visible.length===0 ? (
            <div style={{ padding:60, textAlign:"center" }}>
              <div style={{ fontSize:36, marginBottom:10 }}>🌱</div>
              <p style={{ color:"#6b7280", fontSize:14, fontWeight:600, margin:"0 0 4px" }}>No {activeTab==="all"?"":""+activeTab+" "}bookings</p>
              <p style={{ color:"#9ca3af", fontSize:12, margin:0 }}>New assignments will appear here automatically.</p>
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr>
                    {["Farmer","Location","Field / Crop","Schedule","Status","Actions"].map((h) => (
                      <th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.6px", borderBottom:"1px solid #f3f4f6", background:"#f9fafb", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((b, i) => (
                    <tr key={b._id} style={{ borderBottom:"1px solid #f9fafb", background:i%2===0?"#fff":"#fafafa", transition:"background 0.15s" }}>
                      <td style={S.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                          <InitialAvatar name={b.farmer?.name} size={32} />
                          <div>
                            <p style={{ margin:"0 0 1px", fontSize:13, fontWeight:600, color:"#1f2937" }}>{b.farmer?.name||"—"}</p>
                            <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>{b.farmer?.email||""}</p>
                          </div>
                        </div>
                      </td>
                      <td style={S.td}>
                        <p style={{ margin:0, fontSize:13, fontWeight:600, color:"#374151" }}>{b.location?.municipality}</p>
                        <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>Ward {b.location?.ward}</p>
                      </td>
                      <td style={S.td}>
                        <p style={{ margin:0, fontSize:13, color:"#374151", fontWeight:500 }}>{b.fieldName}</p>
                        {b.cropType && <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>{b.cropType}</p>}
                      </td>
                      <td style={S.td}>
                        <p style={{ margin:0, fontSize:13, color:"#374151" }}>{b.nepaliDate||fmt(b.collectionDate)}</p>
                        <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>{b.timeSlot}</p>
                      </td>
                      <td style={S.td}>
                        <StatusBadge status={b.status} />
                        {b.status==="collected" && b.reportFile && (
                          <div style={{ marginTop:5, display:"inline-flex", alignItems:"center", gap:4, fontSize:9.5, color:"#059669", fontWeight:700, background:"#ecfdf5", padding:"2px 7px", borderRadius:20, border:"1px solid #6ee7b7" }}>
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Report ready
                          </div>
                        )}
                        {b.status==="collected" && !b.reportFile && (
                          <div style={{ marginTop:5, fontSize:9.5, color:"#b91c1c", fontWeight:700, background:"#fef2f2", padding:"2px 7px", borderRadius:20, border:"1px solid #fecaca", display:"inline-block" }}>
                            Report needed
                          </div>
                        )}
                      </td>
                      <td style={S.td}>
                        <div style={{ display:"flex", gap:5, flexWrap:"wrap", alignItems:"flex-start" }}>
                          <button onClick={() => setSelected(b)} style={S.viewBtn}>View</button>
                          {b.status==="assigned" && (
                            <>
                              <button onClick={() => doAction(`/bookings/${b._id}/accept`,"Accepted.")} disabled={actionLoading} style={S.greenBtn}>Accept</button>
                              <button onClick={() => window.confirm("Reject and re-assign?")&&doAction(`/bookings/${b._id}/reject`,"Rejected.")} disabled={actionLoading} style={S.redBtn}>Reject</button>
                            </>
                          )}
                          {b.status==="accepted" && (
                            <button onClick={() => doAction(`/bookings/${b._id}/collect`,"Sample collected.")} disabled={actionLoading} style={S.purpleBtn}>Collected</button>
                          )}
                          {b.status==="collected" && (
                            <>
                              <button onClick={() => setShowUpload(showUpload===b._id?null:b._id)} style={S.blueBtn}>
                                {showUpload===b._id ? "Close" : "Upload Report"}
                              </button>
                              {b.reportFile && (
                                <button onClick={() => doAction(`/bookings/${b._id}/complete`,"Booking completed.")} disabled={actionLoading} style={S.tealBtn}>Complete</button>
                              )}
                            </>
                          )}
                        </div>
                        {showUpload===b._id && b.status==="collected" && (
                          <ReportUploadPanel booking={b} token={token}
                            onSuccess={(msg) => { setFlash({text:msg,type:"success"}); setShowUpload(null); load(); }}
                            onError={(msg) => setFlash({text:msg,type:"error"})} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Detail Modal ── */}
        {selected && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:950, padding:20 }} onClick={() => setSelected(null)}>
            <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:520, maxHeight:"90vh", overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 24px 70px rgba(0,0,0,0.18)" }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px", borderBottom:"1px solid #f3f4f6", background:"#fafafa" }}>
                <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"#111827" }}>Booking Details</h3>
                <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:20, color:"#9ca3af" }}>×</button>
              </div>
              <div style={{ padding:20, overflowY:"auto" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 14px", background:"#f9fafb", borderRadius:10, border:"1px solid #f3f4f6", marginBottom:18 }}>
                  <div>
                    <p style={{ margin:"0 0 2px", fontSize:15, fontWeight:700 }}>{selected.farmer?.name}</p>
                    <p style={{ margin:0, fontSize:12, color:"#9ca3af" }}>{selected.farmer?.email}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <MBlock title="Location">
                  <MRow label="Municipality" value={selected.location?.municipality} />
                  <MRow label="Ward" value={`Ward ${selected.location?.ward}`} />
                  {selected.location?.district && <MRow label="District" value={selected.location.district} />}
                </MBlock>
                <MBlock title="Field Info">
                  <MRow label="Field Name" value={selected.fieldName} />
                  {selected.fieldSize && <MRow label="Field Size" value={selected.fieldSize} />}
                  {selected.cropType   && <MRow label="Crop Type"  value={selected.cropType} />}
                  {selected.notes      && <MRow label="Notes"      value={selected.notes} />}
                </MBlock>
                <MBlock title="Schedule">
                  <MRow label="Date"      value={selected.nepaliDate||fmt(selected.collectionDate)} />
                  <MRow label="Time Slot" value={selected.timeSlot} />
                </MBlock>
                <MBlock title="Contact">
                  <MRow label="Phone" value={selected.phoneNumber} />
                </MBlock>
                <MBlock title="Payment" last>
                  <MRow label="Method" value="Cash on Delivery" />
                  <MRow label="Amount" value={`NPR ${selected.amount||500}`} />
                </MBlock>

                {/* Chat Button */}
                {selected.farmer && (
                  <div style={{ marginBottom: 18 }}>
                    <ChatButton bookingId={selected._id} booking={selected} role="expert" />
                  </div>
                )}

                {selected.status==="collected" && (
                  <div style={{ marginTop:16 }}>
                    <ReportUploadPanel booking={selected} token={token}
                      onSuccess={(msg) => { setFlash({text:msg,type:"success"}); setSelected(null); load(); }}
                      onError={(msg) => setFlash({text:msg,type:"error"})} />
                  </div>
                )}
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:16, borderTop:"1px solid #f3f4f6", marginTop:16 }}>
                  {selected.status==="assigned" && (
                    <>
                      <button onClick={() => doAction(`/bookings/${selected._id}/accept`,"Accepted.")} disabled={actionLoading} style={{ ...S.greenBtn, padding:"10px 22px", fontSize:13 }}>{actionLoading?"...":"Accept"}</button>
                      <button onClick={() => window.confirm("Reject?")&&doAction(`/bookings/${selected._id}/reject`,"Rejected.")} disabled={actionLoading} style={{ ...S.redBtn, padding:"10px 22px", fontSize:13 }}>{actionLoading?"...":"Reject"}</button>
                    </>
                  )}
                  {selected.status==="accepted" && (
                    <button onClick={() => doAction(`/bookings/${selected._id}/collect`,"Sample collected.")} disabled={actionLoading} style={{ ...S.purpleBtn, padding:"10px 22px", fontSize:13 }}>{actionLoading?"...":"Mark Collected"}</button>
                  )}
                  {selected.status==="collected" && selected.reportFile && (
                    <button onClick={() => doAction(`/bookings/${selected._id}/complete`,"Completed.")} disabled={actionLoading} style={{ ...S.tealBtn, padding:"10px 22px", fontSize:13 }}>{actionLoading?"...":"Mark Complete"}</button>
                  )}
                  <button onClick={() => setSelected(null)} style={{ padding:"10px 18px", background:"#f9fafb", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:7, cursor:"pointer", fontSize:13, fontWeight:500, fontFamily:"inherit" }}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          FLOATING CHAT + PANEL
      ══════════════════════════════════════════════════════════ */}
      <ChatAssistant token={token} isOpen={chatOpen} onClose={() => setChatOpen(false)} bookings={bookings} />

      {/* Floating toggle button */}
      <button onClick={() => setChatOpen((v) => !v)} title="AgroSewa Assistant"
        style={{ position:"fixed", bottom:24, right:24, width:56, height:56, borderRadius:"50%", background:chatOpen?"#374151":"linear-gradient(135deg,#14532d,#166534)", border:"none", cursor:"pointer", zIndex:910, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 28px rgba(22,101,52,0.45)", transition:"all 0.25s" }}>
        {chatOpen ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* notification badge */}
        {!chatOpen && pendingReports > 0 && (
          <div style={{ position:"absolute", top:1, right:1, minWidth:16, height:16, borderRadius:999, background:"#ef4444", border:"2px solid #fff", fontSize:8, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, padding:"0 3px" }}>
            {pendingReports}
          </div>
        )}
      </button>

      <style>{`
        @keyframes spin   { to { transform:rotate(360deg); } }
        @keyframes chatUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tdot   { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-5px)} }
        * { box-sizing:border-box; }
      `}</style>
    </>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */
const MBlock = ({ title, children, last }) => (
  <div style={{ marginBottom:last?4:18, paddingBottom:last?0:18, borderBottom:last?"none":"1px solid #f3f4f6" }}>
    <p style={{ margin:"0 0 8px", fontSize:10, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.8px" }}>{title}</p>
    {children}
  </div>
);

const MRow = ({ label, value }) => (
  <div style={{ display:"flex", gap:12, marginBottom:6 }}>
    <span style={{ fontSize:12, color:"#9ca3af", fontWeight:600, minWidth:100 }}>{label}</span>
    <span style={{ fontSize:13, color:"#1f2937", flex:1 }}>{value||"—"}</span>
  </div>
);

const S = {
  page:      { padding:"24px", maxWidth:"1360px", margin:"0 auto", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", paddingBottom:110 },
  card:      { background:"#fff", border:"1px solid #e5e7eb", borderRadius:14, padding:"20px 24px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" },
  backBtn:   { display:"inline-flex", alignItems:"center", gap:6, padding:"7px 14px", background:"#fff", border:"1.5px solid #e5e7eb", borderRadius:8, cursor:"pointer", fontSize:12.5, fontWeight:600, color:"#374151", fontFamily:"inherit" },
  td:        { padding:"12px 14px", verticalAlign:"top" },
  viewBtn:   { padding:"5px 11px", background:"#f9fafb", color:"#374151", border:"1.5px solid #e5e7eb", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:500, fontFamily:"inherit" },
  greenBtn:  { padding:"5px 11px", background:"#166534", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" },
  redBtn:    { padding:"5px 11px", background:"#b91c1c", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" },
  purpleBtn: { padding:"5px 11px", background:"#5b21b6", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" },
  blueBtn:   { padding:"5px 11px", background:"#1d4ed8", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" },
  tealBtn:   { padding:"5px 11px", background:"#0f766e", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:11, fontWeight:700, fontFamily:"inherit" },
};

export default ExpertDashboard;