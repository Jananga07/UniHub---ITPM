const express = require("express");
const router = express.Router();
const consultantRatingController = require("../Controllers/ConsultantRatingController");

// GET all ratings with optional filters
router.get("/", consultantRatingController.getAllRatings);

// GET rating by ID
router.get("/:id", consultantRatingController.getRatingById);

// POST new rating
router.post("/", consultantRatingController.createRating);

// GET top rated consultants
router.get("/top", consultantRatingController.getTopConsultants);

// GET rating statistics
router.get("/stats", consultantRatingController.getRatingStats);

module.exports = router;
