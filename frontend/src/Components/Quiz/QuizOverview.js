import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./QuizOverview.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function QuizOverview() {
  const [modules, setModules] = useState([]);
  const [quizMap, setQuizMap] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const modRes = await axios.get(`${API}/resources/modules`);
        const mods = modRes.data.modules || [];
        setModules(mods);

        const map = {};
        await Promise.all(
          mods.map(async (m) => {
            try {
              const qRes = await axios.get(`${API}/quiz/module/${m._id}`);
              map[m._id] = qRes.data.quizzes || [];
            } catch {
              map[m._id] = [];
            }
          })
        );
        setQuizMap(map);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const withQuiz    = modules.filter((m) => quizMap[m._id]?.length > 0);
  const withoutQuiz = modules.filter((m) => !quizMap[m._id]?.length);

  if (loading) return <p className="qov-loading">Loading quiz overview...</p>;

  return (
    <div className="qov-page">
      <h2 className="qov-title">Quiz Overview</h2>
      <p className="qov-subtitle">See which modules have quizzes and which still need one.</p>

      {/* ── Summary stats ── */}
      <div className="qov-stats">
        <div className="qov-stat qov-stat--with">
          <span className="qov-stat__num">{withQuiz.length}</span>
          <span className="qov-stat__label">Modules with Quiz</span>
        </div>
        <div className="qov-stat qov-stat--without">
          <span className="qov-stat__num">{withoutQuiz.length}</span>
          <span className="qov-stat__label">Modules without Quiz</span>
        </div>
        <div className="qov-stat qov-stat--total">
          <span className="qov-stat__num">{modules.length}</span>
          <span className="qov-stat__label">Total Modules</span>
        </div>
      </div>

      {/* ── Modules WITHOUT quiz ── */}
      <div className="qov-section">
        <h3 className="qov-section-title qov-section-title--without">
          ⚠️ Modules Without Quiz
          <span className="qov-count-badge qov-count-badge--without">{withoutQuiz.length}</span>
        </h3>

        {withoutQuiz.length === 0 ? (
          <p className="qov-empty-text">All modules have quizzes. 🎉</p>
        ) : (
          <div className="qov-module-list">
            {withoutQuiz.map((m) => (
              <div key={m._id} className="qov-module-row">
                <div>
                  <span className="qov-module-name">{m.moduleName}</span>
                  {m.moduleCode && (
                    <span className="qov-module-code">{m.moduleCode}</span>
                  )}
                </div>
                <button
                  className="qov-add-btn"
                  onClick={() => navigate("/admin")}
                >
                  + Add Quiz
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modules WITH quiz ── */}
      <div className="qov-section">
        <h3 className="qov-section-title qov-section-title--with">
          ✅ Modules With Quiz
          <span className="qov-count-badge qov-count-badge--with">{withQuiz.length}</span>
        </h3>

        {withQuiz.length === 0 ? (
          <p className="qov-empty-text">No quizzes added yet.</p>
        ) : (
          <div className="qov-module-list">
            {withQuiz.map((m) => (
              <div key={m._id} className="qov-module-card">
                <div className="qov-module-card__header">
                  <div>
                    <span className="qov-module-name">{m.moduleName}</span>
                    {m.moduleCode && (
                      <span className="qov-module-code">{m.moduleCode}</span>
                    )}
                  </div>
                  <span className="qov-quiz-count">
                    {quizMap[m._id].length} quiz{quizMap[m._id].length !== 1 ? "zes" : ""}
                  </span>
                </div>
                <div className="qov-quiz-tags">
                  {quizMap[m._id].map((q) => (
                    <span key={q._id} className="qov-quiz-tag">
                      📝 {q.quizName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizOverview;
