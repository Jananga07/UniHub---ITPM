const express = require("express");
const router = express.Router();
const { submitStudentQuiz } = require("../Controllers/StudentQuizController");

router.post("/submit", submitStudentQuiz);

module.exports = router;