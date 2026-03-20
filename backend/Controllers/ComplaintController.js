const Complaint = require("../Models/ComplaintModel");

// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    let filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (category && category !== 'all') {
      filter.category = category;
    }

    const complaints = await Complaint.find(filter)
      .populate('studentId', 'name email')
      .sort({ submittedDate: -1 });
    
    return res.status(200).json({ complaints });
  } catch (err) {
    console.error("Get complaints error:", err);
    return res.status(500).json({ message: "Error retrieving complaints" });
  }
};

// Get complaint by ID
const getComplaintById = async (req, res) => {
  const { id } = req.params;

  if (!id || id === "undefined") {
    return res.status(400).json({ message: "Invalid or missing ID" });
  }

  try {
    const complaint = await Complaint.findById(id)
      .populate('studentId', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({ complaint });
  } catch (err) {
    console.error("Get complaint by ID error:", err);
    return res.status(500).json({ message: "Error fetching complaint" });
  }
};

// Create new complaint
const createComplaint = async (req, res) => {
  const { title, description, category, urgency, contactEmail, contactPhone, studentId } = req.body;

  try {
    const newComplaint = new Complaint({
      title,
      description,
      category,
      urgency,
      contactEmail,
      contactPhone,
      studentId
    });

    await newComplaint.save();
    return res.status(201).json({ newComplaint });
  } catch (err) {
    console.error("Create complaint error:", err);
    return res.status(500).json({ message: "Error creating complaint" });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ message: "Missing complaint ID or status" });
  }

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        status,
        resolvedDate: status === 'resolved' ? new Date() : undefined
      },
      { new: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({ updatedComplaint });
  } catch (err) {
    console.error("Update complaint status error:", err);
    return res.status(500).json({ message: "Error updating complaint status" });
  }
};

// Delete complaint
const deleteComplaint = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Missing complaint ID" });
  }

  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(id);

    if (!deletedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    return res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete complaint error:", err);
    return res.status(500).json({ message: "Error deleting complaint" });
  }
};

// Get complaint statistics
const getComplaintStats = async (req, res) => {
  try {
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $group: null,
        total: { $sum: 1 }
      }
    ]);

    return res.status(200).json({ stats });
  } catch (err) {
    console.error("Get complaint stats error:", err);
    return res.status(500).json({ message: "Error retrieving complaint statistics" });
  }
};

module.exports = {
  getAllComplaints,
  getComplaintById,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats
};
