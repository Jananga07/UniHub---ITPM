import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ModulePage.css";
import { useNavigate } from "react-router-dom";

function ModulePage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const res = await axios.get("http://localhost:5001/modules");
        setModules(res.data.modules);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  if (loading) return <p className="loading-text">Loading modules...</p>;
  if (!modules.length) return <p className="loading-text">No modules available.</p>;

  return (
  <div className="dashboard-container">

    {/* Top Header */}
    <div className="dashboard-header">
      <div>
        <h1>Modules Dashboard</h1>
        <p>Manage and explore your enrolled modules</p>
      </div>
      <button className="primary-btn">+ Add Module</button>
    </div>

    {/* Stats Section */}
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Modules</h3>
        <h2>{modules.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Active Modules</h3>
        <h2>{modules.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Completed</h3>
        <h2>0</h2>
      </div>
    </div>

    {/* Modules Section */}
    <div className="modules-section">
      <h2>Your Modules</h2>
      <div className="modules-grid">
        {modules.map((mod) => (
          <div className="module-card" key={mod._id}>
            <div className="module-top">
              <div>
                <h3>{mod.moduleName}</h3>
                <span className="module-code">{mod.moduleCode}</span>
              </div>
            </div>

            <p className="module-desc">
              Access lectures, assignments, and resources for this module.
            </p>

            <button 
              className="module-btn"
              onClick={() => navigate(`/modules/${mod._id}`)}
              >
              Open Module</button>
          </div>
        ))}
      </div>
    </div>

  </div>
);
}

export default ModulePage;