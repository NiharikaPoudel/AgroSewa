import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

const Navbar = () => {
  const { t, i18n } = useTranslation();

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        AgroSewa
      </Link>

      <div className="nav-right">
        <Link to="/expert-registration" className="nav-link">
          {t("becomeExpert")}
        </Link>

        <select
          value={i18n.language}
          onChange={(e) => i18n.changeLanguage(e.target.value)}
          className="language-select"
        >
          <option value="en">English</option>
          <option value="ne">नेपाली</option>
        </select>

        <Link to="/register" className="nav-btn">
          {t("signUp")}
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
