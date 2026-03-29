import React from "react";
import { Link } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import ClubsSection from "./ClubsSection";

import Navigation from "../HomeNav/HomeNav";
import ClubGrid from "../ClubGrid/ClubGrid.js";
import ImageSlider from "../ImageSlider/ImageSlider";

import { clubData } from "../../data/clubData.js";
import "./Home.css";

function Home() {
  const sliderImages = [
    {
      src: "/images/slide1.jpg",
      alt: "University Campus",
      title: "Welcome to Uni Hub",
      description: "Your comprehensive platform for learning, collaboration, and student success",
      buttonText: "Get Started",
      buttonLink: "/userRegister"
    },
    {
      src: "/images/slide2.jpg", 
      alt: "Student Learning",
      title: "Excellence in Education",
      description: "Access quality resources, expert guidance, and a supportive community",
      buttonText: "Explore Features",
      buttonLink: "/studentsupport"
    },
    {
      src: "/images/slide3.jpg",
      alt: "University Building",
      title: "Modern Learning Environment",
      description: "State-of-the-art facilities and innovative teaching methods",
      buttonText: "Learn More",
      buttonLink: "/modules"
    }
  ];

  return (
    <div className="home-page">
      <Navigation />

      {/* Image Slider Section */}
      <ImageSlider images={sliderImages} />

      <section className="campus-life-section">
        <div className="campus-life-header">
          <span className="campus-life-kicker">Student Life</span>
          <h2>Discover Communities That Shape Campus Life</h2>
          <p>
            Explore student clubs and university communities that help you compete,
            connect, create, and grow beyond the classroom.
          </p>
        </div>

        <ClubGrid clubs={clubData} />
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="feature-card">
          <h2>User Management</h2>
          <p>Add, update, and manage student information efficiently.</p>
          <Link to="/userdetails">
            <button className="feature-btn">View Users</button>
          </Link>
        </div>

        <div className="feature-card">
          <h2>Learning Resources</h2>
          <p>Access and share important study materials and PDFs.</p>
          <Link to="/resources">
            <button className="feature-btn">View Resources</button>
          </Link>
        </div>

        <div className="feature-card">
          <h2>Student Wall</h2>
          <p>Connect with other students and share updates.</p>
          <Link to="/studentwall">
            <button className="feature-btn">Go to Wall</button>
          </Link>
        </div>
      </section>

      {/* Clubs Section */}
      <ClubsSection />

      {/* Announcements Section */}
      <section className="announcements">
        <h2>Latest Announcements</h2>
        <ul>
          <li>📢 New workshop registrations are now open.</li>
          <li>📚 Updated PDF notes available in resources section.</li>
          <li>🎓 Student community meeting this Friday.</li>
        </ul>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2026 Uni Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;