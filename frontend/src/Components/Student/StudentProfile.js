/* global globalThis */
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./StudentProfile.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const SOCIETY_STATUS_META = {
  pending: { label: "Pending", className: "pending" },
  approved: { label: "Approved", className: "approved" },
  rejected: { label: "Rejected", className: "rejected" },
};

const getScoreColor = (percentage) => {
  if (percentage >= 70) return "#22c55e";
  if (percentage >= 40) return "#f59e0b";
  return "#ef4444";
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

function StudentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loggedInUser = getStoredUser();
  const [user, setUser] = useState(null);
  const studentLookupId = user?._id || id || loggedInUser?._id;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("available");

  const [quizHistory, setQuizHistory]       = useState([]);
  const [quizLoading, setQuizLoading]       = useState(false);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [availableLoading, setAvailableLoading] = useState(false);
  const [societyRequests, setSocietyRequests] = useState([]);
  const [societyLoading, setSocietyLoading] = useState(false);
  const [societyError, setSocietyError] = useState("");

  // Edit profile state
  const [editForm, setEditForm] = useState({ name: "", gmail: "", age: "", address: "", contact: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: "", text: "" });

  // Leaderboard state
  const [leaders, setLeaders]           = useState([]);
  const [lbLoading, setLbLoading]       = useState(false);
  const [lbSearch, setLbSearch]         = useState("");
  const [lbFilter, setLbFilter]         = useState("all"); // "all" | "top10"

  useEffect(() => {
    axios
      .get(`${API}/Users/${id}`)
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Seed edit form when user loads
  useEffect(() => {
    if (user) {
      setEditForm({
        name:    user.name    || "",
        gmail:   user.gmail   || "",
        age:     user.age     || "",
        address: user.address || "",
        contact: user.contact || "",
      });
    }
  }, [user]);

  // Fetch available quizzes
  useEffect(() => {
    if (!id) return;
    setAvailableLoading(true);
    axios
      .get(`${API}/quiz/available/${id}`)
      .then((res) => setAvailableQuizzes(res.data.quizzes || []))
      .catch((err) => console.error(err))
      .finally(() => setAvailableLoading(false));
  }, [id]);

  // Fetch quiz history when tab opens
  useEffect(() => {
    if (activeTab !== "quiz" || !id) return;
    setQuizLoading(true);
    axios
      .get(`${API}/student-quiz/history/${id}`)
      .then((res) => setQuizHistory(res.data.history || []))
      .catch((err) => console.error(err))
      .finally(() => setQuizLoading(false));
  }, [activeTab, id]);

  // Fetch leaderboard when tab opens
  useEffect(() => {
    if (activeTab !== "leaderboard") return;
    setLbLoading(true);
    axios
      .get(`${API}/student-quiz/leaderboard`)
      .then((res) => setLeaders(res.data.leaderboard || []))
      .catch((err) => console.error(err))
      .finally(() => setLbLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "society" || !studentLookupId) return;

    let isMounted = true;

    setSocietyLoading(true);
    setSocietyError("");

    axios
      .get(`${API}/api/membership/student/${studentLookupId}`, {
        params: {
          email: user?.gmail || loggedInUser?.gmail || "",
        },
      })
      .then((res) => {
        if (!isMounted) return;
        setSocietyRequests(res.data.requests || []);
      })
      .catch((err) => {
        console.error(err);
        if (!isMounted) return;
        setSocietyError(
          err.response?.data?.message || "Unable to load your society applications."
        );
        setSocietyRequests([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setSocietyLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, studentLookupId, user?.gmail, loggedInUser?.gmail]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg({ type: "", text: "" });
    try {
      const res = await axios.put(`${API}/Users/${user._id}`, editForm);
      setUser(res.data.user);
      // update localStorage so navbar reflects new name
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data.user }));
      setEditMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setEditMsg({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (globalThis.confirm("Are you sure you want to delete your account?")) {
      try {
        await axios.delete(`${API}/users/${user._id}`);
        alert("Account deleted successfully");
        localStorage.removeItem("user");
        navigate("/");
      } catch (err) {
        console.error(err);
        alert("Error deleting account");
      }
    }
  };

  // Compute KPI values from loaded data
  const completedCount = quizHistory.reduce((acc, mod) => acc + mod.attempts.length, 0);
  const allScores = quizHistory.flatMap((mod) =>
    mod.attempts.map((a) =>
      a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0
    )
  );
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  if (loading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (!user)   return <p style={{ padding: 40 }}>User not found</p>;

  return (
    <div className="profile-wrapper">

      {/* ── Sidebar ── */}
      <div className="profile-sidebar">
        <div className="profile-avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.gmail}</p>
        <div className="sp-role-badge">🎓 {user.role || "Student"}</div>

        <ul className="profile-info">
          <li>Age     <span>{user.age     || "N/A"}</span></li>
          <li>Address <span>{user.address || "N/A"}</span></li>
          <li>Contact <span>{user.contact || "N/A"}</span></li>
          {user.pin && (
            <li>Quiz PIN <span>🔐 {user.pin}</span></li>
          )}
        </ul>

        <div className="sp-sidebar-section-label">Navigation</div>

        <button className={`profile-tab-btn ${activeTab === "available" ? "active" : ""}`} onClick={() => setActiveTab("available")}>
          <span className="sp-tab-icon sp-icon-blue">🆕</span>
          Available Quizzes
          {availableQuizzes.length > 0 && (
            <span className="quiz-badge">{availableQuizzes.length}</span>
          )}
        </button>
        <button className={`profile-tab-btn ${activeTab === "quiz" ? "active" : ""}`} onClick={() => setActiveTab("quiz")}>
          <span className="sp-tab-icon sp-icon-cyan">🎯</span>
          My Results
        </button>
        <button className={`profile-tab-btn ${activeTab === "leaderboard" ? "active" : ""}`} onClick={() => setActiveTab("leaderboard")}>
          <span className="sp-tab-icon sp-icon-gold">🏆</span>
          Leaderboard
        </button>
        <button className={`profile-tab-btn ${activeTab === "society" ? "active" : ""}`} onClick={() => setActiveTab("society")}>
          <span className="sp-tab-icon sp-icon-green">🏛</span>
          Society
        </button>
        <button className={`profile-tab-btn ${activeTab === "module" ? "active" : ""}`} onClick={() => setActiveTab("module")}>
          <span className="sp-tab-icon sp-icon-orange">📚</span>
          Module
        </button>
        <button className={`profile-tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          <span className="sp-tab-icon sp-icon-purple">⚙️</span>
          Edit Profile
        </button>

        <div className="sp-sidebar-section-label">Account</div>
        <button className="delete-btn" onClick={handleDelete}>
          <span className="sp-tab-icon sp-icon-purple" style={{ background: "rgba(239,68,68,0.25)" }}>🗑</span>
          Delete Account
        </button>
      </div>

      {/* ── Main Content ── */}
      <div className="profile-main">

        {/* Topbar */}
        <div className="sp-topbar">
          <div className="sp-topbar-left">
            <h1>Welcome back, {user.name.split(" ")[0]} 👋</h1>
            <p>Here's your academic overview for today</p>
          </div>
          <div className="sp-topbar-right">
            <div className="sp-search-bar">
              <span>🔍</span>
              <input type="text" placeholder="Search..." readOnly />
            </div>
            <button className="sp-notif-btn" title="Notifications">
              🔔
              <span className="sp-notif-dot" />
            </button>
            <div className="sp-profile-chip">
              {user.name.charAt(0).toUpperCase()} {user.name.split(" ")[0]}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="sp-kpi-grid">
          <div className="sp-kpi-card sp-kpi-card--blue">
            <div className="sp-kpi-icon sp-kpi-icon--blue">✅</div>
            <div className="sp-kpi-label">Completed Quizzes</div>
            <div className="sp-kpi-value">{completedCount}</div>
            <div className="sp-kpi-sub">Total attempts</div>
          </div>
          <div className="sp-kpi-card sp-kpi-card--green">
            <div className="sp-kpi-icon sp-kpi-icon--green">📊</div>
            <div className="sp-kpi-label">Average Score</div>
            <div className="sp-kpi-value">{avgScore}%</div>
            <div className="sp-kpi-sub">Across all quizzes</div>
          </div>
          <div className="sp-kpi-card sp-kpi-card--orange">
            <div className="sp-kpi-icon sp-kpi-icon--orange">📚</div>
            <div className="sp-kpi-label">Available Quizzes</div>
            <div className="sp-kpi-value">{availableQuizzes.length}</div>
            <div className="sp-kpi-sub">Ready to attempt</div>
          </div>
          <div className="sp-kpi-card sp-kpi-card--purple">
            <div className="sp-kpi-icon sp-kpi-icon--purple">🏛</div>
            <div className="sp-kpi-label">Society Apps</div>
            <div className="sp-kpi-value">{societyRequests.length}</div>
            <div className="sp-kpi-sub">Applications submitted</div>
          </div>
        </div>

        <div className="tab-content">

          {/* ── Available Quizzes ── */}
          {activeTab === "available" && (
            <div>
              <h2>Available Quizzes</h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>
                New quizzes you haven't attempted yet.
              </p>

              {availableLoading && <p>Loading...</p>}

              {!availableLoading && availableQuizzes.length === 0 && (
                <div className="quiz-empty-state">
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
                  <p>You've completed all available quizzes!</p>
                  <button className="navigate-module-btn" onClick={() => navigate("/resources")}>
                    Browse Resources
                  </button>
                </div>
              )}

              {!availableLoading && availableQuizzes.length > 0 && (
                <div className="available-quiz-list">
                  {availableQuizzes.map((quiz) => (
                    <div key={quiz._id} className="available-quiz-card">
                      <div className="available-quiz-info">
                        <div className="available-quiz-badge">NEW</div>
                        <div>
                          <h3>{quiz.quizName}</h3>
                          <p>
                            📚 {quiz.moduleName}
                            {quiz.moduleCode && <span className="quiz-module-code" style={{ marginLeft: "8px" }}>{quiz.moduleCode}</span>}
                          </p>
                          <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                            {quiz.questionCount} {quiz.questionCount === 1 ? "question" : "questions"}
                            &nbsp;·&nbsp;
                            Added {new Date(quiz.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        className="navigate-module-btn"
                        onClick={() => navigate(`/student-quiz/${quiz.moduleId}`)}
                      >
                        Start Quiz →
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── My Results ── */}
          {activeTab === "quiz" && (
            <div>
              <h2>My Quiz Results</h2>
              <p style={{ color: "#64748b", marginBottom: "20px" }}>Your quiz attempts grouped by module.</p>

              {quizLoading && <p>Loading quiz history...</p>}

              {!quizLoading && quizHistory.length === 0 && (
                <div className="quiz-empty-state">
                  <p>You haven't attempted any quizzes yet.</p>
                  <button className="navigate-module-btn" onClick={() => setActiveTab("available")}>
                    See Available Quizzes
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
                      const color = getScoreColor(pct);
                      return (
                        <div key={attempt._id || `${attempt.quizName}-${attempt.attemptedAt || idx}`} className="quiz-attempt-row">
                          <div className="quiz-attempt-info">
                            <span className="quiz-attempt-name">{attempt.quizName}</span>
                            <span className="quiz-attempt-date">
                              {new Date(attempt.attemptedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="quiz-attempt-score">
                            <div className="quiz-score-bar-wrap">
                              <div className="quiz-score-bar" style={{ width: `${pct}%`, background: color }} />
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

          {/* ── Leaderboard ── */}
          {activeTab === "leaderboard" && (() => {
            const myEntry = leaders.find((l) => l._id === id || l._id === user._id);
            const myRank  = myEntry ? leaders.indexOf(myEntry) + 1 : null;
            const maxScore = leaders[0]?.totalScore || 1;
            const filtered = leaders
              .filter((l) => l.name.toLowerCase().includes(lbSearch.toLowerCase()))
              .slice(0, lbFilter === "top10" ? 10 : leaders.length);

            const RANK_META = [
              { glow: "lb-row--gold",   badge: "🥇", label: "Gold",   avatarClass: "lb-avatar--gold"   },
              { glow: "lb-row--silver", badge: "🥈", label: "Silver", avatarClass: "lb-avatar--silver" },
              { glow: "lb-row--bronze", badge: "🥉", label: "Bronze", avatarClass: "lb-avatar--bronze" },
            ];

            return (
              <div className="lb-wrapper">
                {/* Header */}
                <div className="lb-header">
                  <div>
                    <span className="lb-eyebrow">Rankings</span>
                    <h2 className="lb-title">🏆 Student Leaderboard</h2>
                    <p className="lb-subtitle">Top performers ranked by total quiz score</p>
                  </div>
                  <div className="lb-controls">
                    <div className="lb-search">
                      <span>🔍</span>
                      <input
                        type="text"
                        placeholder="Search student…"
                        value={lbSearch}
                        onChange={(e) => setLbSearch(e.target.value)}
                      />
                    </div>
                    <div className="lb-filter-tabs">
                      <button className={lbFilter === "all"   ? "lb-filter-active" : ""} onClick={() => setLbFilter("all")}>All</button>
                      <button className={lbFilter === "top10" ? "lb-filter-active" : ""} onClick={() => setLbFilter("top10")}>Top 10</button>
                    </div>
                  </div>
                </div>

                {/* My Rank Card */}
                {myEntry && (
                  <div className="lb-my-rank-card">
                    <div className="lb-my-rank-left">
                      <div className="lb-my-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div className="lb-my-name">You · {user.name}</div>
                        <div className="lb-my-sub">Your current standing</div>
                      </div>
                    </div>
                    <div className="lb-my-stats">
                      <div className="lb-my-stat">
                        <span className="lb-my-stat-val">#{myRank}</span>
                        <span className="lb-my-stat-lbl">Rank</span>
                      </div>
                      <div className="lb-my-stat-divider" />
                      <div className="lb-my-stat">
                        <span className="lb-my-stat-val">{myEntry.totalScore}</span>
                        <span className="lb-my-stat-lbl">Points</span>
                      </div>
                      <div className="lb-my-stat-divider" />
                      <div className="lb-my-stat">
                        <span className="lb-my-stat-val">{myEntry.attempts}</span>
                        <span className="lb-my-stat-lbl">Attempts</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading / Empty */}
                {lbLoading && <div className="lb-empty">Loading rankings…</div>}
                {!lbLoading && leaders.length === 0 && (
                  <div className="lb-empty">🎯 No quiz attempts yet. Be the first!</div>
                )}

                {/* Top 3 Podium */}
                {!lbLoading && filtered.length > 0 && (
                  <>
                    {filtered.length >= 3 && (
                      <div className="lb-podium">
                        {[filtered[1], filtered[0], filtered[2]].map((s, podiumIdx) => {
                          if (!s) return null;
                          const realIdx = filtered.indexOf(s);
                          const meta = RANK_META[realIdx] || {};
                          const heights = ["lb-podium-col--2nd", "lb-podium-col--1st", "lb-podium-col--3rd"];
                          return (
                            <div key={s._id} className={`lb-podium-col ${heights[podiumIdx]}`}>
                              <div className={`lb-podium-avatar ${meta.avatarClass}`}>
                                {s.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="lb-podium-medal">{meta.badge}</div>
                              <div className="lb-podium-name">{s.name?.split(" ")[0]}</div>
                              <div className="lb-podium-score">{s.totalScore} pts</div>
                              <div className="lb-podium-base" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Full List */}
                    <div className="lb-list">
                      {filtered.map((s, idx) => {
                        const isMe = s._id === id || s._id === user._id;
                        const meta = RANK_META[idx];
                        const barPct = Math.round((s.totalScore / maxScore) * 100);
                        return (
                          <div
                            key={s._id}
                            className={`lb-row ${meta ? meta.glow : ""} ${isMe ? "lb-row--me" : ""}`}
                          >
                            <div className="lb-row-rank">
                              {meta ? (
                                <span className="lb-medal">{meta.badge}</span>
                              ) : (
                                <span className="lb-rank-num">#{idx + 1}</span>
                              )}
                            </div>
                            <div className={`lb-row-avatar ${meta ? meta.avatarClass : ""}`}>
                              {s.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="lb-row-info">
                              <div className="lb-row-name">
                                {s.name}
                                {isMe && <span className="lb-you-badge">You</span>}
                              </div>
                              <div className="lb-row-bar-wrap">
                                <div className="lb-row-bar" style={{ width: `${barPct}%` }} />
                              </div>
                            </div>
                            <div className="lb-row-right">
                              <div className="lb-row-score">{s.totalScore}</div>
                              <div className="lb-row-attempts">{s.attempts} attempts</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* ── Society ── */}
          {activeTab === "society" && (
            <div className="society-tab-content">
              <h2>Society</h2>
              <p>Applications you submitted to societies will appear here with their latest status.</p>

              {societyLoading && <p>Loading your applications...</p>}

              {!societyLoading && societyError && (
                <div className="society-message society-message--error">{societyError}</div>
              )}

              {!societyLoading && !societyError && societyRequests.length === 0 && (
                <div className="society-empty-state">
                  <div style={{ fontSize: "40px", marginBottom: "10px" }}>🏛</div>
                  <p>You have not submitted any society applications yet.</p>
                </div>
              )}

              {!societyLoading && !societyError && societyRequests.length > 0 && (
                <div className="society-request-list">
                  {societyRequests.map((request) => {
                    const statusKey = (request.status || "pending").toLowerCase();
                    const statusMeta = SOCIETY_STATUS_META[statusKey] || SOCIETY_STATUS_META.pending;

                    return (
                      <article
                        key={request._id || request.id}
                        className={`society-request-card society-request-card--${statusMeta.className}`}
                      >
                        <div className="society-request-card__header">
                          <div>
                            <h3>{request.club_name}</h3>
                            <p>Student ID: {request.student_id || "N/A"}</p>
                          </div>
                          <span className={`society-request-card__status society-request-card__status--${statusMeta.className}`}>
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="society-request-card__meta">
                          <span>{request.faculty}</span>
                          <span>Year {request.year}</span>
                          <span>
                            Submitted {new Date(request.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="society-request-card__body">
                          <p>{request.reason}</p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Module ── */}
          {activeTab === "module" && (
            <div>
              <h2>Module</h2>
              <p>Here you can see your modules and related content.</p>
              <button className="navigate-module-btn" onClick={() => navigate("/resources")}>
                Go to Resources
              </button>
            </div>
          )}

          {/* ── Edit Profile ── */}
          {activeTab === "settings" && (
            <div>
              <h2>Edit Profile</h2>
              <p>Update your personal details below.</p>
              <form className="edit-profile-form" onSubmit={handleEditSave}>
                <div className="edit-profile-grid">
                  <div className="edit-field">
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={editForm.gmail}
                      onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="edit-field">
                    <label>Age</label>
                    <input
                      type="number"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      placeholder="Your age"
                      min="1"
                    />
                  </div>
                  <div className="edit-field">
                    <label>Contact Number</label>
                    <input
                      type="text"
                      value={editForm.contact}
                      onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                      placeholder="+94XXXXXXXXX"
                    />
                  </div>
                  <div className="edit-field edit-field--full">
                    <label>Address</label>
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Your address"
                      rows={3}
                    />
                  </div>
                </div>
                {editMsg.text && (
                  <div className={`edit-profile-msg edit-profile-msg--${editMsg.type}`}>
                    {editMsg.type === "success" ? "✅" : "⚠️"} {editMsg.text}
                  </div>
                )}
                <div className="edit-profile-actions">
                  <button type="submit" className="navigate-module-btn" disabled={editSaving}>
                    {editSaving ? "Saving…" : "💾 Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="edit-cancel-btn"
                    onClick={() => {
                      setEditForm({ name: user.name || "", gmail: user.gmail || "", age: user.age || "", address: user.address || "", contact: user.contact || "" });
                      setEditMsg({ type: "", text: "" });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
        {/* end tab-content */}
      </div>
      {/* end profile-main */}
    </div>
  );
}

export default StudentProfile;
