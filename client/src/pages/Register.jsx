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

/* Role Icons */
const FarmerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 7c0 4.4-3.6 8-8 8S4 11.4 4 7c0 0 4-4 8-4s8 4 8 4z" />
    <path d="M12 15v6" />
    <path d="M8 21h8" />
    <path d="M6 10c-1.5 1-2 2.5-2 4h16c0-1.5-.5-3-2-4" />
  </svg>
);

const ExpertIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="15" y2="17" />
  </svg>
);

const IdIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <circle cx="8" cy="12" r="2" />
    <path d="M14 9h4M14 12h4M14 15h2" />
  </svg>
);

const PhotoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

/* ─── PLANT ─── */
const GrowingPlant = () => (
  <svg viewBox="0 0 340 480" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={{ width: "100%", height: "100%", display: "block" }} preserveAspectRatio="xMidYMid meet">
    <style>{`
      .rp2-stem { stroke-dasharray:330; stroke-dashoffset:330; animation:rp2__grow 2.6s cubic-bezier(0.4,0,0.2,1) 0.4s forwards; }
      .rp2-root { stroke-dasharray:200; stroke-dashoffset:200; animation:rp2__grow 1.1s ease 0.1s forwards; }
      .rp2-soil { opacity:0; animation:rp2__fade 0.4s ease 0.1s forwards; }
      .rp2-ll1 { opacity:0; transform-origin:168px 342px; animation:rp2__leaf 0.55s ease 1.80s forwards; }
      .rp2-lr1 { opacity:0; transform-origin:170px 312px; animation:rp2__leaf 0.55s ease 2.15s forwards; }
      .rp2-ll2 { opacity:0; transform-origin:168px 272px; animation:rp2__leaf 0.55s ease 2.50s forwards; }
      .rp2-lr2 { opacity:0; transform-origin:170px 237px; animation:rp2__leaf 0.55s ease 2.85s forwards; }
      .rp2-ll3 { opacity:0; transform-origin:169px 177px; animation:rp2__leaf 0.55s ease 3.10s forwards; }
      .rp2-bloom { opacity:0; transform-origin:170px 90px; transform:scale(0); animation:rp2__bloom 0.5s cubic-bezier(0.34,1.56,0.64,1) 3.50s forwards; }
      .rp2-sp1 { opacity:0; animation:rp2__spark 1.3s ease 4.00s infinite; }
      .rp2-sp2 { opacity:0; animation:rp2__spark 1.3s ease 4.40s infinite; }
      .rp2-sp3 { opacity:0; animation:rp2__spark 1.3s ease 4.80s infinite; }
      @keyframes rp2__grow  { to { stroke-dashoffset: 0; } }
      @keyframes rp2__fade  { to { opacity: 1; } }
      @keyframes rp2__leaf  { from{opacity:0;transform:scale(0.55)} to{opacity:1;transform:scale(1)} }
      @keyframes rp2__bloom { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
      @keyframes rp2__spark { 0%,100%{opacity:0;transform:scale(0.5)} 50%{opacity:0.75;transform:scale(1.1)} }
    `}</style>
    <ellipse className="rp2-soil" cx="170" cy="422" rx="102" ry="14" fill="#a7f3d0" />
    <ellipse className="rp2-soil" cx="170" cy="422" rx="68" ry="9" fill="#6ee7b7" />
    <path className="rp2-root" d="M170 422 C159 432 143 437 132 429" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="rp2-root" d="M170 422 C181 433 198 437 208 431" stroke="#6ee7b7" strokeWidth="2.2" strokeLinecap="round" />
    <path className="rp2-root" d="M170 422 C164 440 156 447 148 441" stroke="#a7f3d0" strokeWidth="1.6" strokeLinecap="round" />
    <path className="rp2-stem" d="M170 420 C170 392 165 362 168 332 C171 302 166 270 170 240 C173 212 167 180 170 150 C173 126 168 110 170 90" stroke="#15803d" strokeWidth="4.5" strokeLinecap="round" />
    <g className="rp2-ll1"><path d="M168 342 C144 323 120 330 109 313 C128 305 151 314 168 329" fill="#22c55e" opacity="0.92" /></g>
    <g className="rp2-lr1"><path d="M170 312 C195 293 220 300 230 284 C211 276 189 285 170 300" fill="#4ade80" opacity="0.88" /></g>
    <g className="rp2-ll2"><path d="M168 272 C141 253 116 262 104 244 C125 236 150 246 168 260" fill="#16a34a" opacity="0.9" /></g>
    <g className="rp2-lr2"><path d="M170 237 C197 218 224 226 235 209 C215 201 191 211 170 224" fill="#86efac" opacity="0.84" /></g>
    <g className="rp2-ll3"><path d="M169 177 C147 160 126 166 116 150 C135 143 158 152 169 167" fill="#22c55e" opacity="0.8" /></g>
    <g className="rp2-bloom">
      {[0,51.4,102.8,154.2,205.7,257.1,308.5].map((deg,i)=>{
        const rad=(deg*Math.PI)/180; const px=170+Math.cos(rad)*14; const py=90+Math.sin(rad)*14;
        return <ellipse key={i} cx={px} cy={py} rx="6.5" ry="4.5" fill={i%2===0?"#fbbf24":"#fde68a"} opacity="0.92" transform={`rotate(${deg} ${px} ${py})`} />;
      })}
      <circle cx="170" cy="90" r="8.5" fill="#f59e0b" />
      <circle cx="170" cy="90" r="4.5" fill="#fef3c7" />
    </g>
    <g className="rp2-sp1"><line x1="262" y1="138" x2="262" y2="150" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /><line x1="256" y1="144" x2="268" y2="144" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /></g>
    <g className="rp2-sp2"><line x1="86" y1="198" x2="86" y2="210" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" /><line x1="80" y1="204" x2="92" y2="204" stroke="#4ade80" strokeWidth="1.8" strokeLinecap="round" /></g>
    <g className="rp2-sp3"><line x1="253" y1="278" x2="253" y2="288" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /><line x1="248" y1="283" x2="258" y2="283" stroke="#86efac" strokeWidth="1.8" strokeLinecap="round" /></g>
  </svg>
);

