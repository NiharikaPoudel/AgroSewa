import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./ExpertRegistration.css";

const ExpertRegistration = () => {
  const { t } = useTranslation();

  return (
    <div className="expert-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-left">
          <h1>{t("expertHeroTitle")}</h1>
          <p>{t("expertHeroDesc")}</p>
        </div>
        <div className="hero-right">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2910/2910761.png"
            alt="Soil Expert"
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section section-card">
        <h2>{t("expertHowTitle")}</h2>
        <ul>
          <li>1️⃣ {t("expertHow1")}</li>
          <li>2️⃣ {t("expertHow2")}</li>
          <li>3️⃣ {t("expertHow3")}</li>
          <li>4️⃣ {t("expertHow4")}</li>
          <li>5️⃣ {t("expertHow5")}</li>
        </ul>
      </section>

      {/* Benefits */}
      <section className="benefits-section section-card">
        <h2>{t("expertBenefitsTitle")}</h2>
        <ul>
          <li>🔁 {t("expertBenefit1")}</li>
          <li>💰 {t("expertBenefit2")}</li>
          <li>🛡️ {t("expertBenefit3")}</li>
          <li>🎓 {t("expertBenefit4")}</li>
          <li>🛠️ {t("expertBenefit5")}</li>
          <li>🚀 {t("expertBenefit6")}</li>
        </ul>
      </section>

      {/* Who Can Join */}
      <section className="who-section section-card">
        <h2>{t("expertWhoTitle")}</h2>
        <ul>
          <li>✅ {t("expertWho1")}</li>
          <li>✅ {t("expertWho2")}</li>
          <li>✅ {t("expertWho3")}</li>
        </ul>
      </section>

      {/* FAQs */}
      <section className="faq-section section-card">
        <h2>{t("expertFaqTitle")}</h2>
        <ul>
          <li>
            <strong>{t("expertFaqQ1")}</strong> {t("expertFaqA1")}
          </li>
          <li>
            <strong>{t("expertFaqQ2")}</strong> {t("expertFaqA2")}
          </li>
          <li>
            <strong>{t("expertFaqQ3")}</strong> {t("expertFaqA3")}
          </li>
          <li>
            <strong>{t("expertFaqQ4")}</strong> {t("expertFaqA4")}
          </li>
        </ul>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <Link to="/expert-form" className="join-btn">
          {t("expertJoinNow")}
        </Link>
      </section>

    </div>
  );
};

export default ExpertRegistration;
