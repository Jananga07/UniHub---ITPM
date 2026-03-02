const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema(
  {
    module: { type: mongoose.Schema.Types.ObjectId, ref: "Module", required: true }, // link to module
    quizName: { type: String, required: true }, // e.g., Quiz 1, Quiz 2
    questions: [
      {
        questionText: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctIndex: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", QuizSchema);