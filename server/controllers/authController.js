import bcrypt      from "bcryptjs";
import jwt         from "jsonwebtoken";
import userModel   from "../models/usermodel.js";
import ExpertApplication from "../models/ExpertApplication.js";
import transporter from "../config/nodemailer.js";

/* ─────────────────────────────
   HELPERS
───────────────────────────── */
const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

const generateToken = (id, role, expiresIn = "7d") =>
  jwt.sign({ id: String(id), role }, process.env.JWT_SECRET, { expiresIn });

const baseEmailWrapper = (content) => `
  <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:560px;margin:auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
    <div style="background:#1a5c35;padding:28px 36px;">
      <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;letter-spacing:0.5px;">AgroSewa</h1>
      <p style="margin:4px 0 0;color:#a7f3c1;font-size:12px;letter-spacing:1px;text-transform:uppercase;">Smart Soil Testing & Booking System</p>
    </div>
    <div style="padding:36px;">
      ${content}
    </div>
    <div style="background:#f8fafc;padding:20px 36px;border-top:1px solid #e2e8f0;">
      <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
        This is an automated message from AgroSewa. Please do not reply directly to this email.
      </p>
      <p style="margin:6px 0 0;color:#94a3b8;font-size:11px;text-align:center;">
        &copy; ${new Date().getFullYear()} AgroSewa. All rights reserved.
      </p>
    </div>
  </div>
`;

const otpBlock = (otp) => `
  <div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:20px 40px;">
      <p style="margin:0 0 6px;color:#6b7280;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;">Your One-Time Password</p>
      <span style="font-size:36px;font-weight:700;letter-spacing:14px;color:#1a5c35;font-family:'Courier New',monospace;">
        ${otp}
      </span>
    </div>
  </div>
`;

const otpEmailHtml = (name, otp, title, note, expiry = "24 hours") =>
  baseEmailWrapper(`
    <h2 style="margin:0 0 8px;color:#1a5c35;font-size:18px;font-weight:600;">${title}</h2>
    <p style="color:#475569;font-size:14px;margin:0 0 24px;">Dear <strong style="color:#1e293b;">${name}</strong>, ${note}</p>
    ${otpBlock(otp)}
    <p style="color:#94a3b8;font-size:12px;text-align:center;margin:0;">
      This OTP expires in <strong>${expiry}</strong>. For your security, do not share this code with anyone.
    </p>
  `);

