const express = require("express");
const router = express.Router();
const { addQuiz, getQuizzesByModule, deleteQuiz, getAvailableQuizzes } = require("../Controllers/QuizControllers");

router.post("/add", addQuiz);
router.get("/module/:moduleId", getQuizzesByModule);
router.delete("/:quizId", deleteQuiz);
router.get("/available/:studentId", getAvailableQuizzes);

module.exports = router;