/* ── Municipality data (same as BookSoilTest) ── */
const municipalities = [
  { name: "Kathmandu Metropolitan",  nameNe: "काठमाडौं महानगरपालिका",   wards: Array.from({ length: 32 }, (_, i) => i + 1) },
  { name: "Kirtipur",                nameNe: "कीर्तिपुर नगरपालिका",      wards: Array.from({ length: 10 }, (_, i) => i + 1) },
  { name: "Budanilkantha",           nameNe: "बुढानीलकण्ठ नगरपालिका",   wards: Array.from({ length: 13 }, (_, i) => i + 1) },
  { name: "Tarakeshwar",             nameNe: "तारकेश्वर नगरपालिका",      wards: Array.from({ length: 11 }, (_, i) => i + 1) },
  { name: "Lalitpur Metropolitan",   nameNe: "ललितपुर महानगरपालिका",     wards: Array.from({ length: 29 }, (_, i) => i + 1) },
  { name: "Godawari",                nameNe: "गोदावरी नगरपालिका",        wards: Array.from({ length: 14 }, (_, i) => i + 1) },
  { name: "Mahalaxmi",               nameNe: "महालक्ष्मी नगरपालिका",    wards: Array.from({ length: 10 }, (_, i) => i + 1) },
  { name: "Bhaktapur Municipality",  nameNe: "भक्तपुर नगरपालिका",       wards: Array.from({ length: 10 }, (_, i) => i + 1) },
  { name: "Madhyapur Thimi",         nameNe: "मध्यपुर थिमी नगरपालिका",  wards: Array.from({ length: 9  }, (_, i) => i + 1) },
  { name: "Pokhara Metropolitan",    nameNe: "पोखरा महानगरपालिका",       wards: Array.from({ length: 33 }, (_, i) => i + 1) },
  { name: "Butwal Sub-Metropolitan", nameNe: "बुटवल उपमहानगरपालिका",    wards: Array.from({ length: 19 }, (_, i) => i + 1) },
  { name: "Siddharthanagar",         nameNe: "सिद्धार्थनगर नगरपालिका",  wards: Array.from({ length: 14 }, (_, i) => i + 1) },
];

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "farmer",
    contactNumber: "",
    // Expert-specific
    labName: "",
    labMunicipality: "",
    labWard: "",
    experienceYears: "",
  });

  const [files, setFiles] = useState({
    profilePhoto:    null,
    labCertificate:  null,
    idProof:         null,
  });

  // Live preview URL for profile photo
  const [photoPreview, setPhotoPreview] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focused, setFocused] = useState({});

  useEffect(() => {
    setTimeout(() => setMounted(true), 60);
    const params      = new URLSearchParams(location.search);
    const token       = params.get("token");
    const name        = params.get("name");
    const googleError = params.get("error");
    if (token) {
      localStorage.setItem("token",    token);
      localStorage.setItem("userName", name || "User");
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/", { replace: true });
    }
    if (googleError) setError(t("googleError"));
  }, [location, navigate]);

  // Reset ward when municipality changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, labWard: "" }));
  }, [form.labMunicipality]);

  // Clean up photo preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const getWards = () => {
    const mun = municipalities.find((m) => m.name === form.labMunicipality);
    return mun ? mun.wards : [];
  };

  const validatePassword = (pw) => {
    if (!/.{8,}/.test(pw))      return t("passwordMinLength");
    if (!/[A-Z]/.test(pw))      return t("passwordUpperCase");
    if (!/[a-z]/.test(pw))      return t("passwordLowerCase");
    if (!/[0-9]/.test(pw))      return t("passwordNumber");
    if (!/[!@#$%^&*]/.test(pw)) return t("passwordSpecialChar");
    return null;
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    const name = e.target.name;
    setFiles((prev) => ({ ...prev, [name]: file }));

    // Generate live preview for profile photo
    if (name === "profilePhoto" && file) {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError(t("fillAllFields")); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t("invalidEmail")); return;
    }
    const pwError = validatePassword(form.password);
    if (pwError) { setError(pwError); return; }

    // ── Expert validation ──────────────────────────────────────────
    if (form.role === "expert") {
      if (!form.contactNumber.trim())  { setError("Contact number is required."); return; }
      if (!form.labName.trim())        { setError("Lab / Office name is required."); return; }
      if (!form.labMunicipality)       { setError("Please select a municipality for your lab."); return; }
      if (!form.labWard)               { setError("Please select a ward for your lab."); return; }
      if (!form.experienceYears)       { setError("Years of experience is required."); return; }
      if (!files.profilePhoto)         { setError("Profile photo is required."); return; }
      if (!files.labCertificate)       { setError("Lab certificate is required."); return; }
      if (!files.idProof)              { setError("ID proof / Citizenship is required."); return; }
    }

    try {
      setLoading(true);
      let res;

      if (form.role === "expert") {
        const labAddress = `${form.labMunicipality}, Ward ${form.labWard}`;

        const fd = new FormData();
        fd.append("name",            form.name.trim());
        fd.append("email",           form.email.trim());
        fd.append("password",        form.password);
        fd.append("role",            "expert");
        fd.append("contactNumber",   form.contactNumber.trim());
        fd.append("labName",         form.labName.trim());
        fd.append("labAddress",      labAddress);
        fd.append("labMunicipality", form.labMunicipality);
        fd.append("labWard",         String(form.labWard));
        fd.append("experienceYears", String(form.experienceYears));
        // ✅ All field names match multer config exactly
        if (files.profilePhoto)   fd.append("profilePhoto",   files.profilePhoto);
        if (files.labCertificate) fd.append("labCertificate", files.labCertificate);
        if (files.idProof)        fd.append("idProof",        files.idProof);

        res = await api.post("/auth/register", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (!res.data.success) {
          setError(
            res.data.message?.includes("already exists")
              ? t("userAlreadyExists")
              : res.data.message
          );
          return;
        }
        alert(t("expertPendingApproval"));
        navigate("/login");

      } else {
        // ── Farmer: JSON — UNCHANGED ─────────────────────────────────
        res = await api.post("/auth/register", {
          name:          form.name.trim(),
          email:         form.email.trim(),
          password:      form.password,
          role:          "farmer",
          contactNumber: form.contactNumber.trim(),
        });
        if (!res.data.success) {
          setError(
            res.data.message?.includes("already exists")
              ? t("userAlreadyExists")
              : res.data.message
          );
          return;
        }
        localStorage.setItem("token", res.data.token);
        navigate("/verify-email");
      }
    } catch {
      setError(t("registerFailed"));
    } finally {
      setLoading(false);
    }
  };

  const googleSignup = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/auth/google`;
  };

  const pwStrength = (() => {
    const pw = form.password;
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)        s++;
    if (/[A-Z]/.test(pw))      s++;
    if (/[0-9]/.test(pw))      s++;
    if (/[!@#$%^&*]/.test(pw)) s++;
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
    width: "100%", padding: "13px 16px", fontSize: "14.5px", fontWeight: "400",
    border: `1.5px solid ${focused[key] ? "#16a34a" : "#d1d9e0"}`,
    borderRadius: "10px", outline: "none", color: "#111827", background: "#fff",
    fontFamily: "'Montserrat', sans-serif", boxSizing: "border-box",
    transition: "border-color .2s, box-shadow .2s",
    boxShadow: focused[key] ? "0 0 0 3.5px rgba(22,163,74,.10)" : "none",
    letterSpacing: "0.01em",
  });

  const sel = (key) => ({
    ...inp(key),
    appearance: "none",
    WebkitAppearance: "none",
    paddingRight: "36px",
    cursor: form.labMunicipality || key !== "labWard" ? "pointer" : "not-allowed",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html, body, #root { height:100%; overflow:hidden; }

        @keyframes reg__fadeup  { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes reg__slidein { from{opacity:0;transform:translateX(26px)} to{opacity:1;transform:translateX(0)} }
        @keyframes reg__spin    { to{transform:rotate(360deg)} }
        @keyframes reg__shake   { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-4px)} 40%,80%{transform:translateX(4px)} }
        @keyframes reg__slided  { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .reg-page { position:fixed; left:0; right:0; bottom:0; top:70px; display:flex; font-family:'Montserrat',sans-serif; background:#fff; overflow:hidden; }

        .reg-left {
          width:42%; flex-shrink:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; padding:0 40px;
          position:relative; overflow:hidden;
          background:linear-gradient(165deg,#064e29 0%,#0d4a23 30%,#0f5a2b 60%,#146a32 100%);
          border-right:1px solid #0a3d20; opacity:0; transition:opacity 0.85s ease;
        }
        .reg-left.vis { opacity:1; }
        .reg-glow1 { position:absolute; pointer-events:none; width:300px; height:300px; border-radius:50%; background:radial-gradient(circle,rgba(74,222,128,.12) 0%,transparent 70%); top:-60px; right:-70px; }
        .reg-glow2 { position:absolute; pointer-events:none; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle,rgba(34,197,94,.10) 0%,transparent 70%); bottom:50px; left:-45px; }
        .reg-back { position:absolute; top:22px; left:24px; z-index:10; display:inline-flex; align-items:center; gap:6px; font-size:11px; font-weight:600; letter-spacing:.4px; text-transform:uppercase; color:rgba(255,255,255,.60); text-decoration:none; padding:6px 12px; border:1px solid rgba(255,255,255,.18); border-radius:7px; background:rgba(255,255,255,.07); backdrop-filter:blur(6px); transition:all .18s ease; }
        .reg-back:hover { color:#fff; border-color:rgba(255,255,255,.36); background:rgba(255,255,255,.14); transform:translateX(-2px); }
        .reg-left-inner { width:100%; max-width:278px; display:flex; flex-direction:column; align-items:center; position:relative; z-index:2; max-height:100%; }
        .reg-tag { font-size:9.5px; font-weight:700; letter-spacing:3.5px; text-transform:uppercase; color:#4ade80; margin-bottom:8px; text-align:center; flex-shrink:0; }
        .reg-heading { font-size:clamp(18px,1.9vw,26px); font-weight:800; line-height:1.22; letter-spacing:-.5px; color:#fff; text-align:center; margin-bottom:8px; flex-shrink:0; }
        .reg-heading em { font-style:italic; color:#86efac; font-weight:700; }
        .reg-desc { font-size:12px; color:rgba(255,255,255,.54); text-align:center; line-height:1.7; font-weight:400; margin-bottom:10px; flex-shrink:0; }
        .reg-plant-wrap { flex:1; min-height:0; width:100%; display:flex; align-items:center; justify-content:center; padding:2px 0; }
        .reg-feats { display:flex; flex-direction:column; gap:6px; width:100%; flex-shrink:0; }
        .reg-feat  { display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12); border-radius:8px; }
        .reg-feat-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; flex-shrink:0; }
        .reg-feat-txt { font-size:11.5px; color:rgba(255,255,255,.72); font-weight:500; }

        .reg-right {
          flex:1; height:100%; overflow-y:auto; overflow-x:hidden;
          display:flex; align-items:flex-start; justify-content:center;
          padding:40px 56px 0; background:#fff; opacity:0;
          animation:reg__slidein 0.65s ease 0.2s forwards;
        }
        .reg-right.vis { opacity:1; }

        .reg-form-card { width:100%; max-width:420px; padding:0 0 64px; animation:reg__fadeup .55s ease .38s both; }

        .reg-form-title { font-size:30px; font-weight:800; color:#0d1f0e; margin-bottom:6px; letter-spacing:-.7px; line-height:1.12; }
        .reg-form-sub { font-size:14px; color:#64748b; margin-bottom:26px; font-weight:400; line-height:1.65; }
        .reg-err { display:flex; align-items:center; gap:9px; padding:12px 15px; background:#fff5f5; border:1.5px solid #fecaca; border-radius:10px; color:#dc2626; font-size:13px; font-weight:600; margin-bottom:20px; animation:reg__shake .35s ease; }
        .reg-fld { margin-bottom:17px; }
        .reg-lbl { display:block; font-size:11.5px; font-weight:700; color:#1e293b; margin-bottom:8px; letter-spacing:.8px; text-transform:uppercase; }

        .reg-role-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
        .reg-role-card { padding:15px 12px; border:1.5px solid #d1d9e0; border-radius:10px; cursor:pointer; background:#fff; text-align:center; transition:all .18s ease; user-select:none; position:relative; }
        .reg-role-card:hover { border-color:#86efac; background:#f4fef6; }
        .reg-role-card.act { border-color:#16a34a; background:#f0fdf4; box-shadow:0 0 0 3.5px rgba(22,163,74,.08); }
        .reg-role-icon { display:flex; align-items:center; justify-content:center; margin-bottom:8px; color:#16a34a; }
        .reg-role-icon-inactive { display:flex; align-items:center; justify-content:center; margin-bottom:8px; color:#94a3b8; }
        .reg-role-name { font-size:12.5px; font-weight:700; color:#1e293b; letter-spacing:.1px; }
        .reg-role-chk { position:absolute; top:8px; right:8px; width:17px; height:17px; border-radius:50%; background:#16a34a; display:flex; align-items:center; justify-content:center; }
        .reg-expert-note { margin-top:10px; padding:10px 13px; border-radius:8px; background:#fffbeb; border:1px solid #fde68a; font-size:12px; color:#92400e; line-height:1.58; font-weight:500; animation:reg__slided .22s ease; display:flex; align-items:flex-start; gap:7px; }

        .reg-exp-sec { border:1.5px solid #d1d9e0; border-radius:12px; padding:18px 18px 6px; background:#fafbfc; margin-bottom:16px; animation:reg__slided .28s ease; }
        .reg-exp-head { font-size:10px; font-weight:800; color:#94a3b8; letter-spacing:2.5px; text-transform:uppercase; margin-bottom:14px; padding-bottom:12px; border-bottom:1px solid #eef2f6; }

        .reg-row-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

        .reg-sel-wrap { position:relative; }
        .reg-sel-arrow { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:#15803d; pointer-events:none; font-size:14px; line-height:1; }

        .reg-file-up { display:flex; align-items:center; gap:9px; padding:10px 13px; border:1.5px dashed #c8d3de; border-radius:9px; background:#fff; cursor:pointer; transition:all .18s ease; position:relative; user-select:none; }
        .reg-file-up:hover { border-color:#86efac; background:#f4fef6; }
        .reg-file-up input { position:absolute; opacity:0; width:0; height:0; }
        .reg-file-icon { color:#94a3b8; flex-shrink:0; display:flex; align-items:center; }
        .reg-file-icon.ok { color:#16a34a; }
        .reg-file-name { flex:1; font-size:12.5px; color:#94a3b8; font-weight:500; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .reg-file-name.ok { color:#16a34a; font-weight:600; }
        .reg-file-browse { padding:4px 11px; background:#fff; border:1.5px solid #d1d9e0; border-radius:6px; font-size:11.5px; font-weight:700; color:#475569; flex-shrink:0; display:flex; align-items:center; gap:5px; }

        /* Photo preview */
        .reg-photo-preview { width:72px; height:72px; border-radius:50%; object-fit:cover; border:2.5px solid #16a34a; flex-shrink:0; }
        .reg-photo-placeholder { width:72px; height:72px; border-radius:50%; background:#f0fdf4; border:2.5px dashed #c8d3de; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#94a3b8; }

        .reg-pw-wrap { position:relative; }
        .reg-pw-eye { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:#94a3b8; display:flex; align-items:center; transition:color .15s; padding:3px; }
        .reg-pw-eye:hover { color:#475569; }
        .reg-str-row { display:flex; align-items:center; gap:9px; margin-top:8px; }
        .reg-str-bars { display:flex; gap:4px; flex:1; }
        .reg-str-bar { flex:1; height:3.5px; border-radius:3px; background:#e2e8f0; transition:background .3s; }
        .reg-pw-hint { font-size:11.5px; color:#94a3b8; margin-top:6px; line-height:1.58; font-weight:400; }

        .reg-e-wrap { position:relative; }
        .reg-e-chk { position:absolute; right:13px; top:50%; transform:translateY(-50%); color:#16a34a; font-weight:700; font-size:15px; pointer-events:none; }

        .reg-submit {
          width:100%; padding:14px; font-size:14.5px; font-weight:700; color:#fff;
          background:#15803d; border:none; border-radius:10px; cursor:pointer;
          font-family:'Montserrat',sans-serif;
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:all .2s ease; margin-top:6px; margin-bottom:20px;
          letter-spacing:.3px; text-transform:uppercase;
          box-shadow:0 8px 22px rgba(22,163,74,.26);
        }
        .reg-submit:hover:not(:disabled) { background:#166534; transform:translateY(-1px); box-shadow:0 10px 28px rgba(22,163,74,.32); }
        .reg-submit:disabled { opacity:.65; cursor:not-allowed; }
        .reg-spinner { width:15px; height:15px; flex-shrink:0; border:2px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:reg__spin .65s linear infinite; }

        .reg-divider { display:flex; align-items:center; gap:13px; margin:4px 0 16px; }
        .reg-div-line { flex:1; height:1px; background:#eff2f5; }
        .reg-div-txt { font-size:11.5px; color:#c5cdd6; font-weight:600; letter-spacing:.5px; text-transform:uppercase; }

        .reg-g-btn { width:100%; padding:13px 16px; font-size:14px; font-weight:600; color:#374151; background:#fff; border:1.5px solid #d1d9e0; border-radius:10px; cursor:pointer; font-family:'Montserrat',sans-serif; display:flex; align-items:center; justify-content:center; gap:11px; transition:all .18s ease; margin-bottom:26px; letter-spacing:.1px; }
        .reg-g-btn:hover { border-color:#86efac; background:#f4fef6; color:#111827; }

        .reg-login-row { text-align:center; font-size:13.5px; color:#64748b; font-weight:500; }
        .reg-login-link { color:#16a34a; font-weight:700; text-decoration:none; margin-left:5px; }
        .reg-login-link:hover { text-decoration:underline; }

        @media (max-width:768px) {
          html, body, #root { height:auto; overflow:auto; }
          .reg-page { position:relative; top:0; left:0; right:0; bottom:0; min-height:100vh; flex-direction:column; overflow:visible; }
          .reg-left { display:none; }
          .reg-right { width:100%; height:auto; padding:40px 24px; align-items:flex-start; }
          .reg-form-card { margin:0; }
          .reg-row-2 { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="reg-page">

        {/* ── LEFT ── */}
        <div className={`reg-left ${mounted ? "vis" : ""}`}>
          <div className="reg-glow1" /><div className="reg-glow2" />
          <a href="/" className="reg-back">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t("back") || "Back"}
          </a>
          <div className="reg-left-inner">
            <p className="reg-tag">AgroSewa</p>
            <h1 className="reg-heading">
              {t("register.leftHeading") || <>Grow with<br /><em>purpose.</em></>}
            </h1>
            <p className="reg-desc">
              {t("register.leftDesc") || "Join farmers and experts building smarter agriculture across Nepal."}
            </p>
            <div className="reg-plant-wrap"><GrowingPlant /></div>
            <div className="reg-feats">
              {[
                t("register.feat1") || "Smart soil testing & analysis",
                t("register.feat2") || "Certified expert network",
                t("register.feat3") || "Real-time crop recommendations",
              ].map((f) => (
                <div className="reg-feat" key={f}>
                  <div className="reg-feat-dot" />
                  <span className="reg-feat-txt">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className={`reg-right ${mounted ? "vis" : ""}`}>
          <div className="reg-form-card">

            <h2 className="reg-form-title">{t("createAccount")}</h2>
            <p className="reg-form-sub">{t("registerSubtitle")}</p>

            {error && (
              <div className="reg-err">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={submit} noValidate>

              {/* Full Name */}
              <div className="reg-fld">
                <label className="reg-lbl">{t("fullName")}</label>
                <input
                  type="text" placeholder={t("fullNamePlaceholder")} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} style={inp("name")}
                  onFocus={() => setFocused({ ...focused, name: true })}
                  onBlur={() => setFocused({ ...focused, name: false })}
                />
              </div>

              {/* Email */}
              <div className="reg-fld">
                <label className="reg-lbl">{t("emailLabel")}</label>
                <div className="reg-e-wrap">
                  <input
                    type="email" placeholder={t("emailPlaceholder")} value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })} style={inp("email")}
                    onFocus={() => setFocused({ ...focused, email: true })}
                    onBlur={() => setFocused({ ...focused, email: false })}
                  />
                  {form.email && /\S+@\S+\.\S+/.test(form.email) && (
                    <span className="reg-e-chk">&#10003;</span>
                  )}
                </div>
              </div>

              {/* Role selector */}
              <div className="reg-fld">
                <label className="reg-lbl">{t("registerAs")}</label>
                <div className="reg-role-grid">
                  {["farmer", "expert"].map((r) => (
                    <div
                      key={r}
                      className={`reg-role-card ${form.role === r ? "act" : ""}`}
                      onClick={() => setForm({ ...form, role: r })}
                    >
                      <div className={form.role === r ? "reg-role-icon" : "reg-role-icon-inactive"}>
                        {r === "farmer" ? <FarmerIcon /> : <ExpertIcon />}
                      </div>
                      <span className="reg-role-name">
                        {r === "farmer" ? t("roleFarmer") : t("roleExpert")}
                      </span>
                      {form.role === r && (
                        <div className="reg-role-chk">
                          <svg width="8" height="7" viewBox="0 0 10 8" fill="none" stroke="#fff" strokeWidth="2.4">
                            <path d="M1 4l3 3 5-6" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {form.role === "expert" && (
                  <div className="reg-expert-note">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {t("expertApprovalNote")}
                  </div>
                )}
              </div>

              {/* Contact Number — shown for BOTH roles */}
              <div className="reg-fld">
                <label className="reg-lbl">
                  Contact Number
                  {form.role === "expert" && <span style={{ color: "#dc2626" }}>&thinsp;*</span>}
                </label>
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

              {/* ════ Expert-only section ════ */}
              {form.role === "expert" && (
                <div className="reg-exp-sec">
                  <div className="reg-exp-head">Expert Application</div>

                  {/* ── Profile Photo ── */}
                  <div className="reg-fld">
                    <label className="reg-lbl">Profile Photo <span style={{ color: "#dc2626" }}>*</span></label>
                    <label className="reg-file-up" style={{ alignItems: "center", gap: "14px" }}>
                      {/* Live preview or placeholder */}
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="reg-photo-preview" />
                      ) : (
                        <div className="reg-photo-placeholder">
                          <PhotoIcon />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className={`reg-file-name ${files.profilePhoto ? "ok" : ""}`}>
                          {files.profilePhoto ? files.profilePhoto.name : "Upload your photo"}
                        </span>
                        <p style={{ margin: "3px 0 0", fontSize: "11px", color: "#94a3b8" }}>
                          JPG or PNG · max 5 MB
                        </p>
                      </div>
                      <span className="reg-file-browse">
                        <UploadIcon />Browse
                      </span>
                      <input
                        type="file"
                        name="profilePhoto"
                        accept=".jpg,.jpeg,.png"
                        onChange={handleFile}
                      />
                    </label>
                  </div>

                  {/* Lab Name */}
                  <div className="reg-fld">
                    <label className="reg-lbl">Lab / Office Name <span style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. Green Agro Lab, Soil Solutions..."
                      value={form.labName}
                      onChange={(e) => setForm({ ...form, labName: e.target.value })}
                      style={inp("labName")}
                      onFocus={() => setFocused({ ...focused, labName: true })}
                      onBlur={() => setFocused({ ...focused, labName: false })}
                    />
                  </div>

                  {/* Lab Address — Municipality + Ward side-by-side */}
                  <div className="reg-row-2">
                    <div className="reg-fld">
                      <label className="reg-lbl">Municipality <span style={{ color: "#dc2626" }}>*</span></label>
                      <div className="reg-sel-wrap">
                        <select
                          value={form.labMunicipality}
                          onChange={(e) => setForm({ ...form, labMunicipality: e.target.value })}
                          style={sel("labMunicipality")}
                          onFocus={() => setFocused({ ...focused, labMunicipality: true })}
                          onBlur={() => setFocused({ ...focused, labMunicipality: false })}
                        >
                          <option value="">Select</option>
                          {municipalities.map((m, i) => (
                            <option key={i} value={m.name}>{m.nameNe}</option>
                          ))}
                        </select>
                        <span className="reg-sel-arrow">▾</span>
                      </div>
                    </div>

                    <div className="reg-fld">
                      <label className="reg-lbl">Ward <span style={{ color: "#dc2626" }}>*</span></label>
                      <div className="reg-sel-wrap">
                        <select
                          value={form.labWard}
                          onChange={(e) => setForm({ ...form, labWard: e.target.value })}
                          style={sel("labWard")}
                          disabled={!form.labMunicipality}
                          onFocus={() => setFocused({ ...focused, labWard: true })}
                          onBlur={() => setFocused({ ...focused, labWard: false })}
                        >
                          <option value="">Select</option>
                          {getWards().map((w, i) => (
                            <option key={i} value={w}>Ward {w}</option>
                          ))}
                        </select>
                        <span className="reg-sel-arrow">▾</span>
                      </div>
                    </div>
                  </div>

                  {/* Experience Years */}
                  <div className="reg-fld">
                    <label className="reg-lbl">Years of Experience <span style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      min="0"
                      max="60"
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                      style={inp("experienceYears")}
                      onFocus={() => setFocused({ ...focused, experienceYears: true })}
                      onBlur={() => setFocused({ ...focused, experienceYears: false })}
                    />
                  </div>

                  {/* Lab Certificate */}
                  <div className="reg-fld">
                    <label className="reg-lbl">Lab Certificate <span style={{ color: "#dc2626" }}>*</span></label>
                    <label className="reg-file-up">
                      <span className={`reg-file-icon ${files.labCertificate ? "ok" : ""}`}>
                        <CertIcon />
                      </span>
                      <span className={`reg-file-name ${files.labCertificate ? "ok" : ""}`}>
                        {files.labCertificate ? files.labCertificate.name : "Upload PDF or image"}
                      </span>
                      <span className="reg-file-browse">
                        <UploadIcon />Browse
                      </span>
                      <input type="file" name="labCertificate" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
                    </label>
                  </div>

                  {/* ID Proof / Citizenship */}
                  <div className="reg-fld" style={{ marginBottom: 4 }}>
                    <label className="reg-lbl">Citizenship / ID Proof <span style={{ color: "#dc2626" }}>*</span></label>
                    <label className="reg-file-up">
                      <span className={`reg-file-icon ${files.idProof ? "ok" : ""}`}>
                        <IdIcon />
                      </span>
                      <span className={`reg-file-name ${files.idProof ? "ok" : ""}`}>
                        {files.idProof ? files.idProof.name : "Upload PDF or image"}
                      </span>
                      <span className="reg-file-browse">
                        <UploadIcon />Browse
                      </span>
                      <input type="file" name="idProof" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFile} />
                    </label>
                  </div>
                </div>
              )}
              {/* ════ End Expert-only section ════ */}

              {/* Password */}
              <div className="reg-fld">
                <label className="reg-lbl">{t("password")}</label>
                <div className="reg-pw-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    style={{ ...inp("password"), paddingRight: 44 }}
                    onFocus={() => setFocused({ ...focused, password: true })}
                    onBlur={() => setFocused({ ...focused, password: false })}
                  />
                  <button type="button" className="reg-pw-eye" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
                {form.password && (
                  <div className="reg-str-row">
                    <div className="reg-str-bars">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="reg-str-bar"
                          style={{ background: pwStrength >= i ? strengthColor[pwStrength] : "#e2e8f0" }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: strengthColor[pwStrength], minWidth: 36 }}>
                      {strengthLabel[pwStrength]}
                    </span>
                  </div>
                )}
                <p className="reg-pw-hint">{t("passwordHint")}</p>
              </div>

              <button type="submit" className="reg-submit" disabled={loading}>
                {loading ? (
                  <><span className="reg-spinner" />{t("registering")}</>
                ) : (
                  <>
                    {t("register")}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="reg-divider">
              <span className="reg-div-line" />
              <span className="reg-div-txt">{t("orContinueWith")}</span>
              <span className="reg-div-line" />
            </div>

            <button type="button" className="reg-g-btn" onClick={googleSignup}>
              <img src="/icons8-google.svg" alt="Google" style={{ width: 18, height: 18 }}
                onError={(e) => { e.target.style.display = "none"; }} />
              {t("signupGoogle")}
            </button>

            <p className="reg-login-row">
              {t("alreadyHaveAccount")}
              <Link to="/login" className="reg-login-link">{t("login")}</Link>
            </p>

          </div>
        </div>

      </div>
    </>
  );
};

export default Register;