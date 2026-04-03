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

// Rate lecturer
const rateLecturer = async (req, res) => {
  const { id } = req.params;
  const { rating, feedback, studentEmail, studentName } = req.body;

  try {
    const lecturer = await StudentSupport.findById(id);
    if (!lecturer) {
      return res.status(404).json({ message: "Lecturer not found" });
    }

    const newTotalStars = (lecturer.totalStars || 0) + Number(rating);
    const newNumberOfReviews = (lecturer.numberOfReviews || 0) + 1;
    const newAverageRating = newTotalStars / newNumberOfReviews;

    const updatedLecturer = await StudentSupport.findByIdAndUpdate(
      id,
      { 
        totalStars: newTotalStars, 
        numberOfReviews: newNumberOfReviews, 
        averageRating: parseFloat(newAverageRating.toFixed(1)) 
      },
      { new: true }
    );

    // Save to ConsultantRating history (optional based on schema but keeps history)
    const ConsultantRating = require("../Models/ConsultantRatingModel");
    const newRatingDoc = new ConsultantRating({
      consultantId: id,
      consultantName: lecturer.name,
      rating,
      feedback,
      studentEmail,
      studentName
    });
    await newRatingDoc.save();

    return res.status(200).json({ message: "Rating saved successfully", updatedLecturer });
  } catch (err) {
    console.error("Rate lecturer error:", err);
    return res.status(500).json({ message: "Error rating lecturer" });
  }
};

// Get Top Consultants
const getTopConsultants = async (req, res) => {
  try {
    const topConsultants = await StudentSupport.find()
      .sort({ averageRating: -1 })
      .limit(3);
      
    return res.status(200).json({ topConsultants });
  } catch (err) {
    console.error("Get top consultants error:", err);
    return res.status(500).json({ message: "Error retrieving top consultants" });
  }
};

exports.getAllLecturers = getAllLecturers;
exports.getLecturerById = getLecturerById;
exports.addLecturer = addLecturer;
exports.updateAvailability = updateAvailability;
exports.deleteLecturer = deleteLecturer;
exports.rateLecturer = rateLecturer;
exports.getTopConsultants = getTopConsultants;

