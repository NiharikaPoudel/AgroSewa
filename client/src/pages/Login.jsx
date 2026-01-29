import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import api from "../utils/axios";

const Login = () => {
  /**
   * i18n translation hook
   * Used to fetch translated text based on current language
   */
  const { t } = useTranslation();

  /**
   * Form state to capture user email and password
   */
  const [form, setForm] = useState({ email: "", password: "" });

  /**
   * Stores any login or Google authentication errors
   */
  const [error, setError] = useState("");

  /**
   * Controls password visibility
   */
  const [showPassword, setShowPassword] = useState(false);

  /**
   * React Router hooks
   * navigate → programmatic navigation
   * location → access query parameters (Google OAuth callback)
   */
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * --------------------------------------------
   * Handle Google Login Redirect
   * --------------------------------------------
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
      setError(t("googleLoginError"));
    }
  }, [location, navigate, t]);

  /**
   * --------------------------------------------
   * Normal Email & Password Login
   * --------------------------------------------
   */
  const submit = async (e) => {
    e.preventDefault();

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
    } catch {
      setError(t("loginFailed"));
    }
  };

  /**
   * --------------------------------------------
   * Google Login Button Handler
   * --------------------------------------------
   */
  const googleLogin = () => {
    window.open("http://localhost:5000/auth/google", "_self");
  };

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={submit}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img 
            src="/your-logo.svg" 
            alt="Logo" 
            style={{ width: "75px", height: "75px", marginBottom: "1rem" }}
          />
          <h2>{t("login")}</h2>
        </div>

        {error && <p className="error">{error}</p>}

        {/* Email Input with Icon */}
        <div style={{ position: "relative", width: "100%", marginBottom: "1rem" }}>
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
            fontSize: "18px",
            pointerEvents: "none",
          }}>
            ✉
          </span>
          <input
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
            required
            style={{ paddingLeft: "40px", marginBottom: "0" }}
          />
        </div>

        {/* Password Input with Lock Icon and Eye Toggle */}
        <div className="password-wrapper">
          <span style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#6b7280",
            fontSize: "18px",
            pointerEvents: "none",
          }}>
            🗝️
          </span>
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t("password")}
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
            required
            style={{ paddingLeft: "40px" }}
          />
          <span
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <AiOutlineEyeInvisible size={20} />
            ) : (
              <AiOutlineEye size={20} />
            )}
          </span>
        </div>

        {/* Normal Login Button */}
        <button type="submit">{t("login")}</button>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={googleLogin}
          className="google-btn"
        >
          <img src="/icons8-google.svg" alt="Google" />
          {t("loginGoogle")}
        </button>

        {/* Forgot Password Link */}
        <p>
          <Link to="/forgot-password">
            {t("forgotPassword")}
          </Link>
        </p>

        {/* Register Link */}
        <p>
          {t("noAccount")}{" "}
          <Link to="/register">{t("register")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;