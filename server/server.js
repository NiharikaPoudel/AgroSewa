import express      from "express";
import cors         from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";
import session      from "express-session";
import passport     from "passport";
import jwt          from "jsonwebtoken";
import path         from "path";
import { fileURLToPath } from "url";

import connectDB    from "./config/mongodb.js";
import authRouter   from "./routes/authRoutes.js";
import userRouter   from "./routes/userRoutes.js";
import chatRouter   from "./routes/chatRoutes.js";
import weatherRouter from "./routes/weatherRoutes.js";
import adminRouter  from "./routes/adminRoutes.js";
import User         from "./models/usermodel.js";
import "./auth/google.js";

const app  = express();
const port = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ══════════════════════════════
   DATABASE
══════════════════════════════ */
connectDB();

/* ══════════════════════════════
   MIDDLEWARE
══════════════════════════════ */
app.use(
  cors({
    origin:      process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  session({
    secret:            process.env.SESSION_SECRET || "agrosewa_secret",
    resave:            false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Serve uploaded certificate files statically
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

/* ══════════════════════════════
   API ROUTES
══════════════════════════════ */
app.use("/api/auth",    authRouter);
app.use("/api/user",    userRouter);
app.use("/api/chat",    chatRouter);
app.use("/api/weather", weatherRouter);
app.use("/api/admin",   adminRouter);

/* ══════════════════════════════
   HEALTH CHECK
══════════════════════════════ */
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "AgroSewa API Running 🚀" });
});

/* ══════════════════════════════
   GOOGLE OAUTH
══════════════════════════════ */
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const googleProfile = req.user;
      const email         = googleProfile.emails[0].value;

      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          name:              googleProfile.displayName,
          email,
          googleId:          googleProfile.id,
          picture:           googleProfile.photos?.[0]?.value,
          authProvider:      "google",
          isAccountVerified: true,
          role:              "farmer",
          expertStatus:      "none",
        });
      } else if (!user.googleId) {
        user.googleId          = googleProfile.id;
        user.picture           = googleProfile.photos?.[0]?.value;
        user.authProvider      = "google";
        user.isAccountVerified = true;
        await user.save();
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(
        `${frontendUrl}/login?token=${token}&name=${encodeURIComponent(user.name)}&role=${user.role}`
      );

    } catch (err) {
      console.error("Google OAuth Error:", err);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      res.redirect(`${frontendUrl}/login?error=google_login_failed`);
    }
  }
);

/* ══════════════════════════════
   GLOBAL ERROR HANDLER
══════════════════════════════ */
app.use((err, req, res, next) => {
  console.error("🔥 SERVER ERROR:", err);

  // Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 5MB.",
    });
  }

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

/* ══════════════════════════════
   START
══════════════════════════════ */
app.listen(port, () =>
  console.log(`🚀 AgroSewa Server running on PORT ${port}`)
);