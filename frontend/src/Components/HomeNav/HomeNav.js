import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { clubData } from "../../data/clubData.js";
import "./HomeNav.css";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

function Nav() {
  const [isStudentLifeOpen, setIsStudentLifeOpen] = useState(false);
  const [user, setUser] = useState(getUser);
  const closeTimeoutRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Re-read user from localStorage on every route change
  useEffect(() => {
    setUser(getUser());
    setIsStudentLifeOpen(false);
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
  }, [location.pathname]);

  const role = user?.role?.trim().toLowerCase();
  const isStudent = role === "student";
  const isAdmin   = role === "admin" || role === "administrator";

  const handleStudentLifeEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsStudentLifeOpen(true);
  };

  const handleStudentLifeLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => setIsStudentLifeOpen(false), 180);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">UniHub</Link>
      </div>

      <ul className="nav-links">

        {/* ── DEFAULT (not logged in) ── */}
        {!user && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/admin-login">Admin Login</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </>
        )}

        {/* ── STUDENT ── */}
        {isStudent && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to={`/studentprofile/${user._id}`}>My Profile</Link></li>
            <li><Link to="/resources">Resources</Link></li>
            <li><Link to="/studentsupport">Student Support</Link></li>
            <li><Link to="/complaint-form">Complaints</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li
              className={`nav-dropdown ${isStudentLifeOpen ? "nav-dropdown-open" : ""}`}
              onMouseEnter={handleStudentLifeEnter}
              onMouseLeave={handleStudentLifeLeave}
            >
              <NavLink to="/student-life" className="nav-dropdown-trigger">
                Student Life
              </NavLink>
              <div className="nav-dropdown-menu">
                {clubData.map((club) => (
                  <NavLink
                    key={club.slug}
                    to={`/clubs/${club.slug}`}
                    className="nav-dropdown-item"
                    onClick={() => setIsStudentLifeOpen(false)}
                  >
                    {club.title}
                  </NavLink>
                ))}
              </div>
            </li>
          </>
        )}

        {/* ── ADMIN ── */}
        {isAdmin && (
          <>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/admin">Dashboard</Link></li>
          </>
        )}

        {/* ── LOGOUT (any logged-in user) ── */}
        {user && (
          <li>
            <button onClick={handleLogout} className="nav-logout-btn">
              Logout
            </button>
          </li>
        )}

      </ul>
    </nav>
  );
}

export default Nav;
