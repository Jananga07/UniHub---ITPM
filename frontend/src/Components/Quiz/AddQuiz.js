import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./Quiz.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function AddQuiz() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/resources/modules`)
      .then((res) => {
        const mods = res.data.modules || [];
        setModules(mods);
        if (mods.length > 0) setSelectedModule(mods[0]._id);
      })
      .catch((err) => console.error("Error fetching modules", err));
  }, []);

  const fetchQuizzes = async (moduleId) => {
    if (!moduleId) return;
    try {
      const res = await axios.get(`${API}/quiz/module/${moduleId}`);
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error("Error fetching quizzes", err);
    }
  };

  useEffect(() => {
    fetchQuizzes(selectedModule);
    // eslint-disable-next-line
  }, [selectedModule]);

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index].question = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const updated = [...questions];
    updated[qIndex].correctAnswer = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const submitQuiz = async () => {
    if (!quizTitle.trim() || !selectedModule) {
      alert("Please select a module and enter a quiz title");
      return;
    }

    for (let q of questions) {
      if (!q.question.trim() || q.options.some((o) => !o.trim()) || !q.correctAnswer.trim()) {
        alert("Please fill all question fields and correct answers");
        return;
      }
      if (!q.options.includes(q.correctAnswer)) {
        alert(`Correct answer must exactly match one of the options for: "${q.question}"`);
        return;
      }
    }

    const formattedQuestions = questions.map((q) => ({
      questionText: q.question,
      options: q.options,
      correctIndex: q.options.indexOf(q.correctAnswer),
    }));

    try {
      setLoading(true);
      await axios.post(`${API}/quiz/add`, {
        moduleId: selectedModule,
        title: quizTitle,
        questions: formattedQuestions,
      });
      alert("Quiz added successfully!");
      setQuizTitle("");
      setQuestions([{ question: "", options: ["", "", "", ""], correctAnswer: "" }]);
      fetchQuizzes(selectedModule);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding quiz");
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!window.confirm("Delete this quiz?")) return;
    try {
      await axios.delete(`${API}/quiz/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      alert("Error deleting quiz");
    }
  };

  const selectedModuleName = modules.find((m) => m._id === selectedModule)?.moduleName || "";

  return (
    <div className="quiz-container">
      <h2>Add Quiz (Admin)</h2>

      <label>Select Module:</label>
      <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
        {modules.length === 0 && <option value="">No modules available</option>}
        {modules.map((m) => (
          <option key={m._id} value={m._id}>
            {m.moduleName} {m.moduleCode ? `(${m.moduleCode})` : ""}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Quiz Title (e.g. Quiz 1 - Chapter 3)"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {questions.map((q, idx) => (
        <div key={idx} className="quiz-question">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Question {idx + 1}</strong>
            {questions.length > 1 && (
              <button
                onClick={() => removeQuestion(idx)}
                style={{ background: "#dc3545", width: "auto", padding: "4px 10px", fontSize: "13px" }}
              >
                Remove
              </button>
            )}
          </div>

          <input
            type="text"
            placeholder={`Question ${idx + 1}`}
            value={q.question}
            onChange={(e) => handleQuestionChange(idx, e.target.value)}
          />

          {q.options.map((opt, oIdx) => (
            <input
              key={oIdx}
              type="text"
              placeholder={`Option ${oIdx + 1}`}
              value={opt}
              onChange={(e) => handleOptionChange(idx, oIdx, e.target.value)}
            />
          ))}

          <select
            value={q.correctAnswer}
            onChange={(e) => handleCorrectAnswerChange(idx, e.target.value)}
          >
            <option value="">-- Select Correct Answer --</option>
            {q.options.filter((o) => o.trim()).map((opt, oIdx) => (
              <option key={oIdx} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={addQuestion} style={{ background: "#28a745" }}>
        + Add Question
      </button>
      <button onClick={submitQuiz} disabled={loading}>
        {loading ? "Submitting..." : "Submit Quiz"}
      </button>

      <hr />
      <h3>Existing Quizzes — {selectedModuleName}</h3>

      {quizzes.length === 0 && <p style={{ color: "#888" }}>No quizzes yet for this module.</p>}

      {quizzes.map((quiz) => (
        <div key={quiz._id} className="quiz-question" style={{ background: "#f9f9f9", padding: "12px", borderRadius: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0 }}>{quiz.quizName}</h4>
            <button
              onClick={() => deleteQuiz(quiz._id)}
              style={{ background: "#dc3545", width: "auto", padding: "4px 12px", fontSize: "13px" }}
            >
              Delete
            </button>
          </div>

          {quiz.questions.map((q, idx) => (
            <div key={idx} style={{ marginTop: "8px" }}>
              <p style={{ margin: "4px 0" }}>
                <strong>{idx + 1}.</strong> {q.questionText}
              </p>
              <ul style={{ margin: "4px 0 0 16px" }}>
                {q.options.map((opt, oIdx) => (
                  <li
                    key={oIdx}
                    style={{ color: oIdx === q.correctIndex ? "#28a745" : "inherit", fontWeight: oIdx === q.correctIndex ? "bold" : "normal" }}
                  >
                    {opt} {oIdx === q.correctIndex ? "✓" : ""}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AddQuiz;
