import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  const refs = useRef([]);

  /* ── OTP input handlers ── */
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
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      refs.current[5]?.focus();
    }
  };

  /* ── Redirect based on role ── */
  const redirectByRole = (role) => {
    if (role === "admin")  return navigate("/admin-dashboard",  { replace: true });
    if (role === "expert") return navigate("/expert-dashboard", { replace: true });
    return navigate("/", { replace: true }); // farmer → home
  };

  /* ── Submit OTP ── */
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpStr = otp.join("");
    if (otpStr.length < 6) {
      setError(t("otp.allDigitsRequired"));
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/verify-account", { otp: otpStr });

      if (!res.data.success) {
        setError(res.data.message || t("otp.incorrectOtp"));
        return;
      }

      const { token, user } = res.data;

      localStorage.setItem("token",    token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userName", user.name);

      window.dispatchEvent(new Event("userLoggedIn"));

      setSuccess(t("otp.welcomeRedirecting", { name: user.name }));

      setTimeout(() => redirectByRole(user.role), 1500);

    } catch (err) {
      console.error(err);
      setError(t("otp.somethingWentWrong"));
    } finally {
      setLoading(false);
    }
  };

  /* ── Resend OTP ── */
  const resend = async () => {
    setError("");
    setSuccess("");
    try {
      setResending(true);
      const res = await api.post("/auth/send-verify-otp");
      if (res.data.success) {
        setSuccess(t("otp.newOtpSent"));
      } else {
        setError(res.data.message || t("otp.failedToResend"));
      }
    } catch {
      setError(t("otp.failedToResendRetry"));
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.icon}>📧</div>
          <h2 style={S.title}>{t("verifyEmail")}</h2>
          <p style={S.sub}>{t("otp.subtitle")}</p>
        </div>

        {/* Error */}
        {error && (
          <div style={S.errorBox}>
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success */}
        {success && (
          <div style={S.successBox}>
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={submit} noValidate>

          {/* OTP Boxes */}
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
                  ...S.box,
                  borderColor: d ? "#2d8a4f" : "#e5e7eb",
                  background:  d ? "#f0fdf4" : "#fafafa",
                  boxShadow:   d ? "0 0 0 3px rgba(45,138,79,0.1)" : "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#2d8a4f";
                  e.target.style.background  = "#fff";
                  e.target.style.boxShadow   = "0 0 0 3px rgba(45,138,79,0.12)";
                }}
                onBlur={(e) => {
                  if (!e.target.value) {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.background  = "#fafafa";
                    e.target.style.boxShadow   = "none";
                  }
                }}
              />
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !!success}
            style={{
              ...S.btn,
              opacity: loading || success ? 0.75 : 1,
              cursor:  loading || success ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!loading && !success) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 12px rgba(45,138,79,0.35)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 2px 8px rgba(45,138,79,0.25)";
            }}
          >
            {loading
              ? t("otp.verifying")
              : success
              ? t("otp.redirecting")
              : t("otp.verifyAndContinue")}
          </button>
        </form>

        {/* Resend */}
        {!success && (
          <p style={S.resendRow}>
            {t("otp.didntReceive")}{" "}
            <button
              onClick={resend}
              disabled={resending}
              style={S.resendBtn}
            >
              {resending ? t("otp.sending") : t("otp.resendOtp")}
            </button>
          </p>
        )}

        <style>{`
          @keyframes cardIn {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            20%,60% { transform: translateX(-5px); }
            40%,80% { transform: translateX(5px); }
          }
          @keyframes pulse {
            0%,100% { opacity: 1; }
            50%      { opacity: 0.6; }
          }
        `}</style>
      </div>
    </div>
  );
};

const S = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #f0fdf4 0%, #fff 100%)",
    padding: "20px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "12px",
    padding: "44px 40px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    animation: "cardIn 0.45s cubic-bezier(0.16,1,0.3,1)",
  },
  header:     { textAlign: "center", marginBottom: "32px" },
  icon:       { fontSize: "44px", marginBottom: "12px" },
  title:      { margin: "0 0 8px", fontSize: "26px", fontWeight: "700", color: "#1a1a1a", letterSpacing: "-0.4px" },
  sub:        { margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: "1.6" },
  errorBox:   {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 16px", marginBottom: "20px",
    background: "#fef2f2", border: "1.5px solid #fecaca",
    borderRadius: "8px", color: "#dc2626",
    fontSize: "13px", fontWeight: "500",
    animation: "shake 0.4s ease",
  },
  successBox: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "12px 16px", marginBottom: "20px",
    background: "#f0fdf4", border: "1.5px solid #bbf7d0",
    borderRadius: "8px", color: "#16a34a",
    fontSize: "13px", fontWeight: "500",
    animation: "pulse 1.5s ease infinite",
  },
  otpRow: {
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    marginBottom: "28px",
  },
  box: {
    width: "48px",
    height: "56px",
    textAlign: "center",
    fontSize: "24px",
    fontWeight: "700",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    outline: "none",
    transition: "all 0.2s ease",
    color: "#1a1a1a",
    fontFamily: "inherit",
  },
  btn: {
    width: "100%",
    padding: "13px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(to bottom, #2d8a4f, #267a43)",
    border: "none",
    borderRadius: "8px",
    fontFamily: "inherit",
    boxShadow: "0 2px 8px rgba(45,138,79,0.25)",
    transition: "all 0.2s ease",
    marginBottom: "20px",
  },
  resendRow:  { textAlign: "center", margin: 0, fontSize: "13px", color: "#6b7280" },
  resendBtn:  {
    background: "none", border: "none",
    color: "#2d8a4f", fontWeight: "600",
    cursor: "pointer", fontSize: "13px",
    padding: 0, fontFamily: "inherit",
  },
};

export default VerifyEmail;