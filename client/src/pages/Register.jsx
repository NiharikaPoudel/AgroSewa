import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/axios";

const Register = () => {
  const { t } = useTranslation();

  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // Show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // Dynamic error shown above all fields
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  /**
   * -----------------------------
   * Password Validation Rules
   * -----------------------------
   * Returns a single error message (i18n)
   */
  const validatePassword = (password) => {
    if (!/.{8,}/.test(password)) return t("passwordMinLength");
    if (!/[A-Z]/.test(password)) return t("passwordUpperCase");
    if (!/[a-z]/.test(password)) return t("passwordLowerCase");
    if (!/[0-9]/.test(password)) return t("passwordNumber");
    if (!/[!@#$%^&*]/.test(password)) return t("passwordSpecialChar");
    return null;
  };

  /**
   * -----------------------------
   * Handle Google Signup Redirect
   * -----------------------------
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const googleError = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name || "User");
      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/");
    }

    if (googleError) {
      setError(t("googleError"));
    }
  }, [location, navigate, t]);

  /**
   * -----------------------------
   * Handle Form Submission
   * -----------------------------
   */
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // 1️⃣ Check all fields are filled
    if (!form.name || !form.email || !form.password) {
      setError(t("fillAllFields"));
      return;
    }

    // 2️⃣ Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError(t("invalidEmail"));
      return;
    }

    // 3️⃣ Password validation
    const passwordError = validatePassword(form.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      const res = await api.post("/auth/register", form);
      if (res.data.success) {
        await api.post("/auth/send-verify-otp", { email: form.email });
        navigate("/verify-email");
      } else {
        // Map backend messages to i18n
        if (res.data.message?.includes("already exists")) {
          setError(t("userAlreadyExists"));
        } else {
          setError(res.data.message);
        }
      }
    } catch {
      setError(t("registerFailed"));
    }
  };

  /**
   * -----------------------------
   * Google Signup Handler
   * -----------------------------
   */
  const googleSignup = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f5f5",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      <form 
        onSubmit={submit}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "48px 40px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
          animation: "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Section */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "36px",
          animation: "fadeIn 0.6s ease-out"
        }}>
          <h2 style={{
            margin: "0 0 8px 0",
            fontSize: "32px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.5px"
          }}>
            {t("createAccount")}
          </h2>
          <p style={{
            margin: "0",
            fontSize: "15px",
            color: "#6b7280",
            fontWeight: "400"
          }}>
            Start your journey with us today
          </p>
        </div>

        {/* Single-line dynamic error */}
        {error && (
          <div style={{
            padding: "14px 18px",
            marginBottom: "24px",
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "14px",
            fontWeight: "500",
            animation: "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "16px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Full Name with Icon */}
        <div style={{ 
          position: "relative", 
          width: "100%", 
          marginBottom: "16px" 
        }}>
          <span style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "19px",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            👤
          </span>
          <input
            placeholder={t("fullName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "15px 16px 15px 48px",
              fontSize: "15px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "inherit",
              boxSizing: "border-box",
              color: "#1f2937",
              backgroundColor: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2d8a4f";
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 4px rgba(45, 138, 79, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#fafafa";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Email with Icon */}
        <div style={{ 
          position: "relative", 
          width: "100%", 
          marginBottom: "16px" 
        }}>
          <span style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "19px",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            ✉️
          </span>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "15px 16px 15px 48px",
              fontSize: "15px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "inherit",
              boxSizing: "border-box",
              color: "#1f2937",
              backgroundColor: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2d8a4f";
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 4px rgba(45, 138, 79, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#fafafa";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Password with Lock Icon and Eye Toggle */}
        <div style={{ 
          position: "relative", 
          width: "100%", 
          marginBottom: "24px" 
        }}>
          <span style={{
            position: "absolute",
            left: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "19px",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            zIndex: 1
          }}>
            🔑
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "15px 48px 15px 48px",
              fontSize: "15px",
              border: "1.5px solid #e5e7eb",
              borderRadius: "8px",
              outline: "none",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "inherit",
              boxSizing: "border-box",
              color: "#1f2937",
              backgroundColor: "#fafafa"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#2d8a4f";
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 4px rgba(45, 138, 79, 0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#fafafa";
              e.target.style.boxShadow = "none";
            }}
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              cursor: "pointer",
              color: "#9ca3af",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1,
              padding: "4px"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#2d8a4f";
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
              e.currentTarget.style.transform = "translateY(-50%) scale(1)";
            }}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
        </div>

        {/* Normal Register Button */}
        <button 
          type="submit"
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            fontWeight: "600",
            color: "white",
            background: "linear-gradient(to bottom, #2d8a4f, #267a43)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "16px",
            fontFamily: "inherit",
            boxShadow: "0 2px 8px rgba(45, 138, 79, 0.25)",
            letterSpacing: "0.3px"
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 12px rgba(45, 138, 79, 0.35)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 2px 8px rgba(45, 138, 79, 0.25)";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(0) scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "translateY(-1px) scale(1)";
          }}
        >
          {t("register")}
        </button>

        {/* Google Signup Button */}
        <button 
          type="button" 
          onClick={googleSignup}
          style={{
            width: "100%",
            padding: "15px",
            fontSize: "16px",
            fontWeight: "500",
            color: "#374151",
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "24px",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            letterSpacing: "0.2px"
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#f9fafb";
            e.target.style.borderColor = "#d1d5db";
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "white";
            e.target.style.borderColor = "#e5e7eb";
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "translateY(0) scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "translateY(-1px) scale(1)";
          }}
        >
          <img 
            src="/icons8-google.svg" 
            alt="Google" 
            style={{ width: "18px", height: "18px" }}
          />
          {t("signupGoogle")}
        </button>

        {/* Link to login */}
        <p style={{
          textAlign: "center",
          margin: "0",
          fontSize: "14px",
          color: "#6b7280"
        }}>
          {t("alreadyHaveAccount")}{" "}
          <Link 
            to="/login"
            style={{
              color: "#2d8a4f",
              textDecoration: "none",
              fontWeight: "600",
              transition: "color 0.2s ease"
            }}
            onMouseEnter={(e) => e.target.style.color = "#267a43"}
            onMouseLeave={(e) => e.target.style.color = "#2d8a4f"}
          >
            {t("login")}
          </Link>
        </p>

        {/* CSS Animations */}
        <style>{`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-8px); }
            20%, 40%, 60%, 80% { transform: translateX(8px); }
          }
        `}</style>
      </form>
    </div>
  );
};

export default Register;