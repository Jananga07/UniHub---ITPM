import React, { useEffect, useState } from "react";
import axios from "axios";
import ClubGrid from "../ClubGrid/ClubGrid.js";
import Navigation from "../HomeNav/HomeNav";
import { clubData } from "../../data/clubData.js";
import "./SocietyPage.css";

const studentLifeHeroImage = encodeURI("/Student Life.png");

function SocietyPage() {
  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await axios.get("http://localhost:5001/societies"); // fetch from backend
      } catch (err) {
        console.error(err);
      }
    };

    fetchSocieties();
  }, []);

  return (
    <>
      <Navigation />
      <section
        className="student-life-hero"
      >
        <div
          className="student-life-hero__image"
          style={{ backgroundImage: `url(${studentLifeHeroImage})` }}
          aria-hidden="true"
        />
        <div className="student-life-hero__content">
          <h1>Student Life</h1>
          <p>Explore and join university societies, communities, and experiences that shape campus life.</p>
        </div>
      </section>

      <div className="dashboard-container">

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Club Categories</h3>
            <h2>{clubData.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Campus Communities</h3>
            <h2>6</h2>
          </div>

          <div className="stat-card">
            <h3>Live Club Pages</h3>
            <h2>{clubData.length}</h2>
          </div>
        </div>

        {/* Societies Section */}
        <div className="societies-section">
          <div className="societies-section-header">
            <h2>Explore Club Types</h2>
            <p className="societies-section-copy">
              Select a club category to view only the societies assigned to that specific club type.
            </p>
          </div>

          <ClubGrid clubs={clubData} />
        </div>
      </div>

    </>
  );
}

export default SocietyPage;