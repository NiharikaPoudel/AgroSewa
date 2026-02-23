import multer from "multer";
import path   from "path";
import fs     from "fs";

// Ensure upload folder exists
const uploadDir = "uploads/certificates";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG, PNG files are allowed."), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

// Fields for expert application
// NEW: labCertificate, idProof, profilePhoto
// OLD: educationCertificate, governmentCertificate, experienceCertificate (kept for backward-compat)
export const expertUpload = upload.fields([
  { name: "profilePhoto",          maxCount: 1 },
  { name: "labCertificate",        maxCount: 1 },
  { name: "idProof",               maxCount: 1 },
  { name: "educationCertificate",  maxCount: 1 },
  { name: "governmentCertificate", maxCount: 1 },
  { name: "experienceCertificate", maxCount: 1 },
]);

export default upload;