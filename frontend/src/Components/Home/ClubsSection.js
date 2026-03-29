import React, { useState, useEffect } from "react";
import "./ClubsSection.css";

function ClubsSection() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await fetch("http://localhost:5001/societies");
        if (response.ok) {
          const data = await response.json();
          setClubs(data.societies || []);
        } else {
          console.error("Failed to fetch clubs");
        }
      } catch (error) {
        console.error("Error fetching clubs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return (
    <section className="clubs-section">
      <h2 className="clubs-title">Student Life & Clubs</h2>

      {loading ? (
        <p>Loading clubs...</p>
      ) : (
        <div className="clubs-container">
          {clubs.length > 0 ? (
            clubs.map((club) => (
              <div
                key={club._id}
                className="club-box"
                style={{ backgroundColor: club.color }}
              >
                <h3>{club.societyName}</h3>
                <p>{club.description}</p>
                <button className="learn-more-btn">Learn More</button>
              </div>
            ))
          ) : (
            <p>No clubs available</p>
          )}
        </div>
      )}
    </section>
  );
}

export default ClubsSection;