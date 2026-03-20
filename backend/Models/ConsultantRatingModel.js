const mongoose = require("mongoose");

const ConsultantRatingSchema = new mongoose.Schema({
  consultantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentSupport',
    required: true
  },
  consultantName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    trim: true
  },
  studentEmail: {
    type: String,
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("ConsultantRating", ConsultantRatingSchema);