const path        = require("path");
const fs          = require("fs");
const Faculty      = require("../Models/FacultyModel");
const ResourceModule = require("../Models/ResourceModuleModel");
const PdfResource  = require("../Models/PdfResourceModel");

// ─── Default faculties seeded on first request ─────────────────────────────
const DEFAULT_FACULTIES = ["Computing", "Business", "Engineering", "Architecture"];

const seedDefaultFaculties = async () => {
  const count = await Faculty.countDocuments();
  if (count === 0) {
    await Faculty.insertMany(DEFAULT_FACULTIES.map((name) => ({ name })));
  }
};

// ─── FACULTY ────────────────────────────────────────────────────────────────

const getFaculties = async (req, res) => {
  try {
    await seedDefaultFaculties();
    const faculties = await Faculty.find().sort({ name: 1 });
    res.json({ faculties });
  } catch (err) {
    res.status(500).json({ message: "Error fetching faculties", error: err.message });
  }
};

const createFaculty = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Faculty name required" });
    const faculty = new Faculty({ name });
    await faculty.save();
    res.status(201).json({ faculty });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: "Faculty already exists" });
    res.status(500).json({ message: "Error creating faculty", error: err.message });
  }
};

const updateFaculty = async (req, res) => {
  try {
    const { name } = req.body;
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, { name }, { new: true });
    if (!faculty) return res.status(404).json({ message: "Faculty not found" });
    res.json({ faculty });
  } catch (err) {
    res.status(500).json({ message: "Error updating faculty", error: err.message });
  }
};

const deleteFaculty = async (req, res) => {
  try {
    await Faculty.findByIdAndDelete(req.params.id);
    res.json({ message: "Faculty deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting faculty", error: err.message });
  }
};

// ─── RESOURCE MODULES ───────────────────────────────────────────────────────

const getModules = async (req, res) => {
  try {
    const { faculty, year, semester, search } = req.query;
    const filter = {};
    if (faculty)  filter.faculty  = faculty;
    if (year)     filter.year     = Number(year);
    if (semester) filter.semester = Number(semester);
    if (search)   filter.moduleName = { $regex: search, $options: "i" };

    const modules = await ResourceModule.find(filter)
      .populate("faculty", "name")
      .sort({ moduleName: 1 });
    res.json({ modules });
  } catch (err) {
    res.status(500).json({ message: "Error fetching modules", error: err.message });
  }
};

const createModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, faculty, year, semester } = req.body;
    if (!moduleName || !faculty || !year || !semester)
      return res.status(400).json({ message: "moduleName, faculty, year, semester are required" });
    const mod = new ResourceModule({ moduleName, moduleCode, faculty, year: Number(year), semester: Number(semester) });
    await mod.save();
    const populated = await mod.populate("faculty", "name");
    res.status(201).json({ module: populated });
  } catch (err) {
    res.status(500).json({ message: "Error creating module", error: err.message });
  }
};

const updateModule = async (req, res) => {
  try {
    const { moduleName, moduleCode, faculty, year, semester } = req.body;
    const mod = await ResourceModule.findByIdAndUpdate(
      req.params.id,
      { moduleName, moduleCode, faculty, year: Number(year), semester: Number(semester) },
      { new: true }
    ).populate("faculty", "name");
    if (!mod) return res.status(404).json({ message: "Module not found" });
    res.json({ module: mod });
  } catch (err) {
    res.status(500).json({ message: "Error updating module", error: err.message });
  }
};

const deleteModule = async (req, res) => {
  try {
    await ResourceModule.findByIdAndDelete(req.params.id);
    res.json({ message: "Module deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting module", error: err.message });
  }
};

// ─── PDF RESOURCES ──────────────────────────────────────────────────────────

const getPdfs = async (req, res) => {
  try {
    const { module: moduleId, category, status } = req.query;
    const filter = {};
    if (moduleId) filter.module   = moduleId;
    if (category) filter.category = category;
    if (status)   filter.status   = status;

    const pdfs = await PdfResource.find(filter)
      .populate({ path: "module", populate: { path: "faculty", select: "name" } })
      .sort({ createdAt: -1 });
    res.json({ pdfs });
  } catch (err) {
    res.status(500).json({ message: "Error fetching PDFs", error: err.message });
  }
};

