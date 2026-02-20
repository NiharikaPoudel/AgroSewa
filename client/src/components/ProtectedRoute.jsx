import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token    = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    if (userRole === "admin")  return <Navigate to="/admin-dashboard"  replace />;
    if (userRole === "expert") return <Navigate to="/expert-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;