import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Quiz.css";

function AddQuiz() {
  const [modules, setModules] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [questions, setQuestions] = useState([
    { question: "", options: ["", "", "", ""], correctAnswer: "" },
  ]);
  const [quizzes, setQuizzes] = useState([]);

  // Fetch modules
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get("http://localhost:5001/modules");
        setModules(res.data.modules || []);
        if (res.data.modules?.length > 0) {
          setSelectedModule(res.data.modules[0]._id);
        }
      } catch (err) {
        console.error(err);
        alert("Error fetching modules");
      }
    };
    fetchModules();
  }, []);

  // Fetch quizzes for selected module
  useEffect(() => {
    if (!selectedModule) return;

    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5001/quiz/module/${selectedModule}`
        );
        setQuizzes(res.data.quizzes || []);
      } catch (err) {
        console.error(err.response?.data || err.message);
        alert("Error fetching quizzes");
      }
    };

    fetchQuizzes();
  }, [selectedModule]);

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...questions];
    newQuestions[index].question = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[optIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (qIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].correctAnswer = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", options: ["", "", "", ""], correctAnswer: "" },
    ]);
  };

  const submitQuiz = async () => {
    if (!quizTitle || !selectedModule) {
      alert("Please select a module and enter a quiz title");
      return;
    }

    // Validate fields
    for (let q of questions) {
      if (!q.question || q.options.some((o) => !o) || !q.correctAnswer) {
        alert("Please fill all question fields and correct answer");
        return;
      }
    }

    try {
      // Convert frontend format → backend format
      const formattedQuestions = questions.map((q) => {
        const correctIndex = q.options.indexOf(q.correctAnswer);

        if (correctIndex === -1) {
          throw new Error("Correct answer must match one of the options");
        }

        return {
          questionText: q.question,
          options: q.options,
          correctIndex: correctIndex,
        };
      });

      await axios.post("http://localhost:5001/quiz/add", {
        moduleId: selectedModule,
        title: quizTitle,
        questions: formattedQuestions,
      });

      alert("Quiz added successfully!");

      setQuizTitle("");
      setQuestions([
        { question: "", options: ["", "", "", ""], correctAnswer: "" },
      ]);

      // Refresh quizzes
      const res = await axios.get(
        `http://localhost:5001/quiz/module/${selectedModule}`
      );
      setQuizzes(res.data.quizzes || []);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Error adding quiz");
    }
  };

  return (
    <div className="quiz-container">
      <h2>Admin: Add Quiz Module-wise</h2>

      {/* Module Dropdown */}
      <label>Select Module:</label>
      <select
        value={selectedModule}
        onChange={(e) => setSelectedModule(e.target.value)}
      >
        {modules.map((m) => (
          <option key={m._id} value={m._id}>
            {m.moduleName}
          </option>
        ))}
      </select>

      {/* Quiz Title */}
      <input
        type="text"
        placeholder="Enter Quiz Title"
        value={quizTitle}
        onChange={(e) => setQuizTitle(e.target.value)}
      />

      {/* Questions */}
      {questions.map((q, idx) => (
        <div key={idx} className="quiz-question">
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
              onChange={(e) =>
                handleOptionChange(idx, oIdx, e.target.value)
              }
            />
          ))}

          <input
            type="text"
            placeholder="Correct Answer (must match option exactly)"
            value={q.correctAnswer}
            onChange={(e) =>
              handleCorrectAnswerChange(idx, e.target.value)
            }
          />
        </div>
      ))}

      <button onClick={addQuestion}>Add Another Question</button>
      <button onClick={submitQuiz}>Submit Quiz</button>

      <hr />
      <h3>Existing Quizzes in this Module</h3>

      {quizzes.map((quiz) => (
        <div key={quiz._id} className="quiz-item">
          <h4>{quiz.quizName}</h4>

          {quiz.questions.map((q, idx) => (
            <div key={idx}>
              <p>
                {idx + 1}. {q.questionText} (Answer:{" "}
                {q.options[q.correctIndex]})
              </p>
              <ul>
                {q.options.map((opt, oIdx) => (
                  <li key={oIdx}>{opt}</li>
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