import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./QuizOverview.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Uni Hub brand palette
const BRAND_PALETTE = [
  { solid: "#4f46e5", light: "#818cf8" },
  { solid: "#06b6d4", light: "#67e8f9" },
  { solid: "#10b981", light: "#6ee7b7" },
  { solid: "#f59e0b", light: "#fcd34d" },
  { solid: "#ef4444", light: "#fca5a5" },
  { solid: "#8b5cf6", light: "#c4b5fd" },
  { solid: "#ec4899", light: "#f9a8d4" },
  { solid: "#14b8a6", light: "#5eead4" },
];

const DEFAULT_ANALYTICS = {
  totalAttempts: 0,
  uniqueStudents: 0,
  averageScore: 0,
  highestScore: 0,
};

/* ── Vertical bar chart — students who completed each module ── */
function ParticipationChart({ data }) {
  if (!data || data.length === 0) return null;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const ySteps = [0, Math.round(maxVal / 4), Math.round(maxVal / 2), Math.round(maxVal * 3 / 4), maxVal];

  return (
    <div className="qov-chart-wrap">
      <div className="qov-chart-header">
        <span className="qov-chart-title">📊 Students Who Completed Quiz per Module</span>
        <span className="qov-chart-sub">Number of unique students who submitted a quiz in each module</span>
      </div>

      <div className="qov-vchart">
        {/* Y-axis labels */}
        <div className="qov-vchart__yaxis">
          {[...ySteps].reverse().map((v, i) => (
            <span key={i} className="qov-vchart__ylabel">{v}</span>
          ))}
        </div>

        {/* Chart area */}
        <div className="qov-vchart__area">
          {/* Horizontal grid lines */}
          <div className="qov-vchart__grid">
            {ySteps.map((_, i) => <div key={i} className="qov-vchart__gridline" />)}
          </div>

          {/* Bars */}
          <div className="qov-vchart__bars">
            {data.map((row, i) => {
              const pct   = maxVal > 0 ? (row.value / maxVal) * 100 : 0;
              const brand = BRAND_PALETTE[i % BRAND_PALETTE.length];
              return (
                <div key={row.label} className="qov-vchart__col">
                  <span className="qov-vchart__val" style={{ color: brand.solid }}>{row.value}</span>
                  <div className="qov-vchart__bar-wrap">
                    <div
                      className="qov-vchart__bar"
                      style={{
                        height: `${pct}%`,
                        background: `linear-gradient(180deg, ${brand.light}, ${brand.solid})`,
                        boxShadow: `0 4px 14px ${brand.solid}44`,
                        animationDelay: `${i * 0.07}s`,
                      }}
                    />
                  </div>
                  <span className="qov-vchart__xlabel" title={row.label}>{row.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizOverview() {
  const [modules,      setModules]      = useState([]);
  const [quizMap,      setQuizMap]      = useState({});
  const [analytics,    setAnalytics]    = useState(DEFAULT_ANALYTICS);
  const [chartRows,    setChartRows]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        /* 1. Modules */
        const modRes = await axios.get(`${API}/resources/modules`);
        const mods = Array.isArray(modRes.data?.modules) ? modRes.data.modules : [];
        setModules(mods);

        /* 2. Quizzes per module */
        const map = {};
        await Promise.all(
          mods.map(async (m) => {
            try {
              const qRes = await axios.get(`${API}/quiz/module/${m._id}`);
              map[m._id] = Array.isArray(qRes.data?.quizzes) ? qRes.data.quizzes : [];
            } catch {
              map[m._id] = [];
            }
          })
        );
        setQuizMap(map);

        /* 3. Real per-module unique student counts */
        try {
          const attRes = await axios.get(`${API}/student-quiz/module-attempts`);
          const attData = Array.isArray(attRes.data?.data) ? attRes.data.data : [];

          const attMap = {};
          attData.forEach((d) => { attMap[d.moduleId?.toString()] = d.uniqueStudents; });

          const rows = mods.map((m) => ({
            label: m.moduleName.length > 14 ? m.moduleName.slice(0, 14) + "…" : m.moduleName,
            value: attMap[m._id?.toString()] || 0,
          }));

          setChartRows(rows);

          const lbRes = await axios.get(`${API}/student-quiz/leaderboard`);
          const lb = Array.isArray(lbRes.data?.leaderboard) ? lbRes.data.leaderboard : [];
          const scores = lb.map((s) => s.totalScore || 0);
          setAnalytics({
            totalAttempts: attData.reduce((s, x) => s + (x.totalAttempts || 0), 0),
            uniqueStudents: lb.length,
            averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
            highestScore: scores.length ? Math.max(...scores) : 0,
          });
        } catch {
          const rows = mods.map((m) => ({
            label: m.moduleName.length > 14 ? m.moduleName.slice(0, 14) + "…" : m.moduleName,
            value: (map[m._id] || []).length,
          }));
          setChartRows(rows);
          setAnalytics(DEFAULT_ANALYTICS);
        }
      } catch (err) {
        console.error("QuizOverview load error:", err);
        setAnalytics(DEFAULT_ANALYTICS);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const withQuiz    = modules.filter((m) => Array.isArray(quizMap[m._id]) && quizMap[m._id].length > 0);
  const withoutQuiz = modules.filter((m) => !Array.isArray(quizMap[m._id]) || quizMap[m._id].length === 0);

  const kpiCards = [
    { label: "Total Attempts",  value: analytics.totalAttempts,  cls: "qov-stat--total"   },
    { label: "Active Students", value: analytics.uniqueStudents, cls: "qov-stat--with"    },
    { label: "Avg Score",       value: analytics.averageScore,   cls: "qov-stat--without" },
    { label: "Highest Score",   value: analytics.highestScore,   cls: "qov-stat--total"   },
  ];

  if (loading) return <div className="qov-page"><p className="qov-loading">Loading quiz overview...</p></div>;

  return (
    <div className="qov-page">
      <h2 className="qov-title">Quiz Overview</h2>
      <p className="qov-subtitle">Quiz coverage, student participation, and module analytics.</p>

      {/* ── KPI cards ── */}
      <div className="qov-stats">
        {kpiCards.map((k) => (
          <div key={k.label} className={`qov-stat ${k.cls}`}>
            <span className="qov-stat__num">{k.value}</span>
            <span className="qov-stat__label">{k.label}</span>
          </div>
        ))}
      </div>

      {/* ── Coverage summary ── */}
      <div className="qov-stats qov-stats--coverage">
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

      {/* ── Participation Bar Chart ── */}
      <ParticipationChart data={chartRows} />

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
                  {m.moduleCode && <span className="qov-module-code">{m.moduleCode}</span>}
                </div>
                <button className="qov-add-btn" onClick={() => navigate("/admin")}>+ Add Quiz</button>
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
                    {m.moduleCode && <span className="qov-module-code">{m.moduleCode}</span>}
                  </div>
                  <span className="qov-quiz-count">
                    {quizMap[m._id].length} quiz{quizMap[m._id].length !== 1 ? "zes" : ""}
                  </span>
                </div>
                <div className="qov-quiz-tags">
                  {quizMap[m._id].map((q) => (
                    <span key={q._id || q.quizName} className="qov-quiz-tag">📝 {q.quizName}</span>
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
