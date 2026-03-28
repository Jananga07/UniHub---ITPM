const mongoose = require("mongoose");
const Membership = require("../Models/MembershipModel");
const Society = require("../Models/SocietyModel");
const User = require("../Models/User");

const requiredFields = [
  "userId",
  "societyId",
  "fullName",
  "placeOfBirth",
  "dateOfBirth",
  "address",
  "nationality",
  "cityCountry",
  "gender",
  "email",
  "phone",
  "membershipType",
];

const createMembership = async (req, res) => {
  const payload = requiredFields.reduce((result, field) => {
    const value = req.body[field];
    result[field] = typeof value === "string" ? value.trim() : value;
    return result;
  }, {});

  const hasMissingField = requiredFields.some((field) => !payload[field]);

  if (hasMissingField) {
    return res.status(400).json({ message: "All required fields must be filled" });
  }

  if (!mongoose.Types.ObjectId.isValid(payload.userId) || !mongoose.Types.ObjectId.isValid(payload.societyId)) {
    return res.status(400).json({ message: "Invalid membership request" });
  }

  try {
    const [user, society, existingMembership] = await Promise.all([
      User.findById(payload.userId),
      Society.findById(payload.societyId),
      Membership.findOne({ userId: payload.userId, societyId: payload.societyId }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (existingMembership) {
      return res.status(409).json({ message: "Already registered" });
    }

    const membership = await Membership.create(payload);

    return res.status(201).json({
      message: "Membership submitted successfully",
      membership,
    });
  } catch (error) {
    console.error(error);

    if (error?.code === 11000) {
      return res.status(409).json({ message: "Already registered" });
    }

    return res.status(500).json({ message: "Failed to create membership" });
  }
};

module.exports = {
  createMembership,
};