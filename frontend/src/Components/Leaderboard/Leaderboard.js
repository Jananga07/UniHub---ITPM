import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

const MEDALS = ["🥇", "🥈", "🥉"];

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/student-quiz/leaderboard`)
      .then((res) => setLeaders(res.data.leaderboard || []))
      .catch((err) => console.error("Leaderboard fetch error", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="leaderboard-section">
      <div className="leaderboard-header">
        <span className="leaderboard-kicker">Quiz Rankings</span>
        <h2>🏆 Leaderboard</h2>
        <p>Top students ranked by total quiz score</p>
      </div>

      {loading ? (
        <p className="leaderboard-empty">Loading...</p>
      ) : leaders.length === 0 ? (
        <p className="leaderboard-empty">No quiz attempts yet. Be the first!</p>
      ) : (
        <div className="leaderboard-table-wrap">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>Total Score</th>
                <th>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((s, idx) => (
                <tr key={s._id} className={idx < 3 ? `leaderboard-top-${idx + 1}` : ""}>
                  <td className="leaderboard-rank">
                    {idx < 3 ? MEDALS[idx] : `#${idx + 1}`}
                  </td>
                  <td className="leaderboard-name">
                    <div className="leaderboard-avatar">
                      {s.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span>{s.name || "Unknown"}</span>
                  </td>
                  <td className="leaderboard-score">{s.totalScore}</td>
                  <td className="leaderboard-attempts">{s.attempts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Leaderboard;
