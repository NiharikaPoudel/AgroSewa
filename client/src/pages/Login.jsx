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

/* ─── PLANT — keyframes use unique prefix "pa2__" ─── */
const GrowingPlant = () => (
  <svg
    viewBox="0 0 340 480"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%", display: "block" }}
    preserveAspectRatio="xMidYMid meet"
  >
    <style>{`
      .pa2-stem {
        stroke-dasharray: 330;
        stroke-dashoffset: 330;
        animation: pa2__grow 2.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards;
      }
      .pa2-root {
        stroke-dasharray: 200;
        stroke-dashoffset: 200;
        animation: pa2__grow 1.1s ease 0.1s forwards;
      }
      .pa2-soil { opacity:0; animation: pa2__fade 0.4s ease 0.1s forwards; }
      .pa2-ll1  { opacity:0; transform-origin:168px 342px; animation: pa2__leaf 0.55s ease 1.80s forwards; }
      .pa2-lr1  { opacity:0; transform-origin:170px 312px; animation: pa2__leaf 0.55s ease 2.15s forwards; }
      .pa2-ll2  { opacity:0; transform-origin:168px 272px; animation: pa2__leaf 0.55s ease 2.50s forwards; }
      .pa2-lr2  { opacity:0; transform-origin:170px 237px; animation: pa2__leaf 0.55s ease 2.85s forwards; }
      .pa2-ll3  { opacity:0; transform-origin:169px 177px; animation: pa2__leaf 0.55s ease 3.10s forwards; }
      .pa2-bloom {
        opacity:0; transform-origin:170px 90px; transform:scale(0);
        animation: pa2__bloom 0.5s cubic-bezier(0.34,1.56,0.64,1) 3.50s forwards;
      }
      .pa2-sp1 { opacity:0; animation: pa2__spark 1.3s ease 4.00s infinite; }
      .pa2-sp2 { opacity:0; animation: pa2__spark 1.3s ease 4.40s infinite; }
      .pa2-sp3 { opacity:0; animation: pa2__spark 1.3s ease 4.80s infinite; }

      @keyframes pa2__grow  { to { stroke-dashoffset: 0; } }
      @keyframes pa2__fade  { to { opacity: 1; } }
      @keyframes pa2__leaf  { from{opacity:0;transform:scale(0.55)} to{opacity:1;transform:scale(1)} }
      @keyframes pa2__bloom { from{opacity:0;transform:scale(0)}    to{opacity:1;transform:scale(1)} }
      @keyframes pa2__spark {
        0%,100% { opacity:0; transform:scale(0.5); }
        50%     { opacity:0.75; transform:scale(1.1); }
      }
    `}</style>

    <ellipse className="pa2-soil" cx="170" cy="422" rx="102" ry="14" fill="#a7f3d0" />
    <ellipse className="pa2-soil" cx="170" cy="422" rx="68"  ry="9"  fill="#6ee7b7" />

    <path className="pa2-root" d="M170 422 C159 432 143 437 132 429" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="pa2-root" d="M170 422 C181 433 198 437 208 431" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="pa2-root" d="M170 422 C164 440 156 447 148 441" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />

    <path className="pa2-stem"
      d="M170 420 C170 392 165 362 168 332 C171 302 166 270 170 240 C173 212 167 180 170 150 C173 126 168 110 170 90"
      stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />

    <g className="pa2-ll1">
      <path d="M168 342 C144 323 120 330 109 313 C128 305 151 314 168 329" fill="#22c55e" opacity="0.92" />
      <path d="M168 342 C147 333 136 319 109 313" stroke="#16a34a" strokeWidth="1" opacity="0.35" />
    </g>
    <g className="pa2-lr1">
      <path d="M170 312 C195 293 220 300 230 284 C211 276 189 285 170 300" fill="#4ade80" opacity="0.88" />
    </g>
    <g className="pa2-ll2">
      <path d="M168 272 C141 253 116 262 104 244 C125 236 150 246 168 260" fill="#16a34a" opacity="0.9" />
    </g>
    <g className="pa2-lr2">
      <path d="M170 237 C197 218 224 226 235 209 C215 201 191 211 170 224" fill="#86efac" opacity="0.84" />
    </g>
    <g className="pa2-ll3">
      <path d="M169 177 C147 160 126 166 116 150 C135 143 158 152 169 167" fill="#22c55e" opacity="0.8" />
    </g>

    <g className="pa2-bloom">
      {[0, 51.4, 102.8, 154.2, 205.7, 257.1, 308.5].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const px  = 170 + Math.cos(rad) * 14;
        const py  = 90  + Math.sin(rad) * 14;
        return (
          <ellipse key={i} cx={px} cy={py} rx="6.5" ry="4.5"
            fill={i % 2 === 0 ? "#fbbf24" : "#fde68a"} opacity="0.92"
            transform={`rotate(${deg} ${px} ${py})`} />
        );
      })}
      <circle cx="170" cy="90" r="8.5" fill="#f59e0b" />
      <circle cx="170" cy="90" r="4.5" fill="#fef3c7" />
    </g>

    <g className="pa2-sp1">
      <line x1="262" y1="138" x2="262" y2="150" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="256" y1="144" x2="268" y2="144" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="pa2-sp2">
      <line x1="86"  y1="198" x2="86"  y2="210" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="80"  y1="204" x2="92"  y2="204" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="pa2-sp3">
      <line x1="253" y1="278" x2="253" y2="288" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="248" y1="283" x2="258" y2="283" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

