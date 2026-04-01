import React, { useState, useEffect, useCallback } from "react";
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

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/quiz/module/${moduleId}`);
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching quizzes");
    } finally {
      setLoading(false);
    }
  }, [moduleId]);

  useEffect(() => {
    if (moduleId) fetchQuizzes();
  }, [moduleId, fetchQuizzes]);

  const handleSelect = (questionId, optionIndex) => {
    if (!submitted) {
      setAnswers({ ...answers, [questionId]: optionIndex });
    }
  };

  const submitQuiz = () => {
    let scoreCount = 0;
    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        if (answers[q._id] === q.correctIndex) scoreCount++;
      });
    });
    setScore(scoreCount);
    setSubmitted(true);
  };

  const totalQuestions = quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0);

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
                let className = "option-container";
                if (submitted) {
                  if (optIdx === q.correctIndex) className += " correct";
                  else if (answers[q._id] === optIdx) className += " wrong";
                }

                return (
                  <div key={optIdx} className={className} onClick={() => handleSelect(q._id, optIdx)}>
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
                <p className="correct-answer-text">
                  Correct Answer: {q.options[q.correctIndex]}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      {!submitted && (
        <button onClick={submitQuiz}>Submit Quiz</button>
      )}

      {score !== null && (
        <div className="quiz-score">
          Your Score: {score} / {totalQuestions}
        </div>
      )}
    </div>
  );
}

export default StudentQuiz;
