import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./StudentQuiz.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function StudentQuiz() {
  const { moduleId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyAttempted, setAlreadyAttempted] = useState(false);

  const navigate = useNavigate("")

  // PIN gate
  const [pinVerified, setPinVerified] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");

  const user = (() => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } })();

  useEffect(() => {
    if (!moduleId) return;
    setLoading(true);

    const fetchData = async () => {
      try {
        const quizRes = await axios.get(`${API}/quiz/module/${moduleId}`);
        setQuizzes(quizRes.data.quizzes || []);

        if (user?._id) {
          const historyRes = await axios.get(`${API}/student-quiz/history/${user._id}`);
          const history = historyRes.data.history || [];
          const attempted = history.some((m) => m.moduleId === moduleId);
          setAlreadyAttempted(attempted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line
  }, [moduleId]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (!user?.pin) {
      setPinError("No PIN found. Please contact admin.");
      return;
    }
    if (pinInput.trim() === String(user.pin)) {
      setPinVerified(true);
      setPinError("");
    } else {
      setPinError("Incorrect PIN. Please try again.");
      setPinInput("");
    }
  };

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

  // Already attempted
  if (alreadyAttempted) {
    return (
      <div className="quiz-container" style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
        <h2>Already Completed</h2>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          You have already attempted the quiz for this module. Only one attempt is allowed.
        </p>
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <div className="quiz-container">
        <h2>Quiz</h2>
        <p style={{ color: "#888", textAlign: "center" }}>No quizzes available for this module yet.</p>
      </div>
    );
  }

  // PIN gate screen
  if (!pinVerified) {
    return (
      <div className="quiz-container" style={{ maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "48px" }}>🔐</div>
          <h2>Enter Your PIN</h2>
          <p style={{ color: "#64748b", fontSize: "14px" }}>
            Enter your unique quiz PIN to begin. You can find it in your student profile.
          </p>
        </div>

        <form onSubmit={handlePinSubmit}>
          <input
            type="password"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit PIN"
            value={pinInput}
            onChange={(e) => { setPinInput(e.target.value); setPinError(""); }}
            style={{
              display: "block",
              width: "100%",
              padding: "14px",
              fontSize: "22px",
              letterSpacing: "8px",
              textAlign: "center",
              border: pinError ? "2px solid #ef4444" : "2px solid #cbd5e1",
              borderRadius: "10px",
              marginBottom: "10px",
              outline: "none",
              boxSizing: "border-box",
            }}
            autoFocus
            required
          />
          {pinError && (
            <p style={{ color: "#ef4444", fontSize: "13px", textAlign: "center", marginBottom: "10px" }}>
              {pinError}
            </p>
          )}
          <button type="submit" style={{ width: "100%" }}>Start Quiz</button>
        </form>
      </div>
    );
  }

  // Quiz screen — no back/navigate options
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
        <div className="quiz-score">
          Your Score: {score} / {totalQuestions}
          <button onClick={() => navigate("/")}>Back To Home</button>
        </div>
      )}
    </div>
  );
}

export default StudentQuiz;