/* ═══════════════════════════════
   LOGIN
═══════════════════════════════ */
const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate    = useNavigate();
  const location    = useLocation();

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [showPw,  setShowPw]  = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const params      = new URLSearchParams(location.search);
    const token       = params.get("token");
    const name        = params.get("name");
    const role        = params.get("role");
    const googleError = params.get("error");
    if (token) {
      localStorage.setItem("token",    token);
      localStorage.setItem("userName", name || "User");
      localStorage.setItem("userRole", role || "farmer");
      window.dispatchEvent(new Event("userLoggedIn"));
      redirectByRole(role || "farmer");
    }
    if (googleError) setError(t("googleLoginError"));
  }, [location]);

  const redirectByRole = (role) => {
    if (role === "admin")  return navigate("/admin-dashboard",  { replace: true });
    if (role === "expert") return navigate("/expert-dashboard", { replace: true });
    navigate("/", { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) { setError(t("fillAllFields")); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email: form.email.trim(), password: form.password });
      if (!res.data.success) { setError(res.data.message || t("loginFailed")); return; }
      const { token, user } = res.data;
      localStorage.setItem("token",    token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      window.dispatchEvent(new Event("userLoggedIn"));
      redirectByRole(user.role);
    } catch { setError(t("loginFailed")); }
    finally   { setLoading(false); }
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/auth/google`;
  };

  const inp = (key) => ({
    width: "100%", padding: "13px 16px", fontSize: "15px", fontWeight: "400",
    border: `1.5px solid ${focused[key] ? "#16a34a" : "#d1d9e0"}`,
    borderRadius: "10px", outline: "none", color: "#0d1117", background: "#fff",
    fontFamily: "'Montserrat', sans-serif", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused[key] ? "0 0 0 3.5px rgba(22,163,74,.10)" : "none",
    letterSpacing: "0.01em",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* Lock the entire document — nothing scrolls */
        html, body, #root {
          height: 100%;
          overflow: hidden;
        }

        @keyframes lgn__fadeup { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lgn__spin   { to { transform: rotate(360deg); } }
        @keyframes lgn__shake  {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-4px)}
          40%,80%{transform:translateX(4px)}
        }
        @keyframes lgn__slidein { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }

        /* ── OUTER SHELL
           Exactly fills the locked viewport. No overflow whatsoever. */
        .lgn-page {
          position: fixed;
          inset: 0;                  /* top:0 right:0 bottom:0 left:0 */
          display: flex;
          font-family: 'Montserrat', sans-serif;
          background: #fff;
          overflow: hidden;          /* belt-and-suspenders */
        }

        /* ── LEFT PANEL
           Uses flex column internally. The plant-wrap is flex:1 so it
           stretches to fill whatever space is left after text + stats.
           No fixed heights anywhere — everything scales to the panel. */
        .lgn-left {
          width: 46%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 44px;
          position: relative;
          overflow: hidden;           /* hard clip — nothing escapes */
          background: linear-gradient(165deg, #064e29 0%, #0d4a23 30%, #0f5a2b 60%, #146a32 100%);
          border-right: 1px solid #0a3d20;
          opacity: 0;
          transition: opacity 0.85s ease;
          flex-shrink: 0;
        }
        .lgn-left.vis { opacity: 1; }

        .lgn-glow1 {
          position: absolute; pointer-events: none;
          width: 300px; height: 300px; border-radius: 50%;
          background: radial-gradient(circle, rgba(74,222,128,.12) 0%, transparent 70%);
          top: -60px; right: -70px;
        }
        .lgn-glow2 {
          position: absolute; pointer-events: none;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(34,197,94,.10) 0%, transparent 70%);
          bottom: 60px; left: -50px;
        }

        .lgn-back {
          position: absolute; top: 22px; left: 26px; z-index: 10;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 600; letter-spacing: .4px; text-transform: uppercase;
          color: rgba(255,255,255,.60); text-decoration: none;
          padding: 6px 12px;
          border: 1px solid rgba(255,255,255,.18); border-radius: 7px;
          background: rgba(255,255,255,.07); backdrop-filter: blur(6px);
          transition: all .18s ease;
        }
        .lgn-back:hover { color:#fff; border-color:rgba(255,255,255,.36); background:rgba(255,255,255,.14); transform:translateX(-2px); }

        /* Inner column — never taller than the panel */
        .lgn-left-inner {
          width: 100%; max-width: 290px;
          display: flex; flex-direction: column; align-items: center;
          position: relative; z-index: 2;
          /* Shrink everything proportionally if the viewport is short */
          max-height: 100%;
        }

        .lgn-tag {
          font-size: 9.5px; font-weight: 700; letter-spacing: 3.5px;
          text-transform: uppercase; color: #4ade80;
          margin-bottom: 8px; text-align: center; flex-shrink: 0;
        }
        .lgn-heading {
          font-size: clamp(18px, 1.9vw, 26px); font-weight: 800;
          line-height: 1.22; letter-spacing: -.5px;
          color: #fff; text-align: center;
          margin-bottom: 8px; flex-shrink: 0;
        }
        .lgn-heading em { font-style: italic; color: #86efac; font-weight: 700; }
        .lgn-desc {
          font-size: 12px; color: rgba(255,255,255,.52);
          text-align: center; line-height: 1.7; font-weight: 400;
          margin-bottom: 12px; flex-shrink: 0;
        }

        /* Plant fills remaining vertical space — key fix */
        .lgn-plant-wrap {
          flex: 1;
          width: 100%;
          min-height: 0;       /* allows flex child to shrink below content size */
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px 0;
        }

        .lgn-stats {
          display: flex; gap: 20px; align-items: center;
          justify-content: center; width: 100%;
          padding-top: 14px; margin-top: 4px;
          border-top: 1px solid rgba(255,255,255,.14);
          flex-shrink: 0;
        }
        .lgn-stat     { text-align: center; }
        .lgn-stat-num { font-size: 18px; font-weight: 800; color: #fff; line-height: 1; letter-spacing: -.4px; }
        .lgn-stat-lbl { font-size: 9px; color: rgba(255,255,255,.40); margin-top: 3px; letter-spacing: 1px; text-transform: uppercase; font-weight: 600; }
        .lgn-stat-sep { width: 1px; height: 26px; background: rgba(255,255,255,.14); }

        /* ── RIGHT PANEL
           flex:1. Scrolls internally only if form somehow overflows
           (e.g. error banner + very short screen). */
        .lgn-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 56px;
          background: #fff;
          overflow-y: auto;
          overflow-x: hidden;
          opacity: 0;
          animation: lgn__slidein 0.6s ease 0.2s forwards;
        }
        .lgn-right.vis { opacity: 1; }

        .lgn-form-card {
          width: 100%; max-width: 400px;
          animation: lgn__fadeup .5s ease .38s both;
        }

        .lgn-form-title {
          font-size: 34px; font-weight: 800; color: #0a1628;
          margin-bottom: 6px; letter-spacing: -.8px; line-height: 1.1;
        }
        .lgn-form-sub {
          font-size: 15px; color: #64748b;
          margin-bottom: 30px; font-weight: 400; line-height: 1.65;
        }

        .lgn-err {
          display: flex; align-items: center; gap: 9px;
          padding: 11px 14px;
          background: #fff5f5; border: 1.5px solid #fecaca; border-radius: 10px;
          color: #dc2626; font-size: 13.5px; font-weight: 600;
          margin-bottom: 20px;
          animation: lgn__shake .35s ease;
        }

        .lgn-fld  { margin-bottom: 19px; }
        .lgn-lbl  {
          display: block; font-size: 12px; font-weight: 700;
          color: #1a2332; margin-bottom: 7px;
          letter-spacing: .8px; text-transform: uppercase;
        }

        .lgn-pw-row   { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
        .lgn-forgot   { font-size: 12.5px; font-weight: 600; color: #16a34a; text-decoration: none; transition: color .15s; }
        .lgn-forgot:hover { color: #15803d; text-decoration: underline; }

        .lgn-pw-wrap  { position: relative; }
        .lgn-eye-btn  {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #94a3b8; display: flex; align-items: center;
          transition: color .15s; padding: 3px;
        }
        .lgn-eye-btn:hover { color: #475569; }

        .lgn-email-wrap { position: relative; }
        .lgn-email-chk  {
          position: absolute; right: 13px; top: 50%; transform: translateY(-50%);
          color: #16a34a; font-weight: 700; font-size: 15px; pointer-events: none;
        }

        .lgn-submit {
          width: 100%; padding: 13.5px;
          font-size: 14.5px; font-weight: 700; letter-spacing: .4px; text-transform: uppercase;
          color: #fff; background: #15803d;
          border: none; border-radius: 10px; cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 9px;
          transition: all .2s ease; margin-top: 4px; margin-bottom: 18px;
        }
        .lgn-submit:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); box-shadow:0 8px 22px rgba(22,163,74,.26); }
        .lgn-submit:disabled { opacity:.65; cursor:not-allowed; }
        .lgn-spinner {
          width: 15px; height: 15px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,.3); border-top-color: #fff;
          border-radius: 50%; animation: lgn__spin .65s linear infinite;
        }

        .lgn-divider   { display: flex; align-items: center; gap: 12px; margin: 2px 0 14px; }
        .lgn-div-line  { flex: 1; height: 1px; background: #eff2f5; }
        .lgn-div-txt   { font-size: 11px; color: #c5cdd6; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; }

        .lgn-google {
          width: 100%; padding: 12.5px 16px;
          font-size: 14.5px; font-weight: 600; letter-spacing: .1px;
          color: #374151; background: #fff;
          border: 1.5px solid #d1d9e0; border-radius: 10px; cursor: pointer;
          font-family: 'Montserrat', sans-serif;
          display: flex; align-items: center; justify-content: center; gap: 11px;
          transition: all .18s ease; margin-bottom: 26px;
        }
        .lgn-google:hover { border-color:#86efac; background:#f4fef6; color:#111827; }

        .lgn-reg-row  { text-align: center; font-size: 14px; color: #64748b; font-weight: 500; }
        .lgn-reg-link { color: #16a34a; font-weight: 700; text-decoration: none; margin-left: 5px; }
        .lgn-reg-link:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          html, body, #root { height: auto; overflow: auto; }
          .lgn-page  { position: relative; inset: unset; min-height: 100vh; flex-direction: column; }
          .lgn-left  { display: none; }
          .lgn-right { width: 100%; padding: 48px 24px; }
        }
      `}</style>

      <div className="lgn-page">

        {/* ── LEFT ── */}
        <div className={`lgn-left ${mounted ? "vis" : ""}`}>
          <div className="lgn-glow1" />
          <div className="lgn-glow2" />

          <a href="/" className="lgn-back">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("back") || "Back"}
          </a>

          <div className="lgn-left-inner">
            <p className="lgn-tag">AgroSewa</p>
            <h1 className="lgn-heading">
              {t("login.leftHeading") || <>Where soil<br />meets <em>science.</em></>}
            </h1>
            <p className="lgn-desc">
              {t("login.leftDesc") || "Connect with certified experts, test your soil, and grow smarter."}
            </p>

            <div className="lgn-plant-wrap">
              <GrowingPlant />
            </div>

            <div className="lgn-stats">
              <div className="lgn-stat">
                <div className="lgn-stat-num">{t("stat1Number") || "5000+"}</div>
                <div className="lgn-stat-lbl">{t("stat1Label")  || "Farmers"}</div>
              </div>
              <div className="lgn-stat-sep" />
              <div className="lgn-stat">
                <div className="lgn-stat-num">{t("stat2Number") || "50K+"}</div>
                <div className="lgn-stat-lbl">{t("stat2Label")  || "Acres"}</div>
              </div>
              <div className="lgn-stat-sep" />
              <div className="lgn-stat">
                <div className="lgn-stat-num">{t("stat3Number") || "98%"}</div>
                <div className="lgn-stat-lbl">{t("stat3Label")  || "Satisfied"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className={`lgn-right ${mounted ? "vis" : ""}`}>
          <div className="lgn-form-card">

            <h2 className="lgn-form-title">{t("login.helloAgain") || "Hello Again"}</h2>
            <p  className="lgn-form-sub">{t("login.welcome") || "Welcome back! Sign in to continue."}</p>

            {error && (
              <div className="lgn-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{flexShrink:0}}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate>
              <div className="lgn-fld">
                <label className="lgn-lbl">{t("emailLabel")}</label>
                <div className="lgn-email-wrap">
                  <input type="email" placeholder={t("emailPlaceholder")} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={inp("email")}
                    onFocus={() => setFocused({ ...focused, email: true })}
                    onBlur={() => setFocused({ ...focused, email: false })} />
                  {form.email && /\S+@\S+\.\S+/.test(form.email) && (
                    <span className="lgn-email-chk">&#10003;</span>
                  )}
                </div>
              </div>

              <div className="lgn-fld">
                <div className="lgn-pw-row">
                  <label className="lgn-lbl" style={{ margin: 0 }}>{t("password")}</label>
                  <Link to="/forgot-password" className="lgn-forgot">{t("forgotPassword")}</Link>
                </div>
                <div className="lgn-pw-wrap">
                  <input type={showPw ? "text" : "password"}
                    placeholder="&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;&#8226;"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...inp("password"), paddingRight: 44 }}
                    onFocus={() => setFocused({ ...focused, password: true })}
                    onBlur={() => setFocused({ ...focused, password: false })} />
                  <button type="button" className="lgn-eye-btn" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lgn-submit" disabled={loading}>
                {loading ? (
                  <><span className="lgn-spinner" />{t("login.loggingIn") || "Logging in..."}</>
                ) : (
                  <>{t("login")}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                )}
              </button>
            </form>

            <div className="lgn-divider">
              <span className="lgn-div-line" /><span className="lgn-div-txt">{t("orContinueWith")}</span><span className="lgn-div-line" />
            </div>

            <button type="button" className="lgn-google" onClick={googleLogin}>
              <img src="/icons8-google.svg" alt="Google" style={{ width: 18, height: 18 }}
                onError={(e) => { e.target.style.display = "none"; }} />
              {t("loginGoogle")}
            </button>

            <p className="lgn-reg-row">
              {t("noAccount")}
              <Link to="/register" className="lgn-reg-link">{t("signUp") || t("register")}</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
};

export default Login;