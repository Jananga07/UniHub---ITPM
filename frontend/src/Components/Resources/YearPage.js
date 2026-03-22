import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";

const YEARS = [
  { year: 1, label: "Year 1", desc: "Foundation year" },
  { year: 2, label: "Year 2", desc: "Intermediate concepts" },
  { year: 3, label: "Year 3", desc: "Advanced modules" },
  { year: 4, label: "Year 4", desc: "Final year specialisation" },
];

function YearPage() {
  const navigate = useNavigate();
  const { facultyId, facultyName } = useParams();

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">
          <span onClick={() => navigate("/resources")}>Resources</span>
          {" / "}Select Year
        </div>
        <h1>Select Year</h1>
        <p>Choose the academic year for your module</p>
      </div>

      <button className="res-back-btn" onClick={() => navigate("/resources")}>
        ← Back to Faculties
      </button>

      <div className="res-grid">
        {YEARS.map(({ year, label, desc }) => (
          <div
            key={year}
            className="res-card"
            onClick={() => navigate(`/resources/${facultyId}/year/${year}/semesters`)}
          >
            <div className="res-card-icon">📅</div>
            <h3>{label}</h3>
            <p>{desc}</p>
            <div className="res-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default YearPage;
