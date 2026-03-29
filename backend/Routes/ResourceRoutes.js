const express  = require("express");
const router   = express.Router();
const path     = require("path");
const multer   = require("multer");
const ctrl     = require("../Controllers/ResourceController");

// ─── Multer storage config ─────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "..", "uploads");
    // Ensure uploads directory exists
    const fs = require("fs");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

// ─── Faculty routes ─────────────────────────────────────────────────────────
router.get("/faculties",        ctrl.getFaculties);
router.post("/faculties",       ctrl.createFaculty);
router.put("/faculties/:id",    ctrl.updateFaculty);
router.delete("/faculties/:id", ctrl.deleteFaculty);

// ─── Module routes ──────────────────────────────────────────────────────────
router.get("/modules",        ctrl.getModules);
router.post("/modules",       ctrl.createModule);
router.put("/modules/:id",    ctrl.updateModule);
router.delete("/modules/:id", ctrl.deleteModule);

// ─── PDF routes ─────────────────────────────────────────────────────────────
router.get("/pdfs",                    ctrl.getPdfs);
router.post("/pdfs/upload",            upload.single("file"), ctrl.uploadPdf);
router.put("/pdfs/:id/approve",        ctrl.approvePdf);
router.put("/pdfs/:id/reject",         ctrl.rejectPdf);
router.put("/pdfs/:id",                ctrl.updatePdf);
router.delete("/pdfs/:id",             ctrl.deletePdf);
router.get("/pdfs/:id/download",       ctrl.downloadPdf);
router.post("/pdfs/:id/rate",          ctrl.ratePdf);

// ─── Analytics ──────────────────────────────────────────────────────────────
router.get("/analytics", ctrl.getAnalytics);

module.exports = router;
