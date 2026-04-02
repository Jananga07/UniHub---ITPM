import React from "react";
import { Link } from "react-router-dom";
import Navigation from "../HomeNav/HomeNav";
import ClubGrid from "../ClubGrid/ClubGrid.js";
import ImageSlider from "../ImageSlider/ImageSlider";
import Leaderboard from "../Leaderboard/Leaderboard";
import { clubData } from "../../data/clubData.js";
import "./Home.css";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

function Home() {
  const user = getUser();
  const role = user?.role?.trim().toLowerCase();
  const isStudent = role === "student";
  const isAdmin   = role === "admin" || role === "administrator";

  const sliderImages = [
    {
      src: "/images/slide1.jpg",
      alt: "University Campus",
      title: "Welcome to Uni Hub",
      description: "Your comprehensive platform for learning, collaboration, and student success",
      buttonText: isStudent ? "My Profile" : isAdmin ? "Dashboard" : "Get Started",
      buttonLink: isStudent ? `/studentprofile/${user._id}` : isAdmin ? "/admin" : "/userRegister",
    },
    {
      src: "/images/slide2.jpg",
      alt: "Student Learning",
      title: "Excellence in Education",
      description: "Access quality resources, expert guidance, and a supportive community",
      buttonText: "Explore Resources",
      buttonLink: "/resources",
    },
    {
      src: "/images/slide3.jpg",
      alt: "University Building",
      title: "Modern Learning Environment",
      description: "State-of-the-art facilities and innovative teaching methods",
      buttonText: "Student Support",
      buttonLink: "/studentsupport",
    },
  ];

  return (
    <div className="home-page">
      <Navigation />

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

      <section className="features">

        {!user && (
          <>
            <div className="feature-card">
              <h2>Learning Resources</h2>
              <p>Access and share important study materials and PDFs.</p>
              <Link to="/resources"><button className="feature-btn">View Resources</button></Link>
            </div>
            <div className="feature-card">
              <h2>Student Support</h2>
              <p>Book consultants and get the help you need.</p>
              <Link to="/studentsupport"><button className="feature-btn">Get Support</button></Link>
            </div>
            <div className="feature-card">
              <h2>Join Us</h2>
              <p>Create an account to access all features.</p>
              <Link to="/userRegister"><button className="feature-btn">Register</button></Link>
            </div>
          </>
        )}

        {isStudent && (
          <>
            <div className="feature-card">
              <h2>Learning Resources</h2>
              <p>Access study materials, PDFs and module quizzes.</p>
              <Link to="/resources"><button className="feature-btn">View Resources</button></Link>
            </div>
            <div className="feature-card">
              <h2>Student Support</h2>
              <p>Book a consultant session or raise a complaint.</p>
              <Link to="/studentsupport"><button className="feature-btn">Get Support</button></Link>
            </div>
            <div className="feature-card">
              <h2>My Profile</h2>
              <p>View your profile, societies and modules.</p>
              <Link to={`/studentprofile/${user._id}`}><button className="feature-btn">My Profile</button></Link>
            </div>
          </>
        )}

        {isAdmin && (
          <>
            <div className="feature-card">
              <h2>Admin Dashboard</h2>
              <p>Manage users, societies, resources and quizzes.</p>
              <Link to="/admin"><button className="feature-btn">Go to Dashboard</button></Link>
            </div>
            <div className="feature-card">
              <h2>Complaint Handling</h2>
              <p>Review and resolve student complaints.</p>
              <Link to="/admin"><button className="feature-btn">View Complaints</button></Link>
            </div>
            <div className="feature-card">
              <h2>Resources</h2>
              <p>Manage faculties, modules and uploaded PDFs.</p>
              <Link to="/admin"><button className="feature-btn">Manage Resources</button></Link>
            </div>
          </>
        )}

      </section>

      <Leaderboard />

      <section className="announcements">
        <h2>Latest Announcements</h2>
        <ul>
          <li>📢 New workshop registrations are now open.</li>
          <li>📚 Updated PDF notes available in resources section.</li>
          <li>🎓 Student community meeting this Friday.</li>
        </ul>
      </section>

      <footer className="footer">
        <p>&copy; 2026 Uni Hub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
