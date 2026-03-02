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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String,
      default: "#007bff", // default bootstrap blue
    },
    imageUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Society", SocietySchema);