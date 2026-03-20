const mongoose = require("mongoose");

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['lecture_materials', 'club_events', 'others']
  },
  urgency: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'in_progress', 'resolved'],
    default: 'pending'
  },
  contactEmail: {
    type: String,
    trim: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedDate: {
    type: Date,
    default: Date.now
  },
  resolvedDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Complaint", ComplaintSchema);
