import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";

const SEMESTERS = [
  { semester: 1, label: "Semester 1", desc: "First half of the academic year" },
  { semester: 2, label: "Semester 2", desc: "Second half of the academic year" },
];

function SemesterPage() {
  const navigate = useNavigate();
  const { facultyId, year } = useParams();

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">
          <span onClick={() => navigate("/resources")}>Resources</span>
          {" / "}
          <span onClick={() => navigate(`/resources/${facultyId}/years`)}>Year</span>
          {" / "}Select Semester
        </div>
        <h1>Year {year} — Select Semester</h1>
        <p>Choose a semester to browse modules</p>
      </div>

      <button
        className="res-back-btn"
        onClick={() => navigate(`/resources/${facultyId}/years`)}
      >
        ← Back to Years
      </button>

      <div className="res-grid">
        {SEMESTERS.map(({ semester, label, desc }) => (
          <div
            key={semester}
            className="res-card"
            onClick={() =>
              navigate(`/resources/${facultyId}/year/${year}/semester/${semester}/modules`)
            }
          >
            <div className="res-card-icon">📆</div>
            <h3>{label}</h3>
            <p>{desc}</p>
            <div className="res-card-arrow">→</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SemesterPage;
