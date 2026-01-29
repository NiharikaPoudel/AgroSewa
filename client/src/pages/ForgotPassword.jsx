import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const sendOtp = async () => {
    setError("");
    const res = await api.post("/auth/send-reset-otp", { email });

    if (res.data.success) {
      setStep(2);
    } else {
      setError(res.data.message);
    }
  };

  const resetPassword = async () => {
    setError("");
    const res = await api.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
    });

    if (res.data.success) {
      alert(t("passwordResetSuccess"));
      navigate("/login");
    } else {
      setError(res.data.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t("resetPassword")}</h2>

        {error && <p className="error">{error}</p>}

        {step === 1 && (
          <>
            <input
              placeholder={t("enterYourEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={sendOtp}>{t("sendOtp")}</button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              placeholder={t("enterOtp")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <input
              type="password"
              placeholder={t("newPassword")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button onClick={resetPassword}>{t("resetPassword")}</button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