const uploadPdf = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF file uploaded" });

    const { title, module: moduleId, category, uploadedBy, adminUpload } = req.body;
    if (!title || !moduleId || !category)
      return res.status(400).json({ message: "title, module, and category are required" });

    const pdf = new PdfResource({
      title,
      module: moduleId,
      category,
      filePath: req.file.filename,        // just filename; served via /uploads static route
      fileName: req.file.originalname,
      uploadedBy: uploadedBy || "",
      // admin direct uploads are immediately approved
      status: adminUpload === "true" ? "approved" : "pending",
    });
    await pdf.save();
    res.status(201).json({ pdf });
  } catch (err) {
    res.status(500).json({ message: "Error uploading PDF", error: err.message });
  }
};

const approvePdf = async (req, res) => {
  try {
    const pdf = await PdfResource.findByIdAndUpdate(req.params.id, { status: "approved" }, { new: true });
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    res.json({ pdf });
  } catch (err) {
    res.status(500).json({ message: "Error approving PDF", error: err.message });
  }
};

const rejectPdf = async (req, res) => {
  try {
    const pdf = await PdfResource.findByIdAndUpdate(req.params.id, { status: "rejected" }, { new: true });
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    res.json({ pdf });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting PDF", error: err.message });
  }
};

const deletePdf = async (req, res) => {
  try {
    const pdf = await PdfResource.findByIdAndDelete(req.params.id);
    if (pdf) {
      // Remove file from disk
      const filePath = path.join(__dirname, "..", "uploads", pdf.filePath);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: "PDF deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting PDF", error: err.message });
  }
};

const downloadPdf = async (req, res) => {
  try {
    const pdf = await PdfResource.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });
    if (pdf.status !== "approved") return res.status(403).json({ message: "PDF not available" });

    // Increment counter
    pdf.downloadCount += 1;
    await pdf.save();

    const filePath = path.join(__dirname, "..", "uploads", pdf.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found on disk" });

    res.download(filePath, pdf.fileName);
  } catch (err) {
    res.status(500).json({ message: "Error downloading PDF", error: err.message });
  }
};

const ratePdf = async (req, res) => {
  try {
    const { rating, userId } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const pdf = await PdfResource.findById(req.params.id);
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    // If user already rated, update their rating; else push new
    if (userId) {
      const existing = pdf.ratings.find((r) => r.userId === userId);
      if (existing) {
        existing.rating = Number(rating);
      } else {
        pdf.ratings.push({ userId, rating: Number(rating) });
      }
    } else {
      pdf.ratings.push({ rating: Number(rating) });
    }

    await pdf.save();
    res.json({ pdf, averageRating: pdf.averageRating, ratingCount: pdf.ratings.length });
  } catch (err) {
    res.status(500).json({ message: "Error rating PDF", error: err.message });
  }
};

// ─── ANALYTICS ──────────────────────────────────────────────────────────────

const getAnalytics = async (req, res) => {
  try {
    const pdfs = await PdfResource.find({ status: "approved" })
      .select("title downloadCount ratings")
      .lean({ virtuals: true })
      .sort({ downloadCount: -1 });

    const totalDownloads = pdfs.reduce((sum, p) => sum + (p.downloadCount || 0), 0);

    const data = pdfs.map((p) => {
      const avg =
        p.ratings && p.ratings.length
          ? Math.round((p.ratings.reduce((s, r) => s + r.rating, 0) / p.ratings.length) * 10) / 10
          : 0;
      return {
        _id: p._id,
        title: p.title,
        downloadCount: p.downloadCount || 0,
        averageRating: avg,
        ratingCount: p.ratings ? p.ratings.length : 0,
      };
    });

    res.json({ totalDownloads, pdfs: data });
  } catch (err) {
    res.status(500).json({ message: "Error fetching analytics", error: err.message });
  }
};

module.exports = {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getModules,
  createModule,
  updateModule,
  deleteModule,
  getPdfs,
  uploadPdf,
  approvePdf,
  rejectPdf,
  deletePdf,
  downloadPdf,
  ratePdf,
  getAnalytics,
};
