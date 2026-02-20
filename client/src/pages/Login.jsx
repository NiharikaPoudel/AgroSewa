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

/* ── Growing Plant Animation ── */
const GrowingPlant = () => (
  <svg viewBox="0 0 340 480" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", maxWidth: "260px" }}>
    <style>{`
      .lp-stem {
        stroke-dasharray: 330;
        stroke-dashoffset: 330;
        animation: lpGrow 2.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards;
      }
      .lp-ll1 { opacity:0; animation:lpLeaf .55s ease 1.8s forwards; }
      .lp-lr1 { opacity:0; animation:lpLeaf .55s ease 2.15s forwards; }
      .lp-ll2 { opacity:0; animation:lpLeaf .55s ease 2.5s forwards; }
      .lp-lr2 { opacity:0; animation:lpLeaf .55s ease 2.85s forwards; }
      .lp-ll3 { opacity:0; animation:lpLeaf .55s ease 3.1s forwards; }
      .lp-bloom {
        opacity:0; transform-origin:170px 90px; transform:scale(0);
        animation:lpBloom .5s cubic-bezier(0.34,1.56,0.64,1) 3.5s forwards;
      }
      .lp-root { stroke-dasharray:200; stroke-dashoffset:200; animation:lpGrow 1.1s ease .1s forwards; }
      .lp-soil { opacity:0; animation:lpLeaf .4s ease .1s forwards; }
      .lp-sp1 { opacity:0; animation:lpSpark 1.3s ease 4s infinite; }
      .lp-sp2 { opacity:0; animation:lpSpark 1.3s ease 4.4s infinite; }
      .lp-sp3 { opacity:0; animation:lpSpark 1.3s ease 4.8s infinite; }
      @keyframes lpGrow  { to { stroke-dashoffset: 0; } }
      @keyframes lpLeaf  { from{opacity:0;transform:scale(0.55)} to{opacity:1;transform:scale(1)} }
      @keyframes lpBloom { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
      @keyframes lpSpark { 0%,100%{opacity:0;transform:scale(.5)} 50%{opacity:.75;transform:scale(1.1)} }
    `}</style>
    <ellipse className="lp-soil" cx="170" cy="422" rx="102" ry="14" fill="#a7f3d0" />
    <ellipse className="lp-soil" cx="170" cy="422" rx="68" ry="9" fill="#6ee7b7" />
    <path className="lp-root" d="M170 422 C159 432 143 437 132 429" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="lp-root" d="M170 422 C181 433 198 437 208 431" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="lp-root" d="M170 422 C164 440 156 447 148 441" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />
    <path className="lp-stem"
      d="M170 420 C170 392 165 362 168 332 C171 302 166 270 170 240 C173 212 167 180 170 150 C173 126 168 110 170 90"
      stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
    <g className="lp-ll1" style={{ transformOrigin: "168px 342px" }}>
      <path d="M168 342 C144 323 120 330 109 313 C128 305 151 314 168 329" fill="#22c55e" opacity="0.92" />
      <path d="M168 342 C147 333 136 319 109 313" stroke="#16a34a" strokeWidth="1" opacity="0.35" />
    </g>
    <g className="lp-lr1" style={{ transformOrigin: "170px 312px" }}>
      <path d="M170 312 C195 293 220 300 230 284 C211 276 189 285 170 300" fill="#4ade80" opacity="0.88" />
    </g>
    <g className="lp-ll2" style={{ transformOrigin: "168px 272px" }}>
      <path d="M168 272 C141 253 116 262 104 244 C125 236 150 246 168 260" fill="#16a34a" opacity="0.9" />
    </g>
    <g className="lp-lr2" style={{ transformOrigin: "170px 237px" }}>
      <path d="M170 237 C197 218 224 226 235 209 C215 201 191 211 170 224" fill="#86efac" opacity="0.84" />
    </g>
    <g className="lp-ll3" style={{ transformOrigin: "169px 177px" }}>
      <path d="M169 177 C147 160 126 166 116 150 C135 143 158 152 169 167" fill="#22c55e" opacity="0.8" />
    </g>
    <g className="lp-bloom">
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
    <g className="lp-sp1">
      <line x1="262" y1="138" x2="262" y2="150" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="256" y1="144" x2="268" y2="144" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="lp-sp2">
      <line x1="86" y1="198" x2="86" y2="210" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="80" y1="204" x2="92" y2="204" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" />
    </g>
    <g className="lp-sp3">
      <line x1="253" y1="278" x2="253" y2="288" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="248" y1="283" x2="258" y2="283" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

const Login = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const role = params.get("role");
    const googleError = params.get("error");
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name || "User");
      localStorage.setItem("userRole", role || "farmer");
      window.dispatchEvent(new Event("userLoggedIn"));
      redirectByRole(role || "farmer");
    }
    if (googleError) setError(t("googleLoginError"));
  }, [location]);

  const redirectByRole = (role) => {
    if (role === "admin") return navigate("/admin-dashboard", { replace: true });
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
      localStorage.setItem("token", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);
      window.dispatchEvent(new Event("userLoggedIn"));
      redirectByRole(user.role);
    } catch { setError(t("loginFailed")); }
    finally { setLoading(false); }
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/auth/google`;
  };

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

        @keyframes lpFadeUp  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes lpSlideR  { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes lpSpin    { to{transform:rotate(360deg)} }
        @keyframes lpShake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }

        .lp-page { min-height:100vh; display:flex; font-family:'Montserrat',sans-serif; background:#fff; }

        /* ── LEFT ── */
        .lp-left {
          width:46%; min-height:100vh;
          background: linear-gradient(165deg, #064e29 0%, #0d4a23 30%, #0f5a2b 60%, #146a32 100%);
          border-right: 1px solid #0a3d20;
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; padding:52px 50px;
          position:sticky; top:0; align-self:flex-start; overflow:hidden;
          opacity:0; transition:opacity .85s ease;
        }
        .lp-left.vis { opacity:1; }
        .lp-left-inner { width:100%; max-width:310px; display:flex; flex-direction:column; align-items:center; position:relative; z-index:2; }

        /* Subtle decorative glow */
        .lp-glow1 { position:absolute; width:320px; height:320px; border-radius:50%; background:radial-gradient(circle,rgba(74,222,128,.12) 0%,transparent 70%); top:-60px; right:-80px; pointer-events:none; }
        .lp-glow2 { position:absolute; width:220px; height:220px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,.10) 0%,transparent 70%); bottom:60px; left:-50px; pointer-events:none; }

        .lp-back {
          position:absolute; top:28px; left:32px;
          display:inline-flex; align-items:center; gap:6px;
          font-size:12px; font-weight:600; color:rgba(255,255,255,.65);
          text-decoration:none; font-family:'Montserrat',sans-serif;
          padding:7px 14px; border:1px solid rgba(255,255,255,.18);
          border-radius:7px; background:rgba(255,255,255,.07);
          backdrop-filter:blur(6px);
          transition:all .18s ease; letter-spacing:.4px; text-transform:uppercase;
        }
        .lp-back:hover { color:#fff; border-color:rgba(255,255,255,.36); background:rgba(255,255,255,.14); transform:translateX(-2px); }

        .lp-tag {
          font-size:10px; font-weight:700; letter-spacing:3.5px; text-transform:uppercase;
          color:#4ade80; margin-bottom:14px; text-align:center;
        }
        .lp-heading {
          font-family:'Montserrat',sans-serif;
          font-size:clamp(26px,2.6vw,36px); line-height:1.2;
          color:#fff; text-align:center; font-weight:800;
          margin-bottom:14px; letter-spacing:-.6px;
        }
        .lp-heading em { font-style:italic; color:#86efac; font-weight:700; }
        .lp-desc { font-size:13px; color:rgba(255,255,255,.58); text-align:center; line-height:1.75; font-weight:400; margin-bottom:28px; letter-spacing:.1px; }

        .lp-plant-wrap { display:flex; justify-content:center; width:100%; margin-bottom:22px; }

        .lp-stats { display:flex; gap:24px; align-items:center; padding-top:18px; border-top:1px solid rgba(255,255,255,.14); width:100%; justify-content:center; }
        .lp-stat-item { text-align:center; }
        .lp-stat-num { font-size:22px; font-weight:800; color:#fff; line-height:1; letter-spacing:-.5px; }
        .lp-stat-lbl { font-size:10px; color:rgba(255,255,255,.45); margin-top:4px; letter-spacing:1px; text-transform:uppercase; font-weight:600; }
        .lp-stat-sep { width:1px; height:30px; background:rgba(255,255,255,.16); }

        /* ── RIGHT ── */
        .lp-right {
          flex:1; display:flex; align-items:center; justify-content:center;
          padding:64px 60px; background:#fff; overflow-y:auto;
          opacity:0; transform:translateX(26px);
          transition:opacity .7s ease .22s, transform .7s ease .22s;
        }
        .lp-right.vis { opacity:1; transform:translateX(0); }

        .lp-form-card { width:100%; max-width:390px; animation:lpFadeUp .55s ease .42s both; }

        .lp-form-title {
          font-family:'Montserrat',sans-serif;
          font-size:32px; font-weight:800; color:#0d1f0e;
          margin-bottom:7px; letter-spacing:-.8px; line-height:1.1;
        }
        .lp-form-sub { font-size:14px; color:#64748b; margin-bottom:34px; font-weight:400; line-height:1.65; letter-spacing:.01em; }

        .lp-err {
          display:flex; align-items:center; gap:9px; padding:12px 15px;
          background:#fff5f5; border:1.5px solid #fecaca; border-radius:10px;
          color:#dc2626; font-size:13px; font-weight:600; margin-bottom:22px;
          animation:lpShake .35s ease; letter-spacing:.01em;
        }

        .lp-fld { margin-bottom:20px; }
        .lp-lbl { display:block; font-size:11.5px; font-weight:700; color:#1e293b; margin-bottom:8px; letter-spacing:.8px; text-transform:uppercase; }
        .lp-pw-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
        .lp-forgot { font-size:12px; font-weight:600; color:#16a34a; text-decoration:none; letter-spacing:.2px; transition:color .15s; }
        .lp-forgot:hover { color:#15803d; text-decoration:underline; }

        .lp-pw-wrap { position:relative; }
        .lp-pw-eye  { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; transition:color .15s; padding:3px; }
        .lp-pw-eye:hover { color:#475569; }

        .lp-e-wrap { position:relative; }
        .lp-e-chk  { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:#16a34a; font-weight:700; font-size:15px; pointer-events:none; }

        .lp-submit {
          width:100%; padding:14px; font-size:14.5px; font-weight:700;
          color:#fff; background:#16a34a; border:none; border-radius:10px;
          cursor:pointer; font-family:'Montserrat',sans-serif;
          transition:all .2s ease; margin-bottom:20px; margin-top:6px;
          display:flex; align-items:center; justify-content:center; gap:9px;
          letter-spacing:.3px; text-transform:uppercase;
        }
        .lp-submit:hover:not(:disabled) { background:#15803d; transform:translateY(-1px); box-shadow:0 8px 22px rgba(22,163,74,.26); }
        .lp-submit:disabled { opacity:.65; cursor:not-allowed; }
        .lp-spinner { width:15px; height:15px; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:lpSpin .65s linear infinite; }

        .lp-divider { display:flex; align-items:center; gap:13px; margin:4px 0 16px; }
        .lp-div-line { flex:1; height:1px; background:#eff2f5; }
        .lp-div-txt  { font-size:11.5px; color:#c5cdd6; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }

        .lp-g-btn {
          width:100%; padding:13px 16px; font-size:14px; font-weight:600;
          color:#374151; background:#fff; border:1.5px solid #d1d9e0; border-radius:10px;
          cursor:pointer; font-family:'Montserrat',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:11px;
          transition:all .18s ease; margin-bottom:28px; letter-spacing:.1px;
        }
        .lp-g-btn:hover { border-color:#86efac; background:#f4fef6; color:#111827; }

        .lp-reg-row  { text-align:center; font-size:13.5px; color:#64748b; font-weight:500; }
        .lp-reg-link { color:#16a34a; font-weight:700; text-decoration:none; margin-left:5px; letter-spacing:.1px; }
        .lp-reg-link:hover { text-decoration:underline; }

        @media (max-width:768px) {
          .lp-left { display:none; }
          .lp-right { width:100%; padding:48px 24px; }
        }
      `}</style>

      <div className="lp-page">
        {/* LEFT */}
        <div className={`lp-left ${mounted ? "vis" : ""}`}>
          <div className="lp-glow1" /><div className="lp-glow2" />
          <a href="/" className="lp-back">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("back") || "Back"}
          </a>
          <div className="lp-left-inner">
            <p className="lp-tag">AgroSewa</p>
            <h1 className="lp-heading">
              {t("login.leftHeading") || <>Where soil<br />meets <em>science.</em></>}
            </h1>
            <p className="lp-desc">{t("login.leftDesc") || "Connect with certified experts, test your soil, and grow smarter."}</p>
            <div className="lp-plant-wrap"><GrowingPlant /></div>
            <div className="lp-stats">
              <div className="lp-stat-item">
                <div className="lp-stat-num">{t("stat1Number") || "5000+"}</div>
                <div className="lp-stat-lbl">{t("stat1Label") || "Farmers"}</div>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-item">
                <div className="lp-stat-num">{t("stat2Number") || "50K+"}</div>
                <div className="lp-stat-lbl">{t("stat2Label") || "Acres"}</div>
              </div>
              <div className="lp-stat-sep" />
              <div className="lp-stat-item">
                <div className="lp-stat-num">{t("stat3Number") || "98%"}</div>
                <div className="lp-stat-lbl">{t("stat3Label") || "Satisfied"}</div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={`lp-right ${mounted ? "vis" : ""}`}>
          <div className="lp-form-card">
            <h2 className="lp-form-title">{t("login.helloAgain") || "Hello Again"}</h2>
            <p className="lp-form-sub">{t("login.welcome") || "Welcome back! Sign in to continue."}</p>

            {error && (
              <div className="lp-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate>
              <div className="lp-fld">
                <label className="lp-lbl">{t("emailLabel")}</label>
                <div className="lp-e-wrap">
                  <input type="email" placeholder={t("emailPlaceholder")} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    style={inp("email")}
                    onFocus={() => setFocused({ ...focused, email: true })}
                    onBlur={() => setFocused({ ...focused, email: false })} />
                  {form.email && /\S+@\S+\.\S+/.test(form.email) && <span className="lp-e-chk">✓</span>}
                </div>
              </div>

              <div className="lp-fld">
                <div className="lp-pw-row">
                  <label className="lp-lbl" style={{ margin: 0 }}>{t("password")}</label>
                  <Link to="/forgot-password" className="lp-forgot">{t("forgotPassword")}</Link>
                </div>
                <div className="lp-pw-wrap">
                  <input type={showPw ? "text" : "password"} placeholder="••••••••••••" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...inp("password"), paddingRight: 44 }}
                    onFocus={() => setFocused({ ...focused, password: true })}
                    onBlur={() => setFocused({ ...focused, password: false })} />
                  <button type="button" className="lp-pw-eye" onClick={() => setShowPw(!showPw)} tabIndex={-1}>
                    {showPw ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>

              <button type="submit" className="lp-submit" disabled={loading}>
                {loading
                  ? <><span className="lp-spinner" />{t("login.loggingIn") || "Logging in..."}</>
                  : <>{t("login")} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>
                }
              </button>
            </form>

            <div className="lp-divider">
              <span className="lp-div-line" /><span className="lp-div-txt">{t("orContinueWith")}</span><span className="lp-div-line" />
            </div>

            <button type="button" className="lp-g-btn" onClick={googleLogin}>
              <img src="/icons8-google.svg" alt="Google" style={{ width: 18, height: 18 }} onError={(e) => { e.target.style.display = "none"; }} />
              {t("loginGoogle")}
            </button>

            <p className="lp-reg-row">
              {t("noAccount")}
              <Link to="/register" className="lp-reg-link">{t("signUp") || t("register")}</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;