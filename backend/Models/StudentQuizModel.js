const mongoose = require("mongoose");

const StudentQuizSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Module",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  answers: [
    {
      question: String,
      selectedOption: String,
      correctAnswer: String,
    },
  ],
  score: Number,
  attemptedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StudentQuiz", StudentQuizSchema);