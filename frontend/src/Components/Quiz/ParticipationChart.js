import { useEffect, useState } from "react";
import axios from "axios";
import "./ParticipationChart.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

// Uni Hub brand palette — sequential for multi-bar charts
const BRAND_PALETTE = [
  { solid: "#4f46e5", light: "#818cf8" },  // indigo
  { solid: "#06b6d4", light: "#67e8f9" },  // cyan
  { solid: "#10b981", light: "#6ee7b7" },  // emerald
  { solid: "#f59e0b", light: "#fcd34d" },  // amber
  { solid: "#ef4444", light: "#fca5a5" },  // red
  { solid: "#8b5cf6", light: "#c4b5fd" },  // purple
  { solid: "#ec4899", light: "#f9a8d4" },  // pink
  { solid: "#14b8a6", light: "#5eead4" },  // teal
];

function ParticipationChart() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [modRes, attRes] = await Promise.all([
          axios.get(`${API}/resources/modules`),
          axios.get(`${API}/student-quiz/module-attempts`),
        ]);

        const mods    = Array.isArray(modRes.data?.modules) ? modRes.data.modules : [];
        const attData = Array.isArray(attRes.data?.data)    ? attRes.data.data    : [];

        const attMap = {};
        attData.forEach((d) => { attMap[d.moduleId?.toString()] = d.uniqueStudents || 0; });

        const built = mods.map((m) => ({
          label: m.moduleName.length > 12 ? m.moduleName.slice(0, 12) + "…" : m.moduleName,
          value: attMap[m._id?.toString()] || 0,
        }));

        setRows(built);
      } catch (err) {
        console.error("ParticipationChart error:", err);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return (
    <div className="pc-wrap">
      <p className="pc-loading">Loading participation data…</p>
    </div>
  );

  if (rows.length === 0) return null;

  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  const ySteps = [maxVal, Math.round(maxVal * 3 / 4), Math.round(maxVal / 2), Math.round(maxVal / 4), 0];

  return (
    <div className="pc-wrap">
      {/* Header */}
      <div className="pc-header">
        <div>
          <h3 className="pc-title">🎓 Students Who Completed Quiz per Module</h3>
          <p className="pc-sub">Unique students who submitted at least one quiz in each module</p>
        </div>
      </div>

      {/* Chart */}
      <div className="pc-chart">
        {/* Y-axis */}
        <div className="pc-yaxis">
          {ySteps.map((v, i) => (
            <span key={i} className="pc-ylabel">{v}</span>
          ))}
        </div>

        {/* Bars area */}
        <div className="pc-area">
          {/* Grid lines */}
          <div className="pc-grid">
            {ySteps.map((_, i) => <div key={i} className="pc-gridline" />)}
          </div>

          {/* Bars */}
          <div className="pc-bars">
            {rows.map((row, i) => {
              const pct   = maxVal > 0 ? (row.value / maxVal) * 100 : 0;
              const brand = BRAND_PALETTE[i % BRAND_PALETTE.length];
              return (
                <div key={row.label} className="pc-col">
                  {row.value > 0 && (
                    <span className="pc-val" style={{ color: brand.solid }}>{row.value}</span>
                  )}
                  <div className="pc-bar-wrap">
                    <div
                      className="pc-bar"
                      style={{
                        height: `${pct}%`,
                        background: `linear-gradient(180deg, ${brand.light}, ${brand.solid})`,
                        boxShadow: `0 4px 12px ${brand.solid}44`,
                        animationDelay: `${i * 0.07}s`,
                      }}
                    />
                  </div>
                  <span className="pc-xlabel" title={row.label}>{row.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipationChart;
