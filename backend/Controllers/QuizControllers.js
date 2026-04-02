const Quiz = require("../Models/QuizModel");
const ResourceModule = require("../Models/ResourceModuleModel");

// Add quiz under a module
const addQuiz = async (req, res) => {
  try {
    const { moduleId, title, questions } = req.body;

    if (!moduleId || !title || !questions?.length) {
      return res.status(400).json({ message: "All fields required" });
    }

    const module = await ResourceModule.findById(moduleId);
    if (!module) return res.status(404).json({ message: "Module not found" });

    const newQuiz = new Quiz({
      module: moduleId,
      quizName: title,
      questions,
    });

    await newQuiz.save();
    res.status(201).json({ quiz: newQuiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all quizzes for a module
const getQuizzesByModule = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const quizzes = await Quiz.find({ module: moduleId });
    res.status(200).json({ quizzes });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all available (not yet attempted) quizzes for a student
const getAvailableQuizzes = async (req, res) => {
  try {
    const { studentId } = req.params;
    const StudentQuiz = require("../Models/StudentQuizModel");

    // Get all quiz IDs this student already attempted
    const attempts = await StudentQuiz.find({ student: studentId }).select("quiz module").lean();
    const attemptedModuleIds = new Set(attempts.map((a) => a.module?.toString()));

    // Get all quizzes
    const allQuizzes = await Quiz.find().lean();

    // Filter out quizzes whose module was already attempted
    const available = allQuizzes.filter(
      (q) => !attemptedModuleIds.has(q.module?.toString())
    );

    // Populate module names
    const populated = await Promise.all(
      available.map(async (q) => {
        const mod = await ResourceModule.findById(q.module).select("moduleName moduleCode").lean();
        return {
          _id: q._id,
          quizName: q.quizName,
          moduleId: q.module,
          moduleName: mod?.moduleName || "Unknown Module",
          moduleCode: mod?.moduleCode || "",
          questionCount: q.questions?.length || 0,
          createdAt: q.createdAt,
        };
      })
    );

    res.status(200).json({ quizzes: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a quiz
const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    await Quiz.findByIdAndDelete(quizId);
    res.status(200).json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addQuiz, getQuizzesByModule, deleteQuiz, getAvailableQuizzes };
