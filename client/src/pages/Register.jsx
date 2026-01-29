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
    <div className="auth-container">
      <form className="auth-card" onSubmit={submit}>
        {/* Logo Section */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <img 
            src="/your-logo.svg" 
            alt="Logo" 
            style={{ width: "75px", height: "75px", marginBottom: "1rem" }}
          />
          <h2>{t("createAccount")}</h2>
        </div>

        {/* Single-line dynamic error */}
        {error && <p className="error">{error}</p>}

        {/* Full Name with Icon */}
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
            👤
          </span>
          <input
            placeholder={t("fullName")}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            style={{ paddingLeft: "40px", marginBottom: "0" }}
          />
        </div>

        {/* Email with Icon */}
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
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ paddingLeft: "40px", marginBottom: "0" }}
          />
        </div>

        {/* Password with Lock Icon and Eye Toggle */}
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
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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

        {/* Normal Register */}
        <button type="submit">{t("register")}</button>

        {/* Google Signup */}
        <button type="button" onClick={googleSignup} className="google-btn">
          <img src="/icons8-google.svg" alt="Google" />
          {t("signupGoogle")}
        </button>

        {/* Link to login */}
        <p>
          {t("alreadyHaveAccount")} <Link to="/login">{t("login")}</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;