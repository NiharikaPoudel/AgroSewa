// config/multer.js
// Updated expertUpload to accept new field names (labCertificate, idProof)
// while keeping old field names for backward-compatibility.

import multer   from "multer";
import path     from "path";
import { fileURLToPath } from "url";
import fs       from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext  = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and PDF files are allowed."));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// expertUpload accepts:
//   NEW field names : labCertificate, idProof
//   OLD field names : educationCertificate, governmentCertificate, experienceCertificate
// Keeping old names means any legacy code / existing admin flows still work.
export const expertUpload = upload.fields([
  { name: "labCertificate",        maxCount: 1 },  // ← NEW primary
  { name: "idProof",               maxCount: 1 },  // ← unchanged
  { name: "educationCertificate",  maxCount: 1 },  // ← OLD (backward-compat)
  { name: "governmentCertificate", maxCount: 1 },  // ← OLD (backward-compat)
  { name: "experienceCertificate", maxCount: 1 },  // ← OLD (backward-compat)
]);

export default upload;