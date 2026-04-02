import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "./StudentQuiz.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function StudentQuiz() {
  const { moduleId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleId) return;
    setLoading(true);
    axios
      .get(`${API}/quiz/module/${moduleId}`)
      .then((res) => setQuizzes(res.data.quizzes || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [moduleId]);

  const handleSelect = (questionId, optionIndex) => {
    if (!submitted) setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const submitQuiz = async () => {
    let scoreCount = 0;
    let totalQ = 0;

    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        totalQ++;
        if (answers[q._id] === q.correctIndex) scoreCount++;
      });
    });

    setScore(scoreCount);
    setSubmitted(true);

    // Save each quiz attempt
    const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();
    if (user?._id) {
      for (const quiz of quizzes) {
        try {
          await axios.post(`${API}/student-quiz/submit`, {
            studentId: user._id,
            moduleId,
            quizId: quiz._id,
            score: scoreCount,
            totalQuestions: totalQ,
          });
        } catch (err) {
          console.error("Failed to save quiz attempt", err);
        }
      }
    }
  };

  const totalQuestions = quizzes.reduce((sum, q) => sum + q.questions.length, 0);

  if (loading) return <div className="quiz-container"><p>Loading quizzes...</p></div>;

  if (quizzes.length === 0) {
    return (
      <div className="quiz-container">
        <h2>Quiz</h2>
        <p style={{ color: "#888", textAlign: "center" }}>No quizzes available for this module yet.</p>
      </div>
    );
  }

  return (
    <div className="quiz-container">
      <h2>Take Quiz</h2>

      {quizzes.map((quiz) => (
        <div key={quiz._id}>
          <h3>{quiz.quizName}</h3>
          {quiz.questions.map((q, idx) => (
            <div key={q._id} className="quiz-question">
              <p>{idx + 1}. {q.questionText}</p>
              {q.options.map((opt, optIdx) => {
                let cls = "option-container";
                if (submitted) {
                  if (optIdx === q.correctIndex) cls += " correct";
                  else if (answers[q._id] === optIdx) cls += " wrong";
                }
                return (
                  <div key={optIdx} className={cls} onClick={() => handleSelect(q._id, optIdx)}>
                    <input
                      type="radio"
                      name={q._id}
                      checked={answers[q._id] === optIdx}
                      onChange={() => handleSelect(q._id, optIdx)}
                      disabled={submitted}
                    />
                    <span>{opt}</span>
                  </div>
                );
              })}
              {submitted && answers[q._id] !== q.correctIndex && (
                <p className="correct-answer-text">Correct Answer: {q.options[q.correctIndex]}</p>
              )}
            </div>
          ))}
        </div>
      ))}

      {!submitted && <button onClick={submitQuiz}>Submit Quiz</button>}

      {score !== null && (
        <div className="quiz-score">Your Score: {score} / {totalQuestions}</div>
      )}
    </div>
  );
}

export default StudentQuiz;
