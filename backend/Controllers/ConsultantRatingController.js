const ConsultantRating = require("../Models/ConsultantRatingModel");

// Get all consultant ratings
const getAllRatings = async (req, res) => {
  try {
    const { consultantId } = req.query;
    let filter = {};
    
    if (consultantId) {
      filter.consultantId = consultantId;
    }

    const ratings = await ConsultantRating.find(filter)
      .populate('consultantId', 'name faculty')
      .sort({ date: -1 });
    
    return res.status(200).json({ ratings });
  } catch (err) {
    console.error("Get ratings error:", err);
    return res.status(500).json({ message: "Error retrieving ratings" });
  }
};

// Get rating by ID
const getRatingById = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    const rating = await ConsultantRating.findById(id)
      .populate('consultantId', 'name faculty');

    if (!rating) {
      return res.status(404).json({ message: "Rating not found" });
    }

    return res.status(200).json({ rating });
  } catch (err) {
    console.error("Get rating by ID error:", err);
    return res.status(500).json({ message: "Error fetching rating" });
  }
};

// Create new rating
const createRating = async (req, res) => {
  const { consultantId, consultantName, rating, feedback, studentEmail, studentName } = req.body;

  try {
    const newRating = new ConsultantRating({
      consultantId,
      consultantName,
      rating,
      feedback,
      studentEmail,
      studentName
    });

    await newRating.save();
    
    // Update consultant's average rating
    const ConsultantSupport = require("../Models/StudentSupportModel");
    const allRatings = await ConsultantRating.find({ consultantId });
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    
    await ConsultantSupport.findByIdAndUpdate(consultantId, { 
      rating: parseFloat(avgRating.toFixed(1)),
      totalRatings: allRatings.length 
    });

    return res.status(201).json({ newRating });
  } catch (err) {
    console.error("Create rating error:", err);
    return res.status(500).json({ message: "Error creating rating" });
  }
};

// Get top rated consultants
const getTopConsultants = async (req, res) => {
  try {
    const topConsultants = await ConsultantRating.aggregate([
      {
        $group: {
          _id: '$consultantId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'studentsupports',
          localField: '_id',
          foreignField: '_id',
          as: 'consultant'
        }
      },
      {
        $unwind: '$consultant'
      },
      {
        $sort: { avgRating: -1 }
      },
      {
        $limit: 10
      }
    ]);

    return res.status(200).json({ topConsultants });
  } catch (err) {
    console.error("Get top consultants error:", err);
    return res.status(500).json({ message: "Error retrieving top consultants" });
  }
};

// Get rating statistics
const getRatingStats = async (req, res) => {
  try {
    const stats = await ConsultantRating.aggregate([
      {
        $group: {
          _id: '$consultantId',
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      {
        $group: null,
        totalRatings: { $sum: 1 },
        avgOverallRating: { $avg: '$rating' }
      }
    ]);

    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Get rating stats error:", err);
    return res.status(500).json({ message: "Error retrieving rating statistics" });
  }
};

module.exports = {
  getAllRatings,
  getRatingById,
  createRating,
  getTopConsultants,
  getRatingStats
};