import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/axios";

const Login = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Handle Google Login Redirect
   */
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");
    const googleError = params.get("error");

    if (token) {
      // Successfully authenticated with Google
      localStorage.setItem("token", token);
      localStorage.setItem("userName", name || "User");
      window.dispatchEvent(new Event("userLoggedIn"));
      
      // Clear URL parameters and navigate
      navigate("/", { replace: true });
    }

    if (googleError) {
      // Handle different error types
      if (googleError === "google_auth_failed") {
        setError(t("googleLoginError") || "Google authentication failed");
      } else if (googleError === "no_user_data") {
        setError("Failed to retrieve user information from Google");
      } else if (googleError === "authentication_error") {
        setError("An error occurred during authentication");
      } else {
        setError(t("googleLoginError") || "Google login failed");
      }
    }
  }, [location, navigate, t]);

  /**
   * Normal Email & Password Login
   */
  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);

      if (!res.data.success) {
        setError(res.data.message);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "userName",
        res.data.user?.name || res.data.user?.email || "User"
      );

      window.dispatchEvent(new Event("userLoggedIn"));
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(t("loginFailed") || "Login failed. Please try again.");
    }
  };

  /**
   * Google Login Button Handler
   * Opens Google OAuth in the same window
   */
  const googleLogin = () => {
    // Use your backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
    window.location.href = `${backendUrl}/auth/google`;
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    }}>
      <form 
        onSubmit={submit}
        style={{
          background: "white",
          borderRadius: "12px",
          padding: "40px 36px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06)",
          animation: "slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header Section */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "28px",
          animation: "fadeIn 0.6s ease-out"
        }}>
          <h2 style={{
            margin: "0 0 6px 0",
            fontSize: "28px",
            fontWeight: "700",
            color: "#1a1a1a",
            letterSpacing: "-0.5px"
          }}>
            {t("login")}
          </h2>
          <p style={{
            margin: "0",
            fontSize: "14px",
            color: "#6b7280",
            fontWeight: "400"
          }}>
            Welcome back! Please login to continue
          </p>
        </div>

        {/* Single-line dynamic error */}
        {error && (
          <div style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "#fef2f2",
            border: "1.5px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            fontSize: "13px",
            fontWeight: "500",
            animation: "shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span style={{ fontSize: "14px" }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Email Input with Icon */}
        <div style={{ 
          position: "relative", 
          width: "100%", 
          marginBottom: "14px" 
        }}>
          <span style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "18px",
            pointerEvents: "none",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          }}>
            ✉️
          </span>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "13px 14px 13px 44px",
              fontSize: "14px",
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

        {/* Password Input with Lock Icon and Eye Toggle */}
        <div style={{ 
          position: "relative", 
          width: "100%", 
          marginBottom: "20px" 
        }}>
          <span style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#9ca3af",
            fontSize: "18px",
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
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
            style={{
              width: "100%",
              padding: "13px 44px 13px 44px",
              fontSize: "14px",
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
              right: "14px",
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
              <AiOutlineEyeInvisible size={19} />
            ) : (
              <AiOutlineEye size={19} />
            )}
          </span>
        </div>

        {/* Normal Login Button */}
        <button 
          type="submit"
          style={{
            width: "100%",
            padding: "13px",
            fontSize: "15px",
            fontWeight: "600",
            color: "white",
            background: "linear-gradient(to bottom, #2d8a4f, #267a43)",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "14px",
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
          {t("login")}
        </button>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={googleLogin}
          style={{
            width: "100%",
            padding: "13px",
            fontSize: "15px",
            fontWeight: "500",
            color: "#374151",
            background: "white",
            border: "1.5px solid #e5e7eb",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "20px",
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
            style={{ width: "17px", height: "17px" }}
          />
          {t("loginGoogle")}
        </button>

        {/* Forgot Password Link */}
        <p style={{
          textAlign: "center",
          margin: "0 0 12px 0",
          fontSize: "13px"
        }}>
          <Link 
            to="/forgot-password"
            style={{
              color: "#2d8a4f",
              textDecoration: "none",
              fontWeight: "600",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.color = "#267a43"}
            onMouseLeave={(e) => e.target.style.color = "#2d8a4f"}
          >
            {t("forgotPassword")}
          </Link>
        </p>

        {/* Register Link */}
        <p style={{
          textAlign: "center",
          margin: "0",
          fontSize: "13px",
          color: "#6b7280"
        }}>
          {t("noAccount")}{" "}
          <Link 
            to="/register"
            style={{
              color: "#2d8a4f",
              textDecoration: "none",
              fontWeight: "600",
              transition: "color 0.3s ease"
            }}
            onMouseEnter={(e) => e.target.style.color = "#267a43"}
            onMouseLeave={(e) => e.target.style.color = "#2d8a4f"}
          >
            {t("register")}
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

export default Login;