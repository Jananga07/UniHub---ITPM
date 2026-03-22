const Society = require("../Models/SocietyModel");
const User = require("../Models/User");

// Add new society
const addSociety = async (req, res) => {
  const { societyName, description } = req.body;

  if (!societyName || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if society already exists
    const existingSociety = await Society.findOne({ societyName });

    if (existingSociety) {
      return res.status(400).json({ message: "Society already exists" });
    }

    const newSociety = new Society({
      societyName,
      description,
    });

    await newSociety.save();

    res.status(201).json({
      message: "Society added successfully",
      society: newSociety,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
// Get all Societies
const getAllSocieties = async (req, res) => {
  try {
    const societies = await Society.find().sort({ createdAt: -1 }); // latest first
    res.status(200).json({ societies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
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
    res.status(500).json({ message: "Server error" });
  }
};

const updateSociety = async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description?.trim()) {
    return res.status(400).json({ message: "Description is required" });
  }

  try {
    const updatedSociety = await Society.findByIdAndUpdate(
      id,
      { description: description.trim() },
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  addSociety,
  getAllSocieties,
  deleteSociety,
  updateSociety,
};