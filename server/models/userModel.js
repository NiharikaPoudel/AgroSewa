import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["farmer", "expert", "admin"],
      default: "farmer",
    },
    expertStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
      sparse: true,
    },

    // Google / social profile picture URL (unchanged)
    picture: {
      type: String,
    },

    // ── Expert profile photo (uploaded file, stored in uploads/certificates) ──
    profilePhoto: {
      type: String,
      default: null,
    },

    // ── Shared: contact number for all roles ──
    contactNumber: {
      type: String,
      default: "",
    },

    // ── Expert fields ──
    skills: {
      type: [String],
      default: [],
    },

    // Years of professional experience
    experienceYears: {
      type: Number,
      default: null,
    },

    // Lab / Office name
    labName: {
      type: String,
      default: "",
    },

    // Full constructed address string (e.g. "Green Soil Lab, Kathmandu Metropolitan, Ward 5")
    labAddress: {
      type: String,
      default: "",
    },

    // Municipality component of lab address
    labMunicipality: {
      type: String,
      default: "",
    },

    // Ward component of lab address
    labWard: {
      type: String,
      default: "",
    },

    // Lab certificate (replaces educationCertificate for experts)
    labCertificate: {
      type: String,
      default: null,
    },

    // Citizenship / ID proof
    idProof: {
      type: String,
      default: null,
    },

    // ── Kept for backward-compatibility (existing data / other flows) ──
    educationCertificate: {
      type: String,
      default: null,
    },
    governmentCertificate: {
      type: String,
      default: null,
    },
    experienceCertificate: {
      type: String,
      default: null,
    },

    // OTP fields
    verifyOtp: {
      type: String,
      default: "",
    },
    verifyOtpExpireAt: {
      type: Number,
      default: 0,
    },
    resetOtp: {
      type: String,
      default: "",
    },
    resetOtpExpireAt: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;