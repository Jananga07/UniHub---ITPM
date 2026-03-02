const Society = require("../Models/SocietyModel");

// Add new society
const addSociety = async (req, res) => {
  const { societyName, description, category, color, imageUrl } = req.body;

  if (!societyName || !description || !category) {
    return res.status(400).json({ message: "Society name, description, and category are required" });
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
      category,
      color: color || "#007bff",
      imageUrl: imageUrl || "",
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


module.exports = {
  addSociety,
  getAllSocieties,
};