/* ─────────────────────────────
   REGISTER
───────────────────────────── */
export const register = async (req, res) => {
  try {
    const { name, email, password, role, labAddress, contactNumber } =
      req.body || {};

    if (!name || !email || !password || !role) {
      return res.json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const existing = await userModel.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      name:         name.trim(),
      email:        email.toLowerCase().trim(),
      password:     hashedPassword,
      role,
      authProvider: "local",
    };

    // ── FARMER ──
    if (role === "farmer") {
      const otp = generateOtp();
      userData.verifyOtp         = otp;
      userData.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

      const newUser = await userModel.create(userData);
      const token   = generateToken(newUser._id, newUser.role, "1d");

      try {
        await transporter.sendMail({
          from:    process.env.SENDER_EMAIL,
          to:      newUser.email,
          subject: "AgroSewa — Verify Your Email Address",
          html:    otpEmailHtml(
            name,
            otp,
            "Email Verification Required",
            "thank you for registering with AgroSewa. Please use the OTP below to verify your email address and activate your account."
          ),
        });
      } catch (mailErr) {
        console.error("OTP mail failed:", mailErr.message);
      }

      return res.json({
        success: true,
        token,
        message: "Registration successful. Please check your email for the verification OTP.",
      });
    }

    // ── EXPERT ──
    if (role === "expert") {
      if (!req.files?.educationCertificate || !req.files?.idProof) {
        return res.json({
          success: false,
          message: "Education certificate and ID proof are required.",
        });
      }

      if (!contactNumber || !contactNumber.trim()) {
        return res.json({
          success: false,
          message: "Contact number is required.",
        });
      }

      userData.expertStatus      = "pending";
      userData.isAccountVerified = true;

      const newUser = await userModel.create(userData);

      await ExpertApplication.create({
        user:                  newUser._id,
        name:                  name.trim(),
        email:                 email.toLowerCase().trim(),
        contactNumber:         contactNumber.trim(),
        labAddress:            labAddress || "",
        educationCertificate:  req.files?.educationCertificate?.[0]?.filename  || null,
        governmentCertificate: req.files?.governmentCertificate?.[0]?.filename || null,
        experienceCertificate: req.files?.experienceCertificate?.[0]?.filename || null,
        idProof:               req.files?.idProof?.[0]?.filename               || null,
        status:                "pending",
      });

      try {
        await transporter.sendMail({
          from:    process.env.SENDER_EMAIL,
          to:      process.env.ADMIN_EMAIL,
          subject: "AgroSewa — New Expert Application Received",
          html: baseEmailWrapper(`
            <h2 style="margin:0 0 8px;color:#1a5c35;font-size:18px;font-weight:600;">New Expert Application</h2>
            <p style="color:#475569;font-size:14px;margin:0 0 24px;">
              A new expert application has been submitted and is awaiting your review.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
              <tbody>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px 8px;color:#64748b;font-weight:500;width:40%;">Full Name</td>
                  <td style="padding:12px 8px;color:#1e293b;font-weight:600;">${name}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
                  <td style="padding:12px 8px;color:#64748b;font-weight:500;">Email Address</td>
                  <td style="padding:12px 8px;color:#1e293b;font-weight:600;">${email}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:12px 8px;color:#64748b;font-weight:500;">Contact Number</td>
                  <td style="padding:12px 8px;color:#1e293b;font-weight:600;">${contactNumber || "—"}</td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 8px;color:#64748b;font-weight:500;">Lab Address</td>
                  <td style="padding:12px 8px;color:#1e293b;font-weight:600;">${labAddress || "—"}</td>
                </tr>
              </tbody>
            </table>
            <p style="color:#475569;font-size:13px;margin:0 0 20px;">
              Please log in to the Admin Dashboard to review the submitted documents and approve or reject this application.
            </p>
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin-dashboard"
              style="display:inline-block;padding:12px 28px;background:#1a5c35;color:#ffffff;
              border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;letter-spacing:0.3px;">
              Go to Admin Dashboard
            </a>
          `),
        });
      } catch (mailErr) {
        console.error("Admin notification mail failed:", mailErr.message);
      }

      return res.json({
        success: true,
        message:
          "Your expert application has been submitted successfully. You will receive an email notification once the admin has reviewed your application.",
      });
    }

    return res.json({ success: false, message: "Invalid role." });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   VERIFY EMAIL (OTP)
───────────────────────────── */
export const verifyEmail = async (req, res) => {
  try {
    const userId  = req.user?.id;
    const { otp } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: "Session expired. Please register again.",
      });
    }

    if (!otp) {
      return res.json({ success: false, message: "OTP is required." });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found. Please register again.",
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Email already verified. Please login.",
      });
    }

    if (!user.verifyOtp || user.verifyOtp === "") {
      return res.json({
        success: false,
        message: "No OTP found. Please request a new one.",
      });
    }

    if (user.verifyOtp.trim() !== String(otp).trim()) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.verifyOtpExpireAt) {
      return res.json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp         = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    const fullToken = generateToken(user._id, user.role, "7d");

    return res.json({
      success: true,
      token: fullToken,
      user: {
        id:                user._id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        isAccountVerified: true,
      },
      message: "Email verified successfully. Welcome to AgroSewa.",
    });

  } catch (err) {
    console.error("VERIFY EMAIL ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   RESEND VERIFY OTP
───────────────────────────── */
export const sendVerifyOtp = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ success: false, message: "Not authorized." });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (user.isAccountVerified) {
      return res.json({ success: false, message: "Account already verified." });
    }

    const otp = generateOtp();
    user.verifyOtp         = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    try {
      await transporter.sendMail({
        from:    process.env.SENDER_EMAIL,
        to:      user.email,
        subject: "AgroSewa — New Verification OTP",
        html:    otpEmailHtml(
          user.name,
          otp,
          "New Verification OTP Requested",
          "a new OTP has been generated for your account verification. Please use the code below:"
        ),
      });
    } catch (mailErr) {
      console.error("Resend OTP mail failed:", mailErr.message);
    }

    return res.json({ success: true, message: "A new OTP has been sent to your email address." });

  } catch (err) {
    console.error("SEND VERIFY OTP ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   LOGIN
───────────────────────────── */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email.",
      });
    }

    if (!user.password) {
      return res.json({
        success: false,
        message: "This account uses Google login. Please sign in with Google.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Incorrect password." });
    }

    if (user.role === "farmer" && !user.isAccountVerified) {
      return res.json({
        success:     false,
        notVerified: true,
        message:
          "Your email address has not been verified. Please check your inbox and complete verification before logging in.",
      });
    }

    if (user.role === "expert") {
      if (user.expertStatus === "pending") {
        return res.json({
          success: false,
          message:
            "Your expert application is currently under review. You will receive an email notification once the admin has made a decision.",
        });
      }
      if (user.expertStatus === "rejected") {
        return res.json({
          success: false,
          message:
            "Your expert application was not approved. Please contact support for further assistance.",
        });
      }
    }

    const token = generateToken(user._id, user.role, "7d");

    return res.json({
      success: true,
      token,
      user: {
        id:                user._id,
        name:              user.name,
        email:             user.email,
        role:              user.role,
        isAccountVerified: user.isAccountVerified,
      },
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   LOGOUT
───────────────────────────── */
export const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res.json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   SEND RESET OTP
───────────────────────────── */
export const sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required." });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({
        success: false,
        message: "No account found with this email.",
      });
    }

    const otp = generateOtp();
    user.resetOtp         = otp;
    user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from:    process.env.SENDER_EMAIL,
      to:      user.email,
      subject: "AgroSewa — Password Reset Request",
      html:    otpEmailHtml(
        user.name,
        otp,
        "Password Reset Request",
        "we received a request to reset the password for your AgroSewa account. Use the OTP below to proceed. If you did not initiate this request, please disregard this email.",
        "15 minutes"
      ),
    });

    return res.json({ success: true, message: "A password reset OTP has been sent to your email." });

  } catch (err) {
    console.error("SEND RESET OTP ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   RESET PASSWORD
───────────────────────────── */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.json({
        success: false,
        message: "Email, OTP and new password are required.",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    if (!user.resetOtp || user.resetOtp.trim() !== String(otp).trim()) {
      return res.json({ success: false, message: "Invalid OTP." });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.json({ success: false, message: "OTP has expired." });
    }

    user.password         = await bcrypt.hash(newPassword, 10);
    user.resetOtp         = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "Your password has been reset successfully." });

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};


/* ─────────────────────────────
   IS AUTHENTICATED
───────────────────────────── */
export const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};