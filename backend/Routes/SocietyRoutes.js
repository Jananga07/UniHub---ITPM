const express = require("express");
const router = express.Router();
const SocietyController = require("../Controllers/SocietyController");

// Add society
router.post("/", SocietyController.addSociety);

//Get all societies
router.get("/", SocietyController.getAllSocieties);

// Get available club types
router.get("/club-types", SocietyController.getClubTypes);

// Get societies by club type
router.get("/type/:type", SocietyController.getSocietiesByType);

// Update society description
router.put("/:id", SocietyController.updateSociety);

// Delete society
router.delete("/:id", SocietyController.deleteSociety);

module.exports = router;