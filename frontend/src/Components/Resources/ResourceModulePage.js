import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";
import axios from "axios";

const API = "http://localhost:5001";

function ResourceModulePage() {
  const navigate = useNavigate();
  const { facultyId, year, semester } = useParams();

  const [modules, setModules] = useState([]);
  const [search, setSearch]   = useState("");
  const [loading, setLoading] = useState(true);

  const fetchModules = (query = "") => {
    setLoading(true);
    axios
      .get(`${API}/resources/modules`, {
        params: { faculty: facultyId, year, semester, search: query },
      })
      .then((r) => setModules(r.data.modules))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line
  }, [facultyId, year, semester]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    fetchModules(val);
  };

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">
          <span onClick={() => navigate("/resources")}>Resources</span>
          {" / "}
          <span onClick={() => navigate(`/resources/${facultyId}/years`)}>Year {year}</span>
          {" / "}Semester {semester}
        </div>
        <h1>Year {year} · Semester {semester} Modules</h1>
        <p>Browse and select a module to access study materials</p>
      </div>

      <button
        className="res-back-btn"
        onClick={() => navigate(`/resources/${facultyId}/year/${year}/semesters`)}
      >
        ← Back to Semesters
      </button>

      <div className="res-search-bar">
        <input
          type="text"
          placeholder="🔍  Search modules by name…"
          value={search}
          onChange={handleSearch}
        />
      </div>

      {loading ? (
        <div className="res-empty">Loading modules…</div>
      ) : modules.length === 0 ? (
        <div className="res-empty">
          No modules found{search ? ` for "${search}"` : ""}.
        </div>
      ) : (
        <div className="res-grid">
          {modules.map((m) => (
            <div
              key={m._id}
              className="res-card"
              onClick={() => navigate(`/resources/modules/${m._id}`)}
            >
              <div className="res-card-icon">📖</div>
              <h3>{m.moduleName}</h3>
              {m.moduleCode && <p>{m.moduleCode}</p>}
              <div className="res-card-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceModulePage;
