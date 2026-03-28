const Society = require("../Models/SocietyModel");
const { CLUB_TYPES } = require("../Models/SocietyModel");
const User = require("../Models/User");

const normalizeClubType = (value = "") => {
  const normalizedValue = value.trim().toLowerCase();
  return CLUB_TYPES.find((type) => type.toLowerCase() === normalizedValue) || null;
};

const escapeRegex = (value = "") => ["\\", ".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]"]
  .reduce((result, character) => result.replaceAll(character, `\\${character}`), value);

const DUPLICATE_SOCIETY_MESSAGE = "Society already exists";

const handleSocietyError = (res, err, fallbackMessage) => {
  console.error(err);

  if (err?.code === 11000) {
    return res.status(409).json({ message: DUPLICATE_SOCIETY_MESSAGE });
  }

  return res.status(500).json({ message: fallbackMessage });
};

// Add new society
const addSociety = async (req, res) => {
  const name = (req.body.name || req.body.societyName || "").trim();
  const description = (req.body.description || "").trim();
  const clubType = normalizeClubType(req.body.clubType || "");

  if (!name || !description || !clubType) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingSociety = await Society.findOne({
      $or: [
        { name: { $regex: `^${escapeRegex(name)}$`, $options: "i" } },
        { societyName: { $regex: `^${escapeRegex(name)}$`, $options: "i" } },
      ],
    });

    if (existingSociety) {
      return res.status(409).json({ message: DUPLICATE_SOCIETY_MESSAGE });
    }

    const newSociety = new Society({
      name,
      description,
      clubType,
    });

    await newSociety.save();

    return res.status(201).json({
      message: "Society added successfully",
      society: newSociety,
    });

  } catch (err) {
    return handleSocietyError(res, err, "Failed to add society");
  }
};
// Get all Societies
const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ societies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch societies" });
  }
};

const getSocietiesByType = async (req, res) => {
  const clubType = normalizeClubType(req.params.type || "");

  if (!clubType) {
    return res.status(400).json({ message: "Invalid club type" });
  }

  try {
    const societies = await Society.find({ clubType }).sort({ createdAt: -1 });
    return res.status(200).json({ societies, clubType });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch societies" });
  }
};

const getClubTypes = (_req, res) => {
  const clubTypes = CLUB_TYPES.map((type) => ({
    value: type,
    label: type,
    slug: type.toLowerCase(),
  }));

  return res.status(200).json({ clubTypes });
};

const deleteSociety = async (req, res) => {
  const { id } = req.params;

  try {
    const assignedManager = await User.findOne({ role: "societyManager", societyId: id });

    if (assignedManager) {
      return res.status(400).json({
        message: "Cannot delete a society that already has an assigned manager",
      });
    }

    const deletedSociety = await Society.findByIdAndDelete(id);

    if (!deletedSociety) {
      return res.status(404).json({ message: "Society not found" });
    }

    res.status(200).json({ message: "Society deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete society" });
  }
};

const updateSociety = async (req, res) => {
  const { id } = req.params;
  const updates = {};

  if (typeof req.body.description === "string") {
    const description = req.body.description.trim();

    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    updates.description = description;
  }

  if (req.body.clubType !== undefined) {
    const clubType = normalizeClubType(req.body.clubType || "");

    if (!clubType) {
      return res.status(400).json({ message: "Valid club type is required" });
    }

    updates.clubType = clubType;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: "No valid updates provided" });
  }

  try {
    const updatedSociety = await Society.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedSociety) {
      return res.status(404).json({ message: "Society not found" });
    }

    res.status(200).json({
      message: "Society updated successfully",
      society: updatedSociety,
    });
  } catch (err) {
    return handleSocietyError(res, err, "Failed to update society");
  }
};


module.exports = {
  addSociety,
  getAllSocieties,
  getClubTypes,
  getSocietiesByType,
  deleteSociety,
  updateSociety,
};