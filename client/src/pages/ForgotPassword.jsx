import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

const OtpInput = ({ otp, setOtp }) => {
  const refs = useRef([]);

  const handleChange = (val, i) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (e, i) => {
    if (e.key === "Backspace" && !otp[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      refs.current[5]?.focus();
    }
  };

  return (
    <div style={S.otpRow} onPaste={handlePaste}>
      {otp.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e.target.value, i)}
          onKeyDown={(e) => handleKey(e, i)}
          style={{
            ...S.otpBox,
            borderColor: d ? "#2d8a4f" : "#e5e7eb",
            background: d ? "#f0fdf4" : "#fafafa",
            boxShadow: d ? "0 0 0 3px rgba(45,138,79,0.10)" : "none",
          }}
          onFocus={(e) => {
            e.target.style.borderColor = "#2d8a4f";
            e.target.style.background = "#fff";
            e.target.style.boxShadow = "0 0 0 3px rgba(45,138,79,0.12)";
          }}
          onBlur={(e) => {
            if (!e.target.value) {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.background = "#fafafa";
              e.target.style.boxShadow = "none";
            }
          }}
        />
      ))}
    </div>
  );
};

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [newPwFocused, setNewPwFocused] = useState(false);
  const [confirmPwFocused, setConfirmPwFocused] = useState(false);

  const pwStrength = (() => {
    if (!newPassword) return 0;
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = [
    "",
    t("forgot.strengthWeak"),
    t("forgot.strengthFair"),
    t("forgot.strengthGood"),
    t("forgot.strengthStrong"),
  ];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#2d8a4f"];

  const sendOtp = async () => {
    setError("");
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError(t("invalidEmail"));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/auth/send-reset-otp", { email });
      if (res.data.success) setStep(2);
      else setError(res.data.message);
    } catch {
      setError(t("forgot.sendOtpError"));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    setError("");
    const otpStr = otp.join("");
    if (otpStr.length < 6) { setError(t("otp.allDigitsRequired")); return; }
    if (!newPassword) { setError(t("forgot.enterNewPassword")); return; }
    if (newPassword !== confirmPassword) { setError(t("forgot.passwordsDoNotMatch")); return; }
    if (newPassword.length < 8) { setError(t("passwordMinLength")); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/reset-password", { email, otp: otpStr, newPassword });
      if (res.data.success) {
        setStep(3);
        setTimeout(() => navigate("/login"), 2500);
      } else {
        setError(res.data.message);
      }
    } catch {
      setError(t("forgot.resetError"));
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [
    t("forgot.step1Label"),
    t("forgot.step2Label"),
    t("forgot.step3Label"),
  ];

  return (
    <div style={S.page}>
      <div style={S.bgCircle1} />
      <div style={S.bgCircle2} />

      <div style={S.card}>

        {/* Brand */}
        <div style={S.brand}>
          <span style={S.brandLeaf}>🌿</span>
          <span style={S.brandName}>AgroSewa</span>
        </div>

        {/* Step indicator */}
        <div style={S.stepRow}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={S.stepWrapper}>
              <div
                style={{
                  ...S.stepDot,
                  background: step >= s ? "#2d8a4f" : "#e5e7eb",
                  color: step >= s ? "#fff" : "#9ca3af",
                  boxShadow: step === s ? "0 0 0 4px rgba(45,138,79,0.18)" : "none",
                  transform: step === s ? "scale(1.15)" : "scale(1)",
                }}
              >
                {step > s ? "✓" : s}
              </div>
              <span
                style={{
                  ...S.stepLabel,
                  color: step >= s ? "#2d8a4f" : "#9ca3af",
                }}
              >
                {stepLabels[s - 1]}
              </span>
              {s < 3 && (
                <div
                  style={{
                    ...S.stepLine,
                    background: step > s ? "#2d8a4f" : "#e5e7eb",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── STEP 1: Email ── */}
        {step === 1 && (
          <div style={S.section}>
            <div style={S.iconWrap}>
              <span style={S.bigIcon}></span>
            </div>
            <h2 style={S.title}>{t("resetPassword")}</h2>
            <p style={S.subtitle}>{t("forgot.step1Desc")}</p>

            {error && (
              <div style={S.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div style={S.fieldGroup}>
              <label style={S.label}>{t("emailLabel")}</label>
              <div
                style={{
                  ...S.inputWrap,
                  borderColor: emailFocused ? "#2d8a4f" : email ? "#bbf7d0" : "#e5e7eb",
                  boxShadow: emailFocused ? "0 0 0 3px rgba(45,138,79,0.12)" : "none",
                }}
              >
                <span style={S.inputIcon}>📧</span>
                <input
                  style={S.input}
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  onKeyDown={(e) => e.key === "Enter" && sendOtp()}
                />
              </div>
            </div>

            <button
              style={{
                ...S.btn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={sendOtp}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(45,138,79,0.38)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(45,138,79,0.25)";
              }}
            >
              {loading ? t("forgot.sending") : t("sendOtp")}
            </button>

            <p style={S.backLink}>
              <button style={S.linkBtn} onClick={() => navigate("/login")}>
                ← {t("forgot.backToLogin")}
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP + New Password ── */}
        {step === 2 && (
          <div style={S.section}>
            <div style={S.iconWrap}>
              <span style={S.bigIcon}>✉️</span>
            </div>
            <h2 style={S.title}>{t("forgot.verifyAndReset")}</h2>
            <p style={S.subtitle}>
              {t("forgot.step2Desc")}{" "}
              <strong style={{ color: "#2d8a4f" }}>{email}</strong>
            </p>

            {error && (
              <div style={S.errorBox}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* OTP boxes */}
            <div style={S.fieldGroup}>
              <label style={S.label}>{t("enterOtp")}</label>
              <OtpInput otp={otp} setOtp={setOtp} />
            </div>

            {/* New password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>{t("newPassword")}</label>
              <div
                style={{
                  ...S.inputWrap,
                  borderColor: newPwFocused
                    ? "#2d8a4f"
                    : newPassword
                    ? "#bbf7d0"
                    : "#e5e7eb",
                  boxShadow: newPwFocused
                    ? "0 0 0 3px rgba(45,138,79,0.12)"
                    : "none",
                }}
              >
                <span style={S.inputIcon}>🔒</span>
                <input
                  style={S.input}
                  type={showNewPw ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setNewPwFocused(true)}
                  onBlur={() => setNewPwFocused(false)}
                />
                <button
                  type="button"
                  style={S.eyeBtn}
                  onClick={() => setShowNewPw((p) => !p)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showNewPw} />
                </button>
              </div>

              {newPassword && (
                <div style={S.strengthWrap}>
                  <div style={S.strengthBar}>
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        style={{
                          ...S.strengthSegment,
                          background:
                            pwStrength >= i
                              ? strengthColor[pwStrength]
                              : "#e5e7eb",
                          transition: "background 0.3s ease",
                        }}
                      />
                    ))}
                  </div>
                  <span
                    style={{
                      ...S.strengthText,
                      color: strengthColor[pwStrength],
                    }}
                  >
                    {strengthLabel[pwStrength]}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div style={S.fieldGroup}>
              <label style={S.label}>{t("forgot.confirmPassword")}</label>
              <div
                style={{
                  ...S.inputWrap,
                  borderColor: confirmPwFocused
                    ? "#2d8a4f"
                    : confirmPassword && confirmPassword === newPassword
                    ? "#bbf7d0"
                    : confirmPassword && confirmPassword !== newPassword
                    ? "#fca5a5"
                    : "#e5e7eb",
                  boxShadow: confirmPwFocused
                    ? "0 0 0 3px rgba(45,138,79,0.12)"
                    : "none",
                }}
              >
                <span style={S.inputIcon}>🔏</span>
                <input
                  style={S.input}
                  type={showConfirmPw ? "text" : "password"}
                  placeholder={t("forgot.confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPwFocused(true)}
                  onBlur={() => setConfirmPwFocused(false)}
                />
                <button
                  type="button"
                  style={S.eyeBtn}
                  onClick={() => setShowConfirmPw((p) => !p)}
                  tabIndex={-1}
                >
                  <EyeIcon open={showConfirmPw} />
                </button>
              </div>
              {confirmPassword && confirmPassword !== newPassword && (
                <p style={S.matchError}>⚠ {t("forgot.passwordsDoNotMatch")}</p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p style={S.matchSuccess}>✓ {t("forgot.passwordsMatch")}</p>
              )}
            </div>

            <button
              style={{
                ...S.btn,
                opacity: loading ? 0.75 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              onClick={resetPassword}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(45,138,79,0.38)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(45,138,79,0.25)";
              }}
            >
              {loading ? t("forgot.resetting") : t("resetPassword")}
            </button>

            <p style={S.backLink}>
              <button
                style={S.linkBtn}
                onClick={() => {
                  setStep(1);
                  setError("");
                  setOtp(["", "", "", "", "", ""]);
                }}
              >
                ← {t("forgot.changeEmail")}
              </button>
            </p>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 3 && (
          <div style={{ ...S.section, textAlign: "center" }}>
            <div style={S.successCircle}>
              <span style={{ fontSize: "42px" }}>✅</span>
            </div>
            <h2 style={{ ...S.title, marginTop: "20px" }}>
              {t("forgot.successTitle")}
            </h2>
            <p style={S.subtitle}>{t("forgot.successDesc")}</p>
            <div style={S.redirectNote}>
              <span style={{ fontSize: "13px", color: "#6b7280" }}>
                {t("forgot.redirectingToLogin")}
              </span>
              <div style={S.redirectBar}>
                <div style={S.redirectProgress} />
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(28px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20%,60% { transform: translateX(-5px); }
          40%,80% { transform: translateX(5px); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progressBar {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes float1 {
          0%,100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-18px) scale(1.04); }
        }
        @keyframes float2 {
          0%,100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(14px) scale(0.97); }
        }
      `}</style>
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 40%, #f9fafb 100%)",
    padding: "20px",
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  bgCircle1: {
    position: "fixed",
    top: "-120px",
    right: "-120px",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(45,138,79,0.10) 0%, transparent 70%)",
    animation: "float1 7s ease-in-out infinite",
    pointerEvents: "none",
  },
  bgCircle2: {
    position: "fixed",
    bottom: "-100px",
    left: "-100px",
    width: "360px",
    height: "360px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(45,138,79,0.07) 0%, transparent 70%)",
    animation: "float2 9s ease-in-out infinite",
    pointerEvents: "none",
  },
  card: {
    background: "#fff",
    borderRadius: "20px",
    padding: "40px 40px 36px",
    width: "100%",
    maxWidth: "460px",
    boxShadow: "0 8px 40px rgba(0,0,0,0.09), 0 1px 3px rgba(0,0,0,0.04)",
    animation: "cardIn 0.5s cubic-bezier(0.16,1,0.3,1)",
    position: "relative",
    zIndex: 1,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "7px",
    marginBottom: "28px",
  },
  brandLeaf: { fontSize: "22px" },
  brandName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#2d8a4f",
    letterSpacing: "-0.3px",
  },
  stepRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: "32px",
    position: "relative",
  },
  stepWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
  },
  stepDot: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "13px",
    fontWeight: "700",
    transition: "all 0.35s ease",
    zIndex: 1,
  },
  stepLabel: {
    fontSize: "10px",
    fontWeight: "600",
    marginTop: "5px",
    letterSpacing: "0.3px",
    textTransform: "uppercase",
    transition: "color 0.3s ease",
  },
  stepLine: {
    position: "absolute",
    top: "16px",
    left: "calc(50% + 16px)",
    width: "72px",
    height: "2px",
    transition: "background 0.4s ease",
    zIndex: 0,
  },
  section: {
    animation: "fadeSlide 0.35s ease",
  },
  iconWrap: { textAlign: "center", marginBottom: "12px" },
  bigIcon: { fontSize: "46px" },
  title: {
    margin: "0 0 8px",
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827",
    letterSpacing: "-0.4px",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 26px",
    fontSize: "14px",
    color: "#6b7280",
    lineHeight: "1.6",
    textAlign: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 16px",
    marginBottom: "18px",
    background: "#fef2f2",
    border: "1.5px solid #fecaca",
    borderRadius: "10px",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "500",
    animation: "shake 0.4s ease",
  },
  fieldGroup: { marginBottom: "18px" },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "7px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    background: "#fafafa",
    overflow: "hidden",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputIcon: {
    padding: "0 12px",
    fontSize: "16px",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: "13px 0",
    fontSize: "14px",
    color: "#111827",
    fontFamily: "inherit",
  },
  eyeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0 14px",
    color: "#9ca3af",
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
    flexShrink: 0,
    lineHeight: 0,
  },
  otpRow: {
    display: "flex",
    gap: "9px",
    justifyContent: "center",
    marginBottom: "4px",
  },
  otpBox: {
    width: "46px",
    height: "54px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "700",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s ease",
    color: "#111827",
    fontFamily: "inherit",
    background: "#fafafa",
  },
  strengthWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  },
  strengthBar: {
    flex: 1,
    display: "flex",
    gap: "4px",
  },
  strengthSegment: {
    flex: 1,
    height: "4px",
    borderRadius: "4px",
  },
  strengthText: {
    fontSize: "11px",
    fontWeight: "600",
    minWidth: "40px",
    textAlign: "right",
  },
  matchError: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: "500",
  },
  matchSuccess: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#2d8a4f",
    fontWeight: "500",
  },
  btn: {
    width: "100%",
    padding: "14px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(to bottom, #2d8a4f, #267a43)",
    border: "none",
    borderRadius: "10px",
    fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(45,138,79,0.25)",
    transition: "all 0.2s ease",
    cursor: "pointer",
    marginBottom: "14px",
    letterSpacing: "0.2px",
  },
  backLink: { textAlign: "center", margin: 0 },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "13px",
    cursor: "pointer",
    fontFamily: "inherit",
    padding: 0,
    transition: "color 0.2s",
  },
  successCircle: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
    border: "3px solid #bbf7d0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto",
    boxShadow: "0 4px 20px rgba(45,138,79,0.15)",
  },
  redirectNote: { marginTop: "28px" },
  redirectBar: {
    marginTop: "10px",
    height: "4px",
    borderRadius: "4px",
    background: "#e5e7eb",
    overflow: "hidden",
  },
  redirectProgress: {
    height: "100%",
    background: "linear-gradient(to right, #2d8a4f, #4ade80)",
    borderRadius: "4px",
    animation: "progressBar 2.5s linear forwards",
  },
};

export default ForgotPassword;