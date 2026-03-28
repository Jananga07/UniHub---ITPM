const mongoose = require("mongoose");
const Membership = require("../Models/MembershipModel");
const Society = require("../Models/SocietyModel");
const User = require("../Models/User");

const joinSociety = async (req, res) => {
  const userId = String(req.body.userId || "").trim();
  const societyId = String(req.body.societyId || "").trim();

  if (!userId || !societyId) {
    return res.status(400).json({ message: "userId and societyId are required" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(societyId)) {
    return res.status(400).json({ message: "Invalid membership request" });
  }

  try {
    const [user, society, existingMembership] = await Promise.all([
      User.findById(userId),
      Society.findById(societyId),
      Membership.findOne({ userId, societyId }),
    ]);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!society) {
      return res.status(404).json({ message: "Society not found" });
    }

    if (existingMembership) {
      return res.status(200).json({
        message: "Already joined",
        alreadyJoined: true,
        membership: existingMembership,
      });
    }

    const membership = await Membership.create({
      userId,
      societyId,
      status: "pending",
    });

    return res.status(201).json({
      message: "Successfully joined",
      alreadyJoined: false,
      membership,
    });
  } catch (error) {
    console.error(error);

    if (error?.code === 11000) {
      return res.status(200).json({ message: "Already joined", alreadyJoined: true });
    }

    return res.status(500).json({ message: "Failed to join society" });
  }
};

module.exports = {
  joinSociety,
};