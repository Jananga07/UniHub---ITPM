const express = require("express");
const router = express.Router();
const ModuleController = require("../Controllers/ModuleController");

// Add module (admin)
router.post("/", ModuleController.addModule);

// Get all modules
router.get("/", ModuleController.getModules);

//Get Module By ID
router.get("/:id", ModuleController.getModuleById);

// Fetch all modules with quizzes
router.get("/", ModuleController.getModulesWithQuizzes);

module.exports = router;