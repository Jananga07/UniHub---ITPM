const express = require("express");
const router = express.Router();
const complaintController = require("../Controllers/ComplaintController");

// GET all complaints with optional filters
router.get("/", complaintController.getAllComplaints);

// GET complaint by ID
router.get("/:id", complaintController.getComplaintById);

// POST new complaint
router.post("/", complaintController.createComplaint);

// PUT update complaint status
router.put("/:id/status", complaintController.updateComplaintStatus);

// DELETE complaint
router.delete("/:id", complaintController.deleteComplaint);

// GET complaint statistics
router.get("/stats", complaintController.getComplaintStats);

module.exports = router;
