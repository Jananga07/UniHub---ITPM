import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SocietyPage.css";

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

  if (loading) return <p className="loading-text">Loading societies...</p>;
  if (!societies.length) return <p className="loading-text">No societies found.</p>;

  return (
  <div className="dashboard-container">

    {/* Header Section */}
    <div className="dashboard-header">
      <div>
        <h1>Student Societies</h1>
        <p>Explore and join university societies</p>
      </div>
      <button className="primary-btn">+ Create Society</button>
    </div>

    {/* Stats Section */}
    <div className="stats-grid">
      <div className="stat-card">
        <h3>Total Societies</h3>
        <h2>{societies.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Active Societies</h3>
        <h2>{societies.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Your Memberships</h3>
        <h2>0</h2>
      </div>
    </div>

    {/* Societies Section */}
    <div className="societies-section">
      <h2>All Societies</h2>
      <div className="societies-grid">
        {societies.map((soc) => (
          <div className="society-card" key={soc._id}>
            <div className="society-top">
              <h3>{soc.societyName}</h3>
            </div>

            <p className="society-desc">
              {soc.description}
            </p>

            <button className="join-btn">View Society</button>
          </div>
        ))}
      </div>
    </div>

  </div>
);
}

export default SocietyPage;