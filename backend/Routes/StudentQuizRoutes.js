const express = require("express");
const router = express.Router();
const { submitStudentQuiz, getLeaderboard, getStudentQuizHistory } = require("../Controllers/StudentQuizController");

router.post("/submit", submitStudentQuiz);
router.get("/leaderboard", getLeaderboard);
router.get("/history/:studentId", getStudentQuizHistory);

module.exports = router;
