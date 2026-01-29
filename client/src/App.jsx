import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyEmail from "./pages/VerifyEmail";
import ExpertRegistration from "./pages/ExpertRegistration"; // Expert info page
import ExpertForm from "./pages/ExpertForm"; // Actual form page
import "./index.css";

// Import i18n configuration
import "./i18n";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/expert-registration" element={<ExpertRegistration />} />
        <Route path="/expert-form" element={<ExpertForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
