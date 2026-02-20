import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosed = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

/* ── Growing Plant Animation (unique keyframe names for Register) ── */
const GrowingPlant = () => (
  <svg viewBox="0 0 340 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "245px" }}>
    <style>{`
      .rp-stem {
        stroke-dasharray: 330;
        stroke-dashoffset: 330;
        animation: rpGrow 2.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards;
      }
      .rp-ll1 { opacity:0; animation:rpLeaf .55s ease 1.8s forwards; }
      .rp-lr1 { opacity:0; animation:rpLeaf .55s ease 2.15s forwards; }
      .rp-ll2 { opacity:0; animation:rpLeaf .55s ease 2.5s forwards; }
      .rp-lr2 { opacity:0; animation:rpLeaf .55s ease 2.85s forwards; }
      .rp-ll3 { opacity:0; animation:rpLeaf .55s ease 3.1s forwards; }
      .rp-bloom {
        opacity:0; transform-origin:170px 90px; transform:scale(0);
        animation:rpBloom .5s cubic-bezier(0.34,1.56,0.64,1) 3.5s forwards;
      }
      .rp-root { stroke-dasharray:200; stroke-dashoffset:200; animation:rpGrow 1.1s ease .1s forwards; }
      .rp-soil { opacity:0; animation:rpLeaf .4s ease .1s forwards; }
      .rp-sp1  { opacity:0; animation:rpSpark 1.3s ease 4s infinite; }
      .rp-sp2  { opacity:0; animation:rpSpark 1.3s ease 4.4s infinite; }
      .rp-sp3  { opacity:0; animation:rpSpark 1.3s ease 4.8s infinite; }
      @keyframes rpGrow  { to { stroke-dashoffset: 0; } }
      @keyframes rpLeaf  { from{opacity:0;transform:scale(0.55)} to{opacity:1;transform:scale(1)} }
      @keyframes rpBloom { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
      @keyframes rpSpark { 0%,100%{opacity:0;transform:scale(.5)} 50%{opacity:.75;transform:scale(1.1)} }
    `}</style>
    <ellipse className="rp-soil" cx="170" cy="422" rx="102" ry="14" fill="#a7f3d0" />
    <ellipse className="rp-soil" cx="170" cy="422" rx="68" ry="9" fill="#6ee7b7" />
    <path className="rp-root" d="M170 422 C159 432 143 437 132 429" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="rp-root" d="M170 422 C181 433 198 437 208 431" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="rp-root" d="M170 422 C164 440 156 447 148 441" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />
    <path className="rp-stem"
      d="M170 420 C170 392 165 362 168 332 C171 302 166 270 170 240 C173 212 167 180 170 150 C173 126 168 110 170 90"
      stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
    <g className="rp-ll1" style={{ transformOrigin: "168px 342px" }}>
      <path d="M168 342 C144 323 120 330 109 313 C128 305 151 314 168 329" fill="#22c55e" opacity="0.92" />
    </g>
    <g className="rp-lr1" style={{ transformOrigin: "170px 312px" }}>
      <path d="M170 312 C195 293 220 300 230 284 C211 276 189 285 170 300" fill="#4ade80" opacity="0.88" />
    </g>
    <g className="rp-ll2" style={{ transformOrigin: "168px 272px" }}>
      <path d="M168 272 C141 253 116 262 104 244 C125 236 150 246 168 260" fill="#16a34a" opacity="0.9" />
    </g>
    <g className="rp-lr2" style={{ transformOrigin: "170px 237px" }}>
      <path d="M170 237 C197 218 224 226 235 209 C215 201 191 211 170 224" fill="#86efac" opacity="0.84" />
    </g>
    <g className="rp-ll3" style={{ transformOrigin: "169px 177px" }}>
      <path d="M169 177 C147 160 126 166 116 150 C135 143 158 152 169 167" fill="#22c55e" opacity="0.8" />
    </g>
    <g className="rp-bloom">
      {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <ellipse key={i} cx={170 + Math.cos(r) * 14} cy={90 + Math.sin(r) * 14}
            rx="6.5" ry="4.5" fill={i % 2 === 0 ? "#fbbf24" : "#fde68a"} opacity="0.92"
            transform={`rotate(${deg} ${170 + Math.cos(r) * 14} ${90 + Math.sin(r) * 14})`} />
        );
      })}
      <circle cx="170" cy="90" r="8.5" fill="#f59e0b" />
      <circle cx="170" cy="90" r="4.5" fill="#fef3c7" />
    </g>
    <g className="rp-sp1">
      <line x1="262" y1="138" x2="262" y2="150" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="256" y1="144" x2="268" y2="144" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="rp-sp2">
      <line x1="86" y1="198" x2="86" y2="210" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="80" y1="204" x2="92" y2="204" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="rp-sp3">
      <line x1="253" y1="278" x2="253" y2="288" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="248" y1="283" x2="258" y2="283" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farmer", contactNumber: "", labAddress: "" });
  const [files, setFiles] = useState({ educationCertificate: null, governmentCertificate: null, experienceCertificate: null, idProof: null });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState({});

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const googleError = params.get("error");
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name || "User");
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/", { replace: true });
    }
    if (googleError) setError(t("googleError"));
  }, [location, navigate]);

  const validatePassword = (pw) => {
    if (!/.{8,}/.test(pw)) return t("passwordMinLength");
    if (!/[A-Z]/.test(pw)) return t("passwordUpperCase");
    if (!/[a-z]/.test(pw)) return t("passwordLowerCase");
    if (!/[0-9]/.test(pw)) return t("passwordNumber");
    if (!/[!@#$%^&*]/.test(pw)) return t("passwordSpecialChar");
    return null;
  };

  const handleFile = (e) => setFiles((prev) => ({ ...prev, [e.target.name]: e.target.files[0] }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.password) { setError(t("fillAllFields")); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError(t("invalidEmail")); return; }
    const pwError = validatePassword(form.password);
    if (pwError) { setError(pwError); return; }
    if (form.role === "expert") {
      if (!files.educationCertificate) { setError("Education certificate is required."); return; }
      if (!files.idProof) { setError("ID proof is required."); return; }
      if (!form.contactNumber.trim()) { setError("Contact number is required."); return; }
    }
    try {
      setLoading(true);
      let res;
      if (form.role === "expert") {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("email", form.email.trim());
        fd.append("password", form.password);
        fd.append("role", "expert");
        fd.append("contactNumber", form.contactNumber.trim());
        fd.append("labAddress", form.labAddress);
        if (files.educationCertificate) fd.append("educationCertificate", files.educationCertificate);
        if (files.governmentCertificate) fd.append("governmentCertificate", files.governmentCertificate);
        if (files.experienceCertificate) fd.append("experienceCertificate", files.experienceCertificate);
        if (files.idProof) fd.append("idProof", files.idProof);
        res = await api.post("/auth/register", fd, { headers: { "Content-Type": "multipart/form-data" } });
        if (!res.data.success) { setError(res.data.message?.includes("already exists") ? t("userAlreadyExists") : res.data.message); return; }
        alert(t("expertPendingApproval"));
        navigate("/login");
      } else {
        res = await api.post("/auth/register", { name: form.name.trim(), email: form.email.trim(), password: form.password, role: "farmer" });
        if (!res.data.success) { setError(res.data.message?.includes("already exists") ? t("userAlreadyExists") : res.data.message); return; }
        localStorage.setItem("token", res.data.token);
        navigate("/verify-email");
      }
    } catch { setError(t("registerFailed")); }
    finally { setLoading(false); }
  };

  const googleSignup = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/auth/google`;
  };

  const pwStrength = (() => {
    const pw = form.password; if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++; if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++; if (/[!@#$%^&*]/.test(pw)) s++;
    return s;
  })();
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#16a34a"];
  const strengthLabel = [
    "",
    t("forgot.strengthWeak"),
    t("forgot.strengthFair"),
    t("forgot.strengthGood"),
    t("forgot.strengthStrong"),
  ];

  const inp = (key) => ({
    width: "100%",
    padding: "13px 16px",
    fontSize: "14.5px",
    fontWeight: "400",
    border: `1.5px solid ${focused[key] ? "#16a34a" : "#d1d9e0"}`,
    borderRadius: "10px",
    outline: "none",
    color: "#111827",
    background: "#fff",
    fontFamily: "'Montserrat', sans-serif",
    boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused[key] ? "0 0 0 3.5px rgba(22,163,74,.10)" : "none",
    letterSpacing: "0.01em",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes rpFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rpSlideR  { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes rpSpin    { to{transform:rotate(360deg)} }
        @keyframes rpShake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes rpSlideD  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .rp-page { min-height:100vh; display:flex; font-family:'Montserrat',sans-serif; background:#fff; }

        /* ── LEFT ── */
        .rp-left {
          width:42%; min-height:100vh;
          background: linear-gradient(165deg, #064e29 0%, #0d4a23 30%, #0f5a2b 60%, #146a32 100%);
          border-right:1px solid #0a3d20;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:52px 44px;
          position:sticky; top:0; align-self:flex-start; overflow:hidden;
          opacity:0; transition:opacity .85s ease;
        }
        .rp-left.vis { opacity:1; }
        .rp-left-inner { width:100%; max-width:290px; display:flex; flex-direction:column; align-items:center; position:relative; z-index:2; }

        .rp-glow1 { position:absolute; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(74,222,128,.12) 0%,transparent 70%); top:-60px; right:-70px; pointer-events:none; }
        .rp-glow2 { position:absolute; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,.10) 0%,transparent 70%); bottom:50px; left:-45px; pointer-events:none; }

        .rp-back {
          position:absolute; top:28px; left:28px;
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; font-weight:600; color:rgba(255,255,255,.65);
          text-decoration:none; font-family:'Montserrat',sans-serif;
          padding:7px 14px; border:1px solid rgba(255,255,255,.18);
          border-radius:7px; background:rgba(255,255,255,.07);
          backdrop-filter:blur(6px);
          transition:all .18s ease; letter-spacing:.4px; text-transform:uppercase;
        }
        .rp-back:hover { color:#fff; border-color:rgba(255,255,255,.36); background:rgba(255,255,255,.14); transform:translateX(-2px); }

        .rp-tag {
          font-size:10px; font-weight:700; letter-spacing:3.5px; text-transform:uppercase;
          color:#4ade80; margin-bottom:14px; text-align:center;
        }
        .rp-heading {
          font-family:'Montserrat',sans-serif;
          font-size:clamp(24px,2.4vw,33px); line-height:1.22;
          color:#fff; text-align:center; font-weight:800;
          margin-bottom:12px; letter-spacing:-.5px;
        }
        .rp-heading em { font-style:italic; color:#86efac; font-weight:700; }
        .rp-desc { font-size:13px; color:rgba(255,255,255,.58); text-align:center; line-height:1.75; font-weight:400; margin-bottom:24px; letter-spacing:.1px; }

        .rp-plant-wrap { display:flex; justify-content:center; width:100%; margin-bottom:20px; }

        .rp-feats { display:flex; flex-direction:column; gap:8px; width:100%; }
        .rp-feat  {
          display:flex; align-items:center; gap:10px; padding:10px 13px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          border-radius:8px; backdrop-filter:blur(4px);
        }
        .rp-feat-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; flex-shrink:0; }
        .rp-feat-txt { font-size:12px; color:rgba(255,255,255,.72); font-weight:500; letter-spacing:.1px; }

        /* ── RIGHT ── */
        .rp-right {
          flex:1; display:flex; align-items:flex-start; justify-content:center;
          padding:56px 56px; background:#fff; overflow-y:auto;
          opacity:0; transform:translateX(26px);
          transition:opacity .7s ease .22s, transform .7s ease .22s;
        }
        .rp-right.vis { opacity:1; transform:translateX(0); }

        .rp-form-card { width:100%; max-width:400px; padding-bottom:52px; animation:rpFadeUp .55s ease .42s both; }

        .rp-form-title {
          font-family:'Montserrat',sans-serif;
          font-size:30px; font-weight:800; color:#0d1f0e;
          margin-bottom:6px; letter-spacing:-.7px; line-height:1.12;
        }
        .rp-form-sub { font-size:14px; color:#64748b; margin-bottom:28px; font-weight:400; line-height:1.65; letter-spacing:.01em; }

        .rp-err {
          display:flex; align-items:center; gap:9px; padding:12px 15px;
          background:#fff5f5; border:1.5px solid #fecaca; border-radius:10px;
          color:#dc2626; font-size:13px; font-weight:600; margin-bottom:22px;
          animation:rpShake .35s ease;
        }

        .rp-fld { margin-bottom:17px; }
        .rp-lbl { display:block; font-size:11.5px; font-weight:700; color:#1e293b; margin-bottom:8px; letter-spacing:.8px; text-transform:uppercase; }

        /* Role */
        .rp-role-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
        .rp-role-card {
          padding:15px 12px; border:1.5px solid #d1d9e0; border-radius:10px;
          cursor:pointer; background:#fff; text-align:center;
          transition:all .18s ease; user-select:none; position:relative;
        }
        .rp-role-card:hover { border-color:#86efac; background:#f4fef6; }
        .rp-role-card.act  { border-color:#16a34a; background:#f0fdf4; box-shadow:0 0 0 3.5px rgba(22,163,74,.08); }
        .rp-role-icon { font-size:22px; display:block; margin-bottom:6px; }
        .rp-role-name { font-size:12.5px; font-weight:700; color:#1e293b; letter-spacing:.1px; }
        .rp-role-chk  { position:absolute; top:8px; right:8px; width:17px; height:17px; border-radius:50%; background:#16a34a; display:flex; align-items:center; justify-content:center; }
        .rp-expert-note { margin-top:10px; padding:10px 13px; border-radius:8px; background:#fffbeb; border:1px solid #fde68a; font-size:12px; color:#92400e; line-height:1.58; font-weight:500; animation:rpSlideD .22s ease; }

        /* Expert section */
        .rp-exp-sec { border:1.5px solid #d1d9e0; border-radius:12px; padding:18px 18px 6px; background:#fafbfc; margin-bottom:16px; animation:rpSlideD .28s ease; }
        .rp-exp-head { font-size:10px; font-weight:800; color:#94a3b8; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #eef2f6; }

        /* File upload */
        .rp-file-up { display:flex; align-items:center; gap:9px; padding:10px 13px; border:1.5px dashed #c8d3de; border-radius:9px; background:#fff; cursor:pointer; transition:all .18s ease; position:relative; user-select:none; }
        .rp-file-up:hover { border-color:#86efac; background:#f4fef6; }
        .rp-file-up input { position:absolute; opacity:0; width:0; height:0; }
        .rp-file-name { flex:1; font-size:12.5px; color:#94a3b8; font-weight:500; }
        .rp-file-name.ok { color:#16a34a; font-weight:600; }
        .rp-file-browse { padding:4px 11px; background:#fff; border:1.5px solid #d1d9e0; border-radius:6px; font-size:11.5px; font-weight:700; color:#475569; flex-shrink:0; letter-spacing:.2px; }

        /* Password */
        .rp-pw-wrap { position:relative; }
        .rp-pw-eye  { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; transition:color .15s; padding:3px; }
        .rp-pw-eye:hover { color:#475569; }
        .rp-str-row  { display:flex; align-items:center; gap:9px; margin-top:8px; }
        .rp-str-bars { display:flex; gap:4px; flex:1; }
        .rp-str-bar  { flex:1; height:3.5px; border-radius:3px; background:#e2e8f0; transition:background .3s; }
        .rp-pw-hint  { font-size:11.5px; color:#94a3b8; margin-top:6px; line-height:1.58; font-weight:400; }

        /* Email check */
        .rp-e-wrap { position:relative; }
        .rp-e-chk  { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:#16a34a; font-weight:700; font-size:15px; pointer-events:none; }

        /* Submit */
        .rp-submit {
          width:100%; padding:14px; font-size:14.5px; font-weight:700;
          color:#fff; background:#16a34a; border:none; border-radius:10px;
          cursor:pointer; font-family:'Montserrat',sans-serif;
          transition:all .2s ease; margin-top:6px; margin-bottom:20px;
          display:flex; align-items:center; justify-content:center; gap:9px;
          letter-spacing:.3px; text-transform:uppercase;
        }
        .rp-submit:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); box-shadow:0 8px 22px rgba(22,163,74,.26); }
        .rp-submit:disabled { opacity:.65; cursor:not-allowed; }
        .rp-spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:rpSpin .65s linear infinite; }

        .rp-divider { display:flex; align-items:center; gap:13px; margin:4px 0 16px; }
        .rp-div-line { flex:1; height:1px; background:#eff2f5; }
        .rp-div-txt  { font-size:11.5px; color:#c5cdd6; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }

        .rp-g-btn {
          width:100%; padding:13px 16px; font-size:14px; font-weight:600;
          color:#374151; background:#fff; border:1.5px solid #d1d9e0; border-radius:10px;
          cursor:pointer; font-family:'Montserrat',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:11px;
          transition:all .18s ease; margin-bottom:26px; letter-spacing:.1px;
        }
        .rp-g-btn:hover { border-color:#86efac; background:#f4fef6; color:#111827; }

        .rp-login-row  { text-align:center; font-size:13.5px; color:#64748b; font-weight:500; }
        .rp-login-link { color:#16a34a; font-weight:700; text-decoration:none; margin-left:5px; letter-spacing:.1px; }
        .rp-login-link:hover { text-decoration:underline; }

        @media (max-width:768px) {
          .rp-left { display:none; }
          .rp-right { width:100%; padding:40px 24px; }
        }
      `}</style>

      <div className="rp-page">
        {/* LEFT */}
        <div className={`rp-left ${mounted ? "vis" : ""}`}>
          <div className="rp-glow1" /><div className="rp-glow2" />
          <a href="/" className="rp-back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("back") || "Back"}
          </a>
          <div className="rp-left-inner">
            <p className="rp-tag">AgroSewa</p>
            <h1 className="rp-heading">
              {t("register.leftHeading") || <>Grow with<br /><em>purpose.</em></>}
            </h1>
            <p className="rp-desc">{t("register.leftDesc") || "Join farmers and experts building smarter agriculture across Nepal."}</p>
            <div className="rp-plant-wrap"><GrowingPlant /></div>
            <div className="rp-feats">
              {[
                t("register.feat1") || "Smart soil testing & analysis",
                t("register.feat2") || "Certified expert network",
                t("register.feat3") || "Real-time crop recommendations",
              ].map((f) => (
                <div className="rp-feat" key={f}>
                  <div className="rp-feat-dot" />
                  <span className="rp-feat-txt">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`rp-right ${mounted ? "vis" : ""}`}>
          <div className="rp-form-card">
            <h2 className="rp-form-title">{t("createAccount")}</h2>
            <p className="rp-form-sub">{t("registerSubtitle")}</p>

            {error && (
              <div className="rp-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate>
              {/* Full Name */}
              <div className="rp-fld">
                <label className="rp-lbl">{t("fullName")}</label>
                <input type="text" placeholder={t("fullNamePlaceholder")} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inp("name")}
                  onFocus={() => setFocused({ ...focused, name: true })}
                  onBlur={() => setFocused({ ...focused, name: false })} />
              </div>

              {/* Email */}
              <div className="rp-fld">
                <label className="rp-lbl">{t("emailLabel")}</label>
                <div className="rp-e-wrap">
                  <input type="email" placeholder={t("emailPlaceholder")} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={inp("email")}
                    onFocus={() => setFocused({ ...focused, email: true })}
                    onBlur={() => setFocused({ ...focused, email: false })} />
                  {form.email && /\S+@\S+\.\S+/.test(form.email) && <span className="rp-e-chk">✓</span>}
                </div>
              </div>

              {/* Role */}
              <div className="rp-fld">
                <label className="rp-lbl">{t("registerAs")}</label>
                <div className="rp-role-grid">
                  {["farmer", "expert"].map((r) => (
                    <div key={r} className={`rp-role-card ${form.role === r ? "act" : ""}`} onClick={() => setForm({ ...form, role: r })}>
                      <span className="rp-role-icon">{r === "farmer" ? "🧑‍🌾" : "🔬"}</span>
                      <span className="rp-role-name">{r === "farmer" ? t("roleFarmer") : t("roleExpert")}</span>
                      {form.role === r && (
                        <div className="rp-role-chk">
                          <svg width="8" height="7" viewBox="0 0 10 8" fill="none" stroke="#fff" strokeWidth="2.4"><path d="M1 4l3 3 5-6" /></svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {form.role === "expert" && (
                  <div className="rp-expert-note">ℹ️&nbsp; {t("expertApprovalNote")}</div>
                )}
              </div>

              {/* Expert Fields */}
              {form.role === "expert" && (
                <div className="rp-exp-sec">
                  <div className="rp-exp-head">Expert Application</div>

                  {/* Certificate uploads */}
                  {[
                    { key: "educationCertificate", label: "Education Certificate", icon: "🎓", req: true },
                    { key: "governmentCertificate", label: "Gov / Lab Certificate", icon: "🏛️", req: false },
                    { key: "experienceCertificate", label: "Experience Certificate", icon: "📋", req: false },
                    { key: "idProof", label: "Citizenship / ID Proof", icon: "🪪", req: true },
                  ].map((f) => (
                    <div className="rp-fld" key={f.key}>
                      <label className="rp-lbl">{f.label}{f.req && <span style={{ color: "#dc2626" }}>&thinsp;*</span>}</label>
                      <label className="rp-file-up">
                        <span style={{ fontSize: 17 }}>{f.icon}</span>
                        <span className={`rp-file-name ${files[f.key] ? "ok" : ""}`}>{files[f.key] ? files[f.key].name : "Upload PDF or image"}</span>
                        <span className="rp-file-browse">Browse</span>
                        <input type="file" name={f.key} accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
                      </label>
                    </div>
                  ))}

                  {/* Contact Number */}
                  <div className="rp-fld">
                    <label className="rp-lbl">Contact Number <span style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="tel"
                      placeholder="Enter your contact number"
                      value={form.contactNumber}
                      onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                      style={inp("contactNumber")}
                      onFocus={() => setFocused({ ...focused, contactNumber: true })}
                      onBlur={() => setFocused({ ...focused, contactNumber: false })}
                    />
                  </div>

                  {/* Lab / Office Address */}
                  <div className="rp-fld" style={{ marginBottom: 4 }}>
                    <label className="rp-lbl">Lab / Office Address</label>
                    <input type="text" placeholder="Enter your lab or office address" value={form.labAddress}
                      onChange={(e) => setForm({ ...form, labAddress: e.target.value })}
                      style={inp("labAddress")}
                      onFocus={() => setFocused({ ...focused, labAddress: true })}
                      onBlur={() => setFocused({ ...focused, labAddress: false })} />
                  </div>
                </div>
              )}

              {/* Password */}
              <div className="rp-fld">
                <label className="rp-lbl">{t("password")}</label>
                <div className="rp-pw-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...inp("password"), paddingRight: 44 }}
                    onFocus={() => setFocused({ ...focused, password: true })}
                    onBlur={() => setFocused({ ...focused, password: false })}
                  />
                  <button type="button" className="rp-pw-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {form.password && (
                  <div className="rp-str-row">
                    <div className="rp-str-bars">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="rp-str-bar" style={{ background: pwStrength >= i ? strengthColor[pwStrength] : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: strengthColor[pwStrength] }}>{strengthLabel[pwStrength]}</span>
                  </div>
                )}
                <p className="rp-pw-hint">{t("passwordHint")}</p>
              </div>

              <button type="submit" className="rp-submit" disabled={loading}>
                {loading
                  ? <><span className="rp-spinner" />{t("registering")}</>
                  : <>{t("register")} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                }
              </button>
            </form>

            <div className="rp-divider">
              <span className="rp-div-line" /><span className="rp-div-txt">{t("orContinueWith")}</span><span className="rp-div-line" />
            </div>

            <button type="button" className="rp-g-btn" onClick={googleSignup}>
              <img src="/icons8-google.svg" alt="Google" style={{ width: 18, height: 18 }} onError={(e) => { e.target.style.display = "none"; }} />
              {t("signupGoogle")}
            </button>

            <p className="rp-login-row">
              {t("alreadyHaveAccount")}
              <Link to="/login" className="rp-login-link">{t("login")}</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;