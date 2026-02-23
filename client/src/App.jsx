import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar             from "./components/Navbar";
import ProtectedRoute     from "./components/ProtectedRoute";
import Home               from "./pages/Home";
import Register           from "./pages/Register";
import Login              from "./pages/Login";
import ForgotPassword     from "./pages/ForgotPassword";
import VerifyEmail        from "./pages/VerifyEmail";
import ExpertRegistration from "./pages/ExpertRegistration";
import ExpertForm         from "./pages/ExpertForm";
import ExpertDashboard    from "./pages/ExpertDashboard";   
import AdminDashboard     from "./pages/AdminDashboard";
import Profile            from "./pages/Profile";
import BookingPage        from "./pages/BookingPage";
import ChatPage           from "./pages/ChatPage";
import WeatherDashboard   from "./pages/WeatherDashboard";
import FarmerDashboard    from "./pages/FarmerDashboard.jsx";
import "./index.css";
import "./i18n";


// ── Placeholder pages ──────────────────────────────────────────────────────────

const NotFound = () => (
  <div style={placeholderStyle}>
    <div style={placeholderCard}>
      <div style={placeholderIcon}>
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#0f172a",
          margin: "0 0 8px",
        }}
      >
        Page Not Found
      </h2>
      <p style={{ fontSize: 14, color: "#64748b", margin: 0 }}>
        The page you are looking for does not exist.
      </p>
    </div>
  </div>
);


// ── Inline styles for placeholder pages ───────────────────────────────────────

const placeholderStyle = {
  minHeight: "80vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(160deg, #f0fdf4 0%, #ffffff 60%)",
  padding: "40px 24px",
};

const placeholderCard = {
  background: "white",
  borderRadius: 20,
  padding: "48px 40px",
  maxWidth: 420,
  width: "100%",
  textAlign: "center",
  boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
  border: "1px solid #e5e7eb",
};

const placeholderIcon = {
  width: 72,
  height: 72,
  background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
};


// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ── PUBLIC ─────────────────────────────────────────────────────── */}
        <Route path="/"                element={<Home />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />

        {/* ── ANY LOGGED-IN USER ─────────────────────────────────────────── */}
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/farmer-dashboard"
          element={<ProtectedRoute><FarmerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/book-service"
          element={<ProtectedRoute><BookingPage /></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />
        <Route
          path="/weather"
          element={<ProtectedRoute><WeatherDashboard /></ProtectedRoute>}
        />

        {/* ── EXPERT ONLY ────────────────────────────────────────────────── */}
        <Route
          path="/expert-dashboard"
          element={
            <ProtectedRoute allowedRoles={["expert"]}>
              <ExpertDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert-registration"
          element={
            <ProtectedRoute allowedRoles={["expert"]}>
              <ExpertRegistration />
            </ProtectedRoute>
          }
        />
        <Route
          path="/expert-form"
          element={
            <ProtectedRoute allowedRoles={["expert"]}>
              <ExpertForm />
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN ONLY ─────────────────────────────────────────────────── */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── FALLBACK ───────────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;