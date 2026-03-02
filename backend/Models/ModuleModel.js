const mongoose = require("mongoose");

const ModuleSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true },
    moduleCode: { type: String, required: true },
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Quiz" }], // link quizzes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Module", ModuleSchema);