import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./Navbar.css";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem("token");
      const name = localStorage.getItem("userName");
      
      if (token) {
        setIsLoggedIn(true);
        setUserName(name || "User");
      } else {
        setIsLoggedIn(false);
        setUserName("");
      }
    };

    checkLoginStatus();

    // Listen for login/logout events
    window.addEventListener("userLoggedIn", checkLoginStatus);
    window.addEventListener("userLoggedOut", checkLoginStatus);
    window.addEventListener("storage", checkLoginStatus);

    return () => {
      window.removeEventListener("userLoggedIn", checkLoginStatus);
      window.removeEventListener("userLoggedOut", checkLoginStatus);
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return "U";
    const names = userName.split(" ");
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return userName.substring(0, 2).toUpperCase();
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    setIsLoggedIn(false);
    setUserName("");
    setShowDropdown(false);
    window.dispatchEvent(new Event("userLoggedOut"));
    navigate("/");
  };

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

        {!isLoggedIn ? (
          <Link to="/register" className="nav-btn">
            {t("signUp")}
          </Link>
        ) : (
          <div className="user-profile-container" ref={dropdownRef}>
            <button
              className="user-profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="user-avatar">
                {getUserInitials()}
              </div>
              <span className="user-name">{userName}</span>
              <svg 
                className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                width="12" 
                height="12" 
                viewBox="0 0 12 12" 
                fill="none"
              >
                <path 
                  d="M2.5 4.5L6 8L9.5 4.5" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showDropdown && (
              <div className="user-dropdown">
                <Link 
                  to="/bookings" 
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M2 3.5C2 2.67157 2.67157 2 3.5 2H12.5C13.3284 2 14 2.67157 14 3.5V12.5C14 13.3284 13.3284 14 12.5 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5Z" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    />
                    <path 
                      d="M2 6H14" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    />
                    <path 
                      d="M5 1V3" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M11 1V3" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  {t("viewBookings")}
                </Link>

                <Link 
                  to="/profile" 
                  className="dropdown-item"
                  onClick={() => setShowDropdown(false)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle 
                      cx="8" 
                      cy="5" 
                      r="2.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                    />
                    <path 
                      d="M3 13.5C3 11.0147 5.23858 9 8 9C10.7614 9 13 11.0147 13 13.5" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                  </svg>
                  {t("updateProfile")}
                </Link>

                <div className="dropdown-divider"></div>

                <button 
                  className="dropdown-item logout-item"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path 
                      d="M6 14H3.5C2.67157 14 2 13.3284 2 12.5V3.5C2 2.67157 2.67157 2 3.5 2H6" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round"
                    />
                    <path 
                      d="M11 11L14 8M14 8L11 5M14 8H6" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t("logout")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
