const express = require("express");
const router = express.Router();
const consultantBookingController = require("../Controllers/ConsultantBookingController");

// GET all bookings with optional filters
router.get("/", consultantBookingController.getAllBookings);

// GET booking by ID
router.get("/:id", consultantBookingController.getBookingById);

// POST new booking
router.post("/", consultantBookingController.createBooking);

// PUT update booking status
router.put("/:id/status", consultantBookingController.updateBookingStatus);

// DELETE booking
router.delete("/:id", consultantBookingController.deleteBooking);

// GET booking statistics
router.get("/stats", consultantBookingController.getBookingStats);

module.exports = router;
