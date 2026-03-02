const StudentQuiz = require("../Models/StudentQuizModel");

const submitStudentQuiz = async (req, res) => {
  try {
    const { studentId, moduleId, quizId, answers } = req.body;

    if (!studentId || !moduleId || !quizId || !answers) {
      return res.status(400).json({ message: "All fields required" });
    }

    const score = answers.filter(
      (a) => a.selectedOption === a.correctAnswer
    ).length;

    const newAttempt = new StudentQuiz({
      student: studentId,
      module: moduleId,
      quiz: quizId,
      answers,
      score,
    });

    await newAttempt.save();

    res.status(201).json({ message: "Quiz submitted successfully", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { submitStudentQuiz };