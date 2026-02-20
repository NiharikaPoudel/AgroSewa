import ExpertApplication from "../models/ExpertApplication.js";
import userModel from "../models/usermodel.js";
import transporter from "../config/nodemailer.js";   // ✅ added

export const applyExpert = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      skills,
      labAddress,
      contactNumber,
    } = req.body;

    if (!skills || !labAddress || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check if already applied
    const existing = await ExpertApplication.findOne({ user: userId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You have already applied.",
      });
    }

    // Fetch the user so we have name & email for the application record and email
    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const parsedSkills = skills ? JSON.parse(skills) : [];

    const application = await ExpertApplication.create({
      user:                  userId,
      name:                  user.name,          // ✅ store name on application
      email:                 user.email,         // ✅ store email on application
      contactNumber,
      skills:                parsedSkills,
      labAddress,
      educationCertificate:  req.files?.educationCertificate?.[0]?.filename  || null,
      governmentCertificate: req.files?.governmentCertificate?.[0]?.filename || null,
      experienceCertificate: req.files?.experienceCertificate?.[0]?.filename || null,
      idProof:               req.files?.idProof?.[0]?.filename               || null,
    });

    // Update user expertStatus to pending
    await userModel.findByIdAndUpdate(userId, { expertStatus: "pending" });

    // ✅ Notify admin by email
    try {
      await transporter.sendMail({
        from:    process.env.SENDER_EMAIL,
        to:      process.env.ADMIN_EMAIL,
        subject: "AgroSewa — New Expert Application",
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
            padding:32px;border:1px solid #e5e7eb;border-radius:10px;">
            <h2 style="color:#2d8a4f;">New Expert Application 🔬</h2>
            <p style="color:#374151;">A new expert has applied and is waiting for your approval:</p>
            <table style="width:100%;border-collapse:collapse;margin:16px 0;">
              <tr>
                <td style="padding:8px;color:#6b7280;font-size:13px;">Name</td>
                <td style="padding:8px;color:#1f2937;font-weight:600;">${user.name}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:8px;color:#6b7280;font-size:13px;">Email</td>
                <td style="padding:8px;color:#1f2937;font-weight:600;">${user.email}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:#6b7280;font-size:13px;">Skills</td>
                <td style="padding:8px;color:#1f2937;font-weight:600;">${parsedSkills.join(", ")}</td>
              </tr>
              <tr style="background:#f9fafb;">
                <td style="padding:8px;color:#6b7280;font-size:13px;">Lab Address</td>
                <td style="padding:8px;color:#1f2937;font-weight:600;">${labAddress || "—"}</td>
              </tr>
              <tr>
                <td style="padding:8px;color:#6b7280;font-size:13px;">Contact</td>
                <td style="padding:8px;color:#1f2937;font-weight:600;">${contactNumber || "—"}</td>
              </tr>
            </table>
            <p style="color:#374151;">
              Please login to the Admin Dashboard to review and approve or reject this application.
            </p>
            <a
              href="${process.env.FRONTEND_URL || "http://localhost:5173"}/admin-dashboard"
              style="display:inline-block;margin-top:12px;padding:12px 24px;
              background:#2d8a4f;color:white;border-radius:8px;
              text-decoration:none;font-weight:600;"
            >
              Go to Admin Dashboard
            </a>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">AgroSewa Admin Panel</p>
          </div>
        `,
      });
    } catch (mailErr) {
      // Log but don't fail the request — application is already saved
      console.error("Admin notification mail failed:", mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message:
        "Application submitted successfully. You will receive an email once the admin reviews it.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};