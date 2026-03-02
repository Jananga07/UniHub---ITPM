const Module = require("../Models/ModuleModel");

// Add new module (from admin)
const addModule = async (req, res) => {
  const { moduleName, moduleCode } = req.body;

  if (!moduleName || !moduleCode) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existing = await Module.findOne({ moduleCode });
    if (existing) {
      return res.status(400).json({ message: "Module code already exists" });
    }

    const newModule = new Module({ moduleName, moduleCode });
    await newModule.save();

    return res.status(201).json({ module: newModule });
  } catch (err) {
    console.error("Add module error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get all modules
const getModules = async (req, res) => {
  try {
    const modules = await Module.find().sort({ createdAt: -1 });
    return res.status(200).json({ modules });
  } catch (err) {
    console.error("Fetch modules error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getModuleById = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    res.status(200).json({ module });
  } catch (err) {
    res.status(500).json({ message: "Error fetching module" });
  }
};


//fetch a module along with its quizzes:
const getModulesWithQuizzes = async (req, res) => {
  try {
    const modules = await Module.find().populate("quizzes"); // populate quizzes
    res.status(200).json({ modules });
  } catch (err) {
    res.status(500).json({ message: "Error fetching modules", error: err });
  }
};

module.exports = { addModule, getModules, getModuleById, getModulesWithQuizzes };