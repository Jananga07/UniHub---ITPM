const mongoose = require("mongoose");

const CATEGORIES = ["Lecture Material", "Reading Material", "Short Notes", "Referral Sheets"];
const STATUSES   = ["pending", "approved", "rejected"];

const RatingSchema = new mongoose.Schema({
  userId: { type: String },       // store userId string (no strict ref needed)
  rating: { type: Number, min: 1, max: 5, required: true },
}, { _id: false });

const PdfResourceSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    module:     { type: mongoose.Schema.Types.ObjectId, ref: "ResourceModule", required: true },
    category:   { type: String, required: true, enum: CATEGORIES },
    filePath:   { type: String, required: true },   // relative path inside uploads/
    fileName:   { type: String, required: true },   // original file name (display)
    uploadedBy: { type: String },                   // userId string
    status:     { type: String, default: "pending", enum: STATUSES },
    downloadCount: { type: Number, default: 0 },
    ratings:    { type: [RatingSchema], default: [] },
  },
  { timestamps: true }
);

// Virtual: average rating
PdfResourceSchema.virtual("averageRating").get(function () {
  if (!this.ratings.length) return 0;
  const sum = this.ratings.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / this.ratings.length) * 10) / 10;
});

PdfResourceSchema.set("toObject", { virtuals: true });
PdfResourceSchema.set("toJSON",   { virtuals: true });

module.exports = mongoose.model("PdfResource", PdfResourceSchema);
