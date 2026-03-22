import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";
import axios from "axios";

const API = "http://localhost:5001";

function FacultyPage() {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    axios.get(`${API}/resources/faculties`)
      .then((r) => setFaculties(r.data.faculties))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const icons = ["🏛️", "💼", "⚙️", "🏗️", "📚", "🔬", "🎨", "🌐"];

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">Resources</div>
        <h1>Browse by Faculty</h1>
        <p>Select your faculty to explore study materials</p>
      </div>

      {loading ? (
        <div className="res-empty">Loading faculties…</div>
      ) : (
        <div className="res-grid">
          {faculties.map((f, i) => (
            <div
              key={f._id}
              className="res-card"
              onClick={() => navigate(`/resources/${f._id}/years`)}
            >
              <div className="res-card-icon">{icons[i % icons.length]}</div>
              <h3>{f.name}</h3>
              <p>Explore Year 1 – Year 4</p>
              <div className="res-card-arrow">→</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FacultyPage;
