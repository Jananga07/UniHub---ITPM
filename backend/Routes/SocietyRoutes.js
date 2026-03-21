const express = require("express");
const router = express.Router();
const SocietyController = require("../Controllers/SocietyController");

// Add society
router.post("/", SocietyController.addSociety);

//Get all societies
router.get("/", SocietyController.getAllSocieties);

// Delete society
router.delete("/:id", SocietyController.deleteSociety);

module.exports = router;