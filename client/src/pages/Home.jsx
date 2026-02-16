import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <>
      <div className="home-container">

        {/* HERO SECTION */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              🌾 {t("smartAgPlatform")}
            </div>
            
            <h1 className="hero-title">
              {t("welcome")}
            </h1>

            <p className="hero-description">
              {t("homeDescription")}
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">
                <span>{t("getStarted")}</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button className="secondary-btn">
                {t("learnMore")}
              </button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="hero-decoration hero-decoration-1"></div>
          <div className="hero-decoration hero-decoration-2"></div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features-section">
          <div className="section-header">
            <span className="section-label">{t("coreFeaturesLabel")}</span>
            <h2 className="section-title-main">{t("coreFeaturesTitle")}</h2>
            <p className="section-subtitle">{t("coreFeaturesSubtitle")}</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🌱</div>
              </div>
              <h3 className="feature-title">{t("featureBookingTitle")}</h3>
              <p className="feature-description">{t("featureBookingDesc")}</p>
              <div className="feature-arrow">→</div>
            </div>

            <div 
              className="feature-card feature-card-highlight"
              onClick={() => navigate('/book-service')}
              style={{ cursor: 'pointer' }}
            >
              <div className="feature-badge">{t("mostPopular")}</div>
              <div className="feature-icon-wrapper">
                <div className="feature-icon">🧪</div>
              </div>
              <h3 className="feature-title">{t("featureSoilAnalysisTitle")}</h3>
              <p className="feature-description">{t("featureSoilAnalysisDesc")}</p>
              <div className="feature-arrow">→</div>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <div className="feature-icon">📊</div>
              </div>
              <h3 className="feature-title">{t("featureRecommendationTitle")}</h3>
              <p className="feature-description">{t("featureRecommendationDesc")}</p>
              <div className="feature-arrow">→</div>
            </div>
          </div>
        </section>

        {/* FIELD SERVICES SECTION */}
        <section className="field-section">
          <div className="section-header">
            <span className="section-label">{t("fieldServicesLabel")}</span>
            <h2 className="section-title-main">{t("fieldServicesTitle")}</h2>
            <p className="section-subtitle">
              {t("fieldServicesSubtitle")}
            </p>
          </div>

          <div className="field-grid">
            <div className="field-card">
              <div className="field-icon-wrapper">
                <div className="field-icon">🌾</div>
              </div>
              <h3 className="field-title">{t("harvestingTitle")}</h3>
              <p className="field-description">{t("harvestingDesc")}</p>
              <ul className="field-features">
                <li>✓ {t("harvestingFeature1")}</li>
                <li>✓ {t("harvestingFeature2")}</li>
                <li>✓ {t("harvestingFeature3")}</li>
              </ul>
            </div>

            <div className="field-card">
              <div className="field-icon-wrapper">
                <div className="field-icon">🌱</div>
              </div>
              <h3 className="field-title">{t("seedingTitle")}</h3>
              <p className="field-description">{t("seedingDesc")}</p>
              <ul className="field-features">
                <li>✓ {t("seedingFeature1")}</li>
                <li>✓ {t("seedingFeature2")}</li>
                <li>✓ {t("seedingFeature3")}</li>
              </ul>
            </div>

            <div className="field-card">
              <div className="field-icon-wrapper">
                <div className="field-icon">🚜</div>
              </div>
              <h3 className="field-title">{t("landPrepTitle")}</h3>
              <p className="field-description">{t("landPrepDesc")}</p>
              <ul className="field-features">
                <li>✓ {t("landPrepFeature1")}</li>
                <li>✓ {t("landPrepFeature2")}</li>
                <li>✓ {t("landPrepFeature3")}</li>
              </ul>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">{t("stat1Number")}</div>
              <div className="stat-label">{t("stat1Label")}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{t("stat2Number")}</div>
              <div className="stat-label">{t("stat2Label")}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{t("stat3Number")}</div>
              <div className="stat-label">{t("stat3Label")}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">{t("stat4Number")}</div>
              <div className="stat-label">{t("stat4Label")}</div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section">
          <div className="cta-content">
            <h2 className="cta-title">{t("readyToImprove")}</h2>
            <p className="cta-description">{t("readyToImproveDesc")}</p>
            <button className="cta-btn">
              <span>{t("getStarted")}</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </section>

      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .home-container {
          min-height: 100vh;
          background: #ffffff;
          overflow-x: hidden;
        }

        /* HERO SECTION */
        .hero-section {
          position: relative;
          text-align: center;
          padding: 140px 24px 120px;
          background: linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%);
          overflow: hidden;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 14px;
          font-weight: 600;
          color: #166534;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          margin-bottom: 32px;
          animation: fadeInDown 0.6s ease-out;
        }

        .hero-title {
          font-size: clamp(40px, 5vw, 64px);
          font-weight: 800;
          color: #0f172a;
          max-width: 900px;
          margin: 0 auto;
          line-height: 1.15;
          letter-spacing: -0.02em;
          animation: fadeInUp 0.6s ease-out 0.1s backwards;
        }

        .hero-description {
          margin-top: 24px;
          font-size: clamp(16px, 2vw, 20px);
          color: #475569;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.6;
          animation: fadeInUp 0.6s ease-out 0.2s backwards;
        }

        .hero-buttons {
          margin-top: 48px;
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          animation: fadeInUp 0.6s ease-out 0.3s backwards;
        }

        .primary-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: white;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 16px rgba(22, 163, 74, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .primary-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .primary-btn:hover::before {
          left: 100%;
        }

        .primary-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(22, 163, 74, 0.4);
        }

        .primary-btn:active {
          transform: translateY(0);
        }

        .secondary-btn {
          background: white;
          color: #16a34a;
          border: 2px solid #e5e7eb;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .secondary-btn:hover {
          background: #f0fdf4;
          border-color: #16a34a;
          transform: translateY(-2px);
        }

        /* Hero Decorations */
        .hero-decoration {
          position: absolute;
          border-radius: 50%;
          opacity: 0.4;
          z-index: 1;
        }

        .hero-decoration-1 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #bbf7d0 0%, transparent 70%);
          top: -250px;
          right: -150px;
        }

        .hero-decoration-2 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #86efac 0%, transparent 70%);
          bottom: -150px;
          left: -100px;
        }

        /* SECTION HEADERS */
        .section-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .section-label {
          display: inline-block;
          color: #16a34a;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 16px;
        }

        .section-title-main {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .section-subtitle {
          font-size: 18px;
          color: #64748b;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* FEATURES SECTION */
        .features-section {
          padding: 100px 24px;
          background: white;
        }

        .features-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }

        .feature-card {
          position: relative;
          background: white;
          padding: 48px 32px;
          border-radius: 24px;
          border: 1px solid #e5e7eb;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #16a34a;
        }

        .feature-card-highlight {
          background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
          border: 2px solid #16a34a;
        }

        .feature-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          background: #16a34a;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .feature-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .feature-icon-wrapper {
          transform: scale(1.1) rotate(5deg);
        }

        .feature-icon {
          font-size: 40px;
        }

        .feature-title {
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .feature-description {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .feature-arrow {
          color: #16a34a;
          font-size: 24px;
          font-weight: 700;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s ease;
        }

        .feature-card:hover .feature-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* FIELD SECTION */
        .field-section {
          padding: 100px 24px;
          background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%);
        }

        .field-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 32px;
        }

        .field-card {
          background: white;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid #e5e7eb;
        }

        .field-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border-color: #16a34a;
        }

        .field-icon-wrapper {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          transition: transform 0.3s ease;
        }

        .field-card:hover .field-icon-wrapper {
          transform: scale(1.1) rotate(-5deg);
        }

        .field-icon {
          font-size: 40px;
        }

        .field-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 12px;
        }

        .field-description {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        .field-features {
          list-style: none;
          padding: 0;
        }

        .field-features li {
          padding: 8px 0;
          color: #475569;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* STATS SECTION */
        .stats-section {
          padding: 80px 24px;
          background: white;
        }

        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-around;
          align-items: center;
          flex-wrap: wrap;
          gap: 32px;
        }

        .stat-item {
          text-align: center;
          min-width: 150px;
        }

        .stat-number {
          font-size: clamp(36px, 4vw, 48px);
          font-weight: 800;
          color: #16a34a;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-divider {
          width: 1px;
          height: 60px;
          background: #e5e7eb;
        }

        /* CTA SECTION */
        .cta-section {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
          color: white;
          text-align: center;
          padding: 100px 24px;
          position: relative;
          overflow: hidden;
        }

        .cta-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .cta-content {
          position: relative;
          z-index: 1;
          max-width: 800px;
          margin: 0 auto;
        }

        .cta-title {
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.02em;
        }

        .cta-description {
          font-size: 18px;
          opacity: 0.95;
          margin-bottom: 40px;
          line-height: 1.6;
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: white;
          color: #16a34a;
          padding: 16px 40px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .cta-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
        }

        .cta-btn:active {
          transform: translateY(-1px);
        }

        /* ANIMATIONS */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* RESPONSIVE */
        @media (max-width: 992px) {
          .hero-section {
            padding: 100px 20px 80px;
          }

          .features-grid,
          .field-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .stats-grid {
            flex-direction: column;
          }

          .stat-divider {
            width: 60px;
            height: 1px;
          }

          .section-header {
            margin-bottom: 48px;
          }
        }

        @media (max-width: 640px) {
          .hero-buttons {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
            margin-left: auto;
            margin-right: auto;
          }

          .primary-btn,
          .secondary-btn {
            width: 100%;
            justify-content: center;
          }

          .feature-card,
          .field-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </>
  );
};

export default Home;