import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

// ─── ADMIN AUTH MIDDLEWARE ───────────────────────
// Used by adminRoutes — checks token AND role === "admin"
const adminAuth = async (req, res, next) => {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token.",
      });
    }

    // ✅ Check admin role from DB (not just token)
    const user = await userModel.findById(decoded.id).select("-password");
    if (!user || user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    req.user = {
      id:   String(user._id),
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token expired or invalid. Please login again.",
    });
  }
};

export default adminAuth;