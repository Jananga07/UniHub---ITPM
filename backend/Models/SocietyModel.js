const mongoose = require("mongoose");

const SocietySchema = new mongoose.Schema(
  {
    societyName: {
      type: String,
      required: true,
      trim: true,
      unique: true, // prevent duplicate societies
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Society", SocietySchema);