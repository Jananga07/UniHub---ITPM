const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faculty", FacultySchema);
