const mongoose = require("mongoose");

const MembershipSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    societyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Society",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    placeOfBirth: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String,
      required: true,
      trim: true,
    },
    cityCountry: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    membershipType: {
      type: String,
      required: true,
      enum: ["Regular", "Gold", "Platinum"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

MembershipSchema.index({ userId: 1, societyId: 1 }, { unique: true });

module.exports = mongoose.model("Membership", MembershipSchema);