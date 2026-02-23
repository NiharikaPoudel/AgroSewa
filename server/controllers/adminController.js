import userModel         from "../models/usermodel.js";
import ExpertApplication from "../models/ExpertApplication.js";
import transporter       from "../config/nodemailer.js";
import Notification      from "../models/Notification.js";

/* ─────────────────────────────
   GET PENDING EXPERTS
───────────────────────────── */
export const getPendingExperts = async (req, res) => {
  try {
    const applications = await ExpertApplication.find({ status: "pending" })
      .populate("user", "name email role expertStatus createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });

  } catch (err) {
    console.error("GET PENDING EXPERTS ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   GET ALL EXPERT APPLICATIONS
───────────────────────────── */
export const getExpertApplications = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const applications = await ExpertApplication.find(filter)
      .populate("user", "name email role expertStatus createdAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, applications });

  } catch (err) {
    console.error("GET APPLICATIONS ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   GET SINGLE APPLICATION
───────────────────────────── */
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await ExpertApplication.findById(id)
      .populate("user", "name email role expertStatus createdAt");

    if (!application) {
      return res.json({ success: false, message: "Application not found." });
    }

    return res.json({ success: true, application });

  } catch (err) {
    console.error("GET APPLICATION ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   APPROVE EXPERT
───────────────────────────── */
export const approveExpert = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await ExpertApplication.findById(applicationId);
    if (!application) {
      return res.json({ success: false, message: "Application not found." });
    }

    if (application.status === "approved") {
      return res.json({ success: false, message: "Already approved." });
    }

    application.status     = "approved";
    application.reviewedAt = new Date();
    await application.save();

    // Promote user + sync all expert fields from the application
    const user = await userModel.findByIdAndUpdate(
      application.user,
      {
        role:            "expert",
        expertStatus:    "approved",
        // Sync new expert profile fields
        profilePhoto:    application.profilePhoto    || null,
        experienceYears: application.experienceYears ?? null,
        labName:         application.labName         || "",
        labAddress:      application.labAddress      || "",
        labMunicipality: application.labMunicipality || "",
        labWard:         application.labWard         || "",
        labCertificate:  application.labCertificate  || null,
        idProof:         application.idProof         || null,
      },
      { new: true }
    );

    if (!user) {
      return res.json({ success: false, message: "User not found." });
    }

    // 🔔 In-app notification for the approved applicant (unchanged)
    try {
      await Notification.create({
        recipient: application.user,
        title:     "Application Approved 🎉",
        message:   "Congratulations! Your expert application has been approved. You can now login as an expert.",
        isRead:    false,
      });
    } catch (notifErr) {
      console.error("Approval notification failed:", notifErr.message);
    }

    // 📧 Email the expert — approved (unchanged)
    try {
      const emailTo = (application.email || "").trim();
      if (emailTo) {
        await transporter.sendMail({
          from:    `"AgroSewa System" <${process.env.SENDER_EMAIL}>`,
          to:      emailTo,
          subject: "🎉 AgroSewa — Your Expert Application is Approved!",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
              padding:32px;border:1px solid #e5e7eb;border-radius:10px;">
              <h2 style="color:#2d8a4f;">Congratulations! You're Approved 🎉</h2>
              <p style="color:#374151;">Hi <strong>${application.name}</strong>,</p>
              <p style="color:#374151;">
                Your expert application for <strong>AgroSewa</strong> has been
                <span style="color:#2d8a4f;font-weight:700;">approved</span>
                by our admin team.
              </p>
              <p style="color:#374151;">
                You can now login to your expert account and start offering
                your services to farmers.
              </p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login"
                  style="display:inline-block;padding:14px 32px;
                  background:#2d8a4f;color:white;border-radius:8px;
                  text-decoration:none;font-weight:600;font-size:15px;">
                  Login to Your Account
                </a>
              </div>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
              <p style="color:#9ca3af;font-size:12px;text-align:center;">
                AgroSewa — Smart Soil Testing &amp; Booking System
              </p>
            </div>
          `,
        });
      }
    } catch (mailErr) {
      console.error("Approval email failed:", mailErr.message);
    }

    return res.json({
      success: true,
      message: `${application.name} approved. Notification email sent.`,
    });

  } catch (err) {
    console.error("APPROVE EXPERT ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   REJECT EXPERT
───────────────────────────── */
export const rejectExpert = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { reason }        = req.body;

    const application = await ExpertApplication.findById(applicationId);
    if (!application) {
      return res.json({ success: false, message: "Application not found." });
    }

    if (application.status === "rejected") {
      return res.json({ success: false, message: "Already rejected." });
    }

    application.status     = "rejected";
    application.adminNote  = reason || "";
    application.reviewedAt = new Date();
    await application.save();

    await userModel.findByIdAndUpdate(application.user, {
      expertStatus: "rejected",
    });

    // 🔔 In-app notification for the rejected applicant (unchanged)
    try {
      await Notification.create({
        recipient: application.user,
        title:     "Application Update",
        message:   reason
          ? `Your expert application was not approved. Reason: ${reason}`
          : "Your expert application has been reviewed and was not approved at this time.",
        isRead:    false,
      });
    } catch (notifErr) {
      console.error("Rejection notification failed:", notifErr.message);
    }

    // 📧 Email the expert — rejected (unchanged)
    try {
      const emailTo = (application.email || "").trim();
      if (emailTo) {
        await transporter.sendMail({
          from:    `"AgroSewa System" <${process.env.SENDER_EMAIL}>`,
          to:      emailTo,
          subject: "AgroSewa — Expert Application Update",
          html: `
            <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;
              padding:32px;border:1px solid #e5e7eb;border-radius:10px;">
              <h2 style="color:#dc2626;">Application Not Approved</h2>
              <p style="color:#374151;">Hi <strong>${application.name}</strong>,</p>
              <p style="color:#374151;">
                Thank you for applying to be an expert on <strong>AgroSewa</strong>.
                After reviewing your application, we are unable to approve it at this time.
              </p>
              ${reason ? `
              <div style="padding:16px;background:#fef2f2;border:1px solid #fecaca;
                border-radius:8px;margin:16px 0;">
                <p style="margin:0;color:#dc2626;font-size:13px;font-weight:600;">Reason:</p>
                <p style="margin:8px 0 0;color:#374151;font-size:13px;">${reason}</p>
              </div>` : ""}
              <p style="color:#374151;">
                If you believe this is an error, please contact our support team.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
              <p style="color:#9ca3af;font-size:12px;text-align:center;">
                AgroSewa — Smart Soil Testing &amp; Booking System
              </p>
            </div>
          `,
        });
      }
    } catch (mailErr) {
      console.error("Rejection email failed:", mailErr.message);
    }

    return res.json({
      success: true,
      message: `${application.name} rejected. Notification email sent.`,
    });

  } catch (err) {
    console.error("REJECT EXPERT ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   GET ALL USERS
───────────────────────────── */
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel
      .find({}, "-password -verifyOtp -resetOtp -verifyOtpExpireAt -resetOtpExpireAt")
      .sort({ createdAt: -1 });

    return res.json({ success: true, users });

  } catch (err) {
    console.error("GET ALL USERS ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};

/* ─────────────────────────────
   GET DASHBOARD STATS
───────────────────────────── */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalExperts,
      pendingApplications,
      approvedExperts,
      rejectedExperts,
    ] = await Promise.all([
      userModel.countDocuments(),
      userModel.countDocuments({ role: "farmer" }),
      userModel.countDocuments({ role: "expert" }),
      ExpertApplication.countDocuments({ status: "pending" }),
      ExpertApplication.countDocuments({ status: "approved" }),
      ExpertApplication.countDocuments({ status: "rejected" }),
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalFarmers,
        totalExperts,
        pendingApplications,
        approvedExperts,
        rejectedExperts,
      },
    });

  } catch (err) {
    console.error("GET STATS ERROR:", err);
    return res.json({ success: false, message: err.message });
  }
};