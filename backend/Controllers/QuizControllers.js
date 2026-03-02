const Quiz = require("../Models/QuizModel");
const Module = require("../Models/ModuleModel");

// Add quiz under module
const addQuiz = async (req, res) => {
  try {
    const { moduleId, title, questions } = req.body;

    if (!moduleId || !title || !questions?.length) {
      return res.status(400).json({ message: "All fields required" });
    }

    const module = await Module.findById(moduleId);
    if (!module)
      return res.status(404).json({ message: "Module not found" });

    const newQuiz = new Quiz({
      module: moduleId,
      quizName: title, // ✅ IMPORTANT FIX
      questions,
    });

    await newQuiz.save();

    // push quiz to module
    module.quizzes.push(newQuiz._id);
    await module.save();

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

module.exports = { addQuiz, getQuizzesByModule };