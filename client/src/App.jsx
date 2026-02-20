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
import AdminDashboard     from "./pages/AdminDashboard";
import Profile            from "./pages/Profile";
import BookingPage        from "./pages/BookingPage";
import ChatPage           from "./pages/ChatPage";
import WeatherDashboard   from "./pages/WeatherDashboard";
import "./index.css";
import "./i18n";

const ExpertDashboard = () => (
  <div style={{ padding: "40px" }}>
    <h1>🌾 Expert Dashboard</h1>
    <p>Welcome, Agriculture Expert.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>

        {/* ── PUBLIC ── */}
        <Route path="/"                element={<Home />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/login"           element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email"    element={<VerifyEmail />} />

        {/* ── ANY LOGGED-IN USER ── */}
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        }/>
        <Route path="/book-service" element={
          <ProtectedRoute><BookingPage /></ProtectedRoute>
        }/>
        <Route path="/chat" element={
          <ProtectedRoute><ChatPage /></ProtectedRoute>
        }/>
        <Route path="/weather" element={
          <ProtectedRoute><WeatherDashboard /></ProtectedRoute>
        }/>

        {/* ── EXPERT ONLY ── */}
        <Route path="/expert-dashboard" element={
          <ProtectedRoute allowedRoles={["expert"]}>
            <ExpertDashboard />
          </ProtectedRoute>
        }/>
        <Route path="/expert-registration" element={
          <ProtectedRoute allowedRoles={["expert"]}>
            <ExpertRegistration />
          </ProtectedRoute>
        }/>
        <Route path="/expert-form" element={
          <ProtectedRoute allowedRoles={["expert"]}>
            <ExpertForm />
          </ProtectedRoute>
        }/>

        {/* ── ADMIN ONLY ── */}
        <Route path="/admin-dashboard" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;