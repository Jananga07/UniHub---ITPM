import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css";
import { useParams } from "react-router-dom";
import "./StudentQuiz.css"

function StudentQuiz() {
  const { moduleId } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (moduleId) {
      fetchQuizzes();
    }
  }, [moduleId]);

  const fetchQuizzes = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5001/quiz/module/${moduleId}`
      );
      setQuizzes(res.data.quizzes);
    } catch (err) {
      console.error(err);
      alert("Error fetching quizzes");
    }
  };

  const handleSelect = (questionId, optionIndex) => {
    if (!submitted) {
      setAnswers({ ...answers, [questionId]: optionIndex });
    }
  };

  const submitQuiz = () => {
    let scoreCount = 0;

    quizzes.forEach((quiz) => {
      quiz.questions.forEach((q) => {
        const correctIndex =
          typeof q.correctIndex === "number"
            ? q.correctIndex
            : q.options.indexOf(q.correctAnswer);

        if (answers[q._id] === correctIndex) {
          scoreCount++;
        }
      });
    });

    setScore(scoreCount);
    setSubmitted(true);
  };

  return (
    <div className="quiz-container">
      <h2>Take Quiz</h2>

      {quizzes.map((quiz) => (
        <div key={quiz._id}>
          <h3>{quiz.quizName ?? quiz.title}</h3>

          {quiz.questions.map((q, idx) => {
            const correctIndex =
              typeof q.correctIndex === "number"
                ? q.correctIndex
                : q.options.indexOf(q.correctAnswer);
            const questionText = q.questionText ?? q.question;
            const correctAnswerText =
              q.correctAnswer ?? q.options?.[correctIndex];

            return (
              <div key={q._id} className="quiz-question">
                <p>
                  {idx + 1}. {questionText}
                </p>

                {q.options.map((opt, optIdx) => {
                  let className = "option-container";

                  if (submitted) {
                    if (optIdx === correctIndex) {
                      className += " correct";
                    } else if (
                      answers[q._id] === optIdx &&
                      optIdx !== correctIndex
                    ) {
                      className += " wrong";
                    }
                  }

                  return (
                    <div key={optIdx} className={className}>
                      <input
                        type="radio"
                        name={q._id}
                        checked={answers[q._id] === optIdx}
                        onChange={() =>
                          handleSelect(q._id, optIdx)
                        }
                        disabled={submitted}
                      />
                      <span>{opt}</span>
                    </div>
                  );
                })}

                {submitted && answers[q._id] !== correctIndex && (
                  <p className="correct-answer-text">
                    Correct Answer: {correctAnswerText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {!submitted && (
        <button onClick={submitQuiz}>Submit Quiz</button>
      )}

      {score !== null && (
        <div className="quiz-score">
          Your Score: {score}
        </div>
      )}
    </div>
  );
}

export default StudentQuiz;