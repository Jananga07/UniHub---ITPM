const express = require("express");
const router = express.Router();
const { submitStudentQuiz, getLeaderboard, getStudentQuizHistory, getModuleAttemptCounts } = require("../Controllers/StudentQuizController");

router.post("/submit", submitStudentQuiz);
router.get("/leaderboard", getLeaderboard);
router.get("/history/:studentId", getStudentQuizHistory);
router.get("/module-attempts", getModuleAttemptCounts);

module.exports = router;
