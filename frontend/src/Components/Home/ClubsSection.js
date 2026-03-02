import React, { useState, useEffect } from "react";
import "./ClubsSection.css";

function ClubsSection() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch clubs from backend
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
        // Use default clubs if API fails
        setClubs(DEFAULT_CLUBS);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const DEFAULT_CLUBS = [
    {
      _id: 1,
      societyName: "Sports Clubs",
      description:
        "Recreation in NSBM keeps the body fit, but also builds the inner qualities of the students",
      category: "Sports",
      color: "#00A8E8",
    },
    {
      _id: 2,
      societyName: "Activity Based Clubs",
      description:
        "We strive to innovate when it comes to functionality. Our mission is to be the best, come and join the ride.",
      category: "Activities",
      color: "#1FD084",
    },
    {
      _id: 3,
      societyName: "Photography Club",
      description:
        "Capture moments and tell stories through the lens. Build your portfolio and creative skills.",
      category: "Arts",
      color: "#FFD166",
    },
    {
      _id: 4,
      societyName: "International Clubs",
      description:
        "NSBM is committed to bringing in the best of the world educational experience to encourage global exposure among students",
      category: "Cultural",
      color: "#C65856",
    },
    {
      _id: 5,
      societyName: "Religious Clubs",
      description:
        "We foster a rich religious diversity on campus that welcomes all religious faiths and spiritual beliefs alike.",
      category: "Community",
      color: "#E91E63",
    },
    {
      _id: 6,
      societyName: "Cultural Clubs",
      description:
        "Celebrate diverse cultures and traditions. Connect with communities worldwide and build intercultural awareness.",
      category: "Cultural",
      color: "#FFD166",
    },
  ];

  const displayClubs = clubs && clubs.length > 0 ? clubs : DEFAULT_CLUBS;

  return (
    <section className="clubs-section">
      <h2 className="clubs-title">Student Life & Clubs</h2>
      <div className="clubs-container">
        {displayClubs.map((club) => (
          <div
            key={club._id}
            className="club-box"
            style={{ backgroundColor: club.color }}
          >
            <h3>{club.societyName}</h3>
            <p>{club.description}</p>
            <button className="learn-more-btn">Learn More</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ClubsSection;
