import React, { useEffect, useState } from "react";
import axios from "axios";
import ClubGrid from "../ClubGrid/ClubGrid";
import Navigation from "../HomeNav/HomeNav";
import { clubData } from "../../data/clubData";
import "./SocietyPage.css";

const studentLifeHeroImage = encodeURI("/Student Life.png");

function SocietyPage() {
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const res = await axios.get("http://localhost:5001/societies"); // fetch from backend
        setSocieties(res.data.societies);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
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
            <h3>Total Societies</h3>
            <h2>{loading ? "..." : societies.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Active Societies</h3>
            <h2>{loading ? "..." : societies.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Your Memberships</h3>
            <h2>0</h2>
          </div>
        </div>

        {/* Societies Section */}
        <div className="societies-section">
          <div className="societies-section-header">
            <h2>All Societies</h2>
            <p className="societies-section-copy">
              Browse featured student communities and open each club page to learn more.
            </p>
            {!loading && societies.length === 0 && (
              <p className="club-status-note">No backend societies found yet. Featured clubs are still available below.</p>
            )}
          </div>

          <ClubGrid clubs={clubData} />
        </div>
      </div>

    </>
  );
}

export default SocietyPage;