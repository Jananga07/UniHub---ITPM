const express = require("express");
const router = express.Router();
const { addQuiz, getQuizzesByModule } = require("../Controllers/QuizControllers");

router.post("/add", addQuiz); // Admin adds quiz
router.get("/module/:moduleId", getQuizzesByModule); // Fetch quizzes for a module

module.exports = router;