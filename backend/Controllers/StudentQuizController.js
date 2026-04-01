const StudentQuiz = require("../Models/StudentQuizModel");

const submitStudentQuiz = async (req, res) => {
  try {
    const { studentId, moduleId, quizId, score, totalQuestions } = req.body;

    if (!studentId || !moduleId || !quizId) {
      return res.status(400).json({ message: "studentId, moduleId, quizId are required" });
    }

    const newAttempt = new StudentQuiz({
      student: studentId,
      module: moduleId,
      quiz: quizId,
      score: score || 0,
      totalQuestions: totalQuestions || 0,
    });

    await newAttempt.save();
    res.status(201).json({ message: "Quiz submitted successfully", score: newAttempt.score });
  } catch (err) {
    console.error("submitStudentQuiz error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Leaderboard — top 10 students by total score
const getLeaderboard = async (req, res) => {
  try {
    // Group by student, sum scores
    const grouped = await StudentQuiz.aggregate([
      {
        $group: {
          _id: "$student",
          totalScore: { $sum: "$score" },
          attempts: { $sum: 1 },
        },
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 },
    ]);

    // Populate student names using mongoose
    const UserModel = require("../Models/User");
    const populated = await Promise.all(
      grouped.map(async (entry) => {
        const user = await UserModel.findById(entry._id).select("name gmail").lean();
        return {
          _id: entry._id,
          totalScore: entry.totalScore,
          attempts: entry.attempts,
          name: user?.name || "Unknown",
          gmail: user?.gmail || "",
        };
      })
    );

    res.status(200).json({ leaderboard: populated });
  } catch (err) {
    console.error("getLeaderboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get quiz history for a student, grouped by module
const getStudentQuizHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const ResourceModule = require("../Models/ResourceModuleModel");
    const Quiz = require("../Models/QuizModel");

    const attempts = await StudentQuiz.find({ student: studentId })
      .sort({ attemptedAt: -1 })
      .lean();

    // Group by module
    const moduleMap = {};
    for (const attempt of attempts) {
      const moduleId = attempt.module?.toString();
      if (!moduleMap[moduleId]) {
        const mod = await ResourceModule.findById(moduleId).select("moduleName moduleCode").lean();
        moduleMap[moduleId] = {
          moduleId,
          moduleName: mod?.moduleName || "Unknown Module",
          moduleCode: mod?.moduleCode || "",
          attempts: [],
        };
      }
      const quiz = await Quiz.findById(attempt.quiz).select("quizName").lean();
      moduleMap[moduleId].attempts.push({
        quizId: attempt.quiz,
        quizName: quiz?.quizName || "Quiz",
        score: attempt.score,
        totalQuestions: attempt.totalQuestions,
        attemptedAt: attempt.attemptedAt,
      });
    }

    res.status(200).json({ history: Object.values(moduleMap) });
  } catch (err) {
    console.error("getStudentQuizHistory error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitStudentQuiz, getLeaderboard, getStudentQuizHistory };
