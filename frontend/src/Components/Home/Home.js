import React from "react";
import { Link } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Home.css";

function Home() {
  return (
    <div className="home-page">

      <Nav />

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-text">
          <h1>Welcome to Uni Hub</h1>
          <p>Your hub for learning resources, student management, and community support.</p>
          <Link to="/adduser">
            <button className="cta-btn">Get Started</button>
          </Link>
        </div>
        <div className="hero-image">
          <img src="/images/students_illustration.svg" alt="Students Illustration" />
        </div>
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