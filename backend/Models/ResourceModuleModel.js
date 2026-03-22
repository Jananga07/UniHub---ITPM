const mongoose = require("mongoose");

// A module bound to a specific faculty + year + semester
const ResourceModuleSchema = new mongoose.Schema(
  {
    moduleName: { type: String, required: true, trim: true },
    moduleCode: { type: String, trim: true },
    faculty:    { type: mongoose.Schema.Types.ObjectId, ref: "Faculty", required: true },
    year:       { type: Number, required: true, enum: [1, 2, 3, 4] },
    semester:   { type: Number, required: true, enum: [1, 2] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ResourceModule", ResourceModuleSchema);
