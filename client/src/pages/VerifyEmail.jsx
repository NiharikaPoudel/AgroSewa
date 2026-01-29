import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import api from "../utils/axios";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const verify = async () => {
    try {
      const res = await api.post("/auth/verify-account", { otp });

      if (res.data.success) {
        alert(t("emailVerified"));
        navigate("/login");
      } else {
        alert(res.data.message);
      }
    } catch (error) {
      alert(t("verificationFailed"));
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{t("verifyEmail")}</h2>
        <input
          type="text"
          placeholder={t("enterOtp")}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button onClick={verify}>{t("verify")}</button>
      </div>
    </div>
  );
};

export default VerifyEmail;
