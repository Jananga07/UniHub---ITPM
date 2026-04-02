import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./StudentProfile.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("society");
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizLoading, setQuizLoading] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/Users/${id}`)
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (activeTab !== "quiz" || !id) return;
    setQuizLoading(true);
    axios
      .get(`${API}/student-quiz/history/${id}`)
      .then((res) => setQuizHistory(res.data.history || []))
      .catch((err) => console.error(err))
      .finally(() => setQuizLoading(false));
  }, [activeTab, id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`${API}/users/${user._id}`);
      alert("Account deleted successfully");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!user)   return <p style={{ padding: 40 }}>User not found</p>;

  return (
    <div className="profile-wrapper">

      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.gmail}</p>

        <ul className="profile-info">
          <li>Age     <span>{user.age     || "N/A"}</span></li>
          <li>Address <span>{user.address || "N/A"}</span></li>
          <li>Contact <span>{user.contact || "N/A"}</span></li>
          <li>Role    <span>{user.role    || "Student"}</span></li>
        </ul>

        <button className={`profile-tab-btn ${activeTab === "society" ? "active" : ""}`} onClick={() => setActiveTab("society")}>
          🏛 Society
        </button>
        <button className={`profile-tab-btn ${activeTab === "module" ? "active" : ""}`} onClick={() => setActiveTab("module")}>
          📚 Module
        </button>
        <button className={`profile-tab-btn ${activeTab === "quiz" ? "active" : ""}`} onClick={() => setActiveTab("quiz")}>
          🎯 My Quizzes
        </button>

        <button className="delete-btn" onClick={handleDelete}>Delete Account</button>
      </div>

      {/* Main content */}
      <div className="profile-main">
        <div className="tab-content">

          {activeTab === "society" && (
            <div>
              <h2>Society</h2>
              <p>Here you can see and manage your societies.</p>
            </div>
          )}

          {activeTab === "module" && (
            <div>
              <h2>Module</h2>
              <p>Here you can see your modules and related content.</p>
              <button className="navigate-module-btn" onClick={() => navigate("/resources")}>
                Go to Resources
              </button>
            </div>
          )}

          {activeTab === "quiz" && (
            <div>
              <h2>My Quiz Results</h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>Your quiz attempts grouped by module.</p>

              {quizLoading && <p>Loading quiz history...</p>}

              {!quizLoading && quizHistory.length === 0 && (
                <div className="quiz-empty-state">
                  <p>You haven't attempted any quizzes yet.</p>
                  <button className="navigate-module-btn" onClick={() => navigate("/resources")}>
                    Browse Modules
                  </button>
                </div>
              )}

              {!quizLoading && quizHistory.map((mod) => (
                <div key={mod.moduleId} className="quiz-module-card">
                  <div className="quiz-module-header">
                    <span className="quiz-module-icon">📚</span>
                    <div>
                      <h3>{mod.moduleName}</h3>
                      {mod.moduleCode && <span className="quiz-module-code">{mod.moduleCode}</span>}
                    </div>
                  </div>

                  <div className="quiz-attempts-list">
                    {mod.attempts.map((attempt, idx) => {
                      const pct = attempt.totalQuestions > 0
                        ? Math.round((attempt.score / attempt.totalQuestions) * 100)
                        : 0;
                      const color = pct >= 70 ? "#22c55e" : pct >= 40 ? "#f59e0b" : "#ef4444";

                      return (
                        <div key={idx} className="quiz-attempt-row">
                          <div className="quiz-attempt-info">
                            <span className="quiz-attempt-name">{attempt.quizName}</span>
                            <span className="quiz-attempt-date">
                              {new Date(attempt.attemptedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="quiz-attempt-score">
                            <div className="quiz-score-bar-wrap">
                              <div
                                className="quiz-score-bar"
                                style={{ width: `${pct}%`, background: color }}
                              />
                            </div>
                            <span className="quiz-score-text" style={{ color }}>
                              {attempt.score}/{attempt.totalQuestions} ({pct}%)
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

export default StudentProfile;
