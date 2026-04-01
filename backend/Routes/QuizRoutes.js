const express = require("express");
const router = express.Router();
const { addQuiz, getQuizzesByModule, deleteQuiz } = require("../Controllers/QuizControllers");

router.post("/add", addQuiz);
router.get("/module/:moduleId", getQuizzesByModule);
router.delete("/:quizId", deleteQuiz);

module.exports = router;
