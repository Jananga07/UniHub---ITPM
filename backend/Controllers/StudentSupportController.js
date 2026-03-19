const StudentSupport = require("../Models/StudentSupportModel");

// Get all available lecturers for consultation
const getAllLecturers = async (req, res) => {
  try {
    const lecturers = await StudentSupport.find({ available: true });
    if (!lecturers || lecturers.length === 0) {
      return res.status(404).json({ message: "No lecturers available for consultation" });
    }
    return res.status(200).json({ lecturers });
  } catch (err) {
    console.error("Fetch lecturers error:", err);
    return res.status(500).json({ message: "Error retrieving lecturers" });
  }
};

// Get lecturer by ID
const getLecturerById = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    const lecturer = await StudentSupport.findById(id);

    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    return res.status(200).json({ lecturer });
  } catch (err) {
    console.error("Get lecturer by ID error:", err);
    return res.status(500).json({ message: "Error fetching lecturer" });
  }
};

// Add new lecturer
const addLecturer = async (req, res) => {
  const { name, title, faculty, expertise, room, email, consultationHours, department } = req.body;

  try {
    const newLecturer = new StudentSupport({
      name,
      title,
      faculty,
      expertise,
      room,
      email,
      consultationHours,
      department,
    });

    await newLecturer.save();
    return res.status(201).json({ newLecturer });
  } catch (err) {
    console.error("Add lecturer error:", err);
    return res.status(500).json({ message: "Unable to add lecturer" });
  }
};

// Update lecturer availability
const updateAvailability = async (req, res) => {
  const { id } = req.params;
  const { available } = req.body;

  try {
    const updatedLecturer = await StudentSupport.findByIdAndUpdate(
      id,
      { available },
      { new: true }
    );

    if (!updatedLecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    return res.status(200).json({ updatedLecturer });
  } catch (err) {
    console.error("Update availability error:", err);
    return res.status(500).json({ message: "Error updating lecturer availability" });
  }
};

// Delete lecturer
const deleteLecturer = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedLecturer = await StudentSupport.findByIdAndDelete(id);

    if (!deletedLecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    return res.status(200).json({ message: "Lecturer deleted successfully" });
  } catch (err) {
    console.error("Delete lecturer error:", err);
    return res.status(500).json({ message: "Error deleting lecturer" });
  }
};

exports.getAllLecturers = getAllLecturers;
exports.getLecturerById = getLecturerById;
exports.addLecturer = addLecturer;
exports.updateAvailability = updateAvailability;
exports.deleteLecturer = deleteLecturer;
