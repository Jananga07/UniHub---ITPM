import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { clubData } from "../../data/clubData";
import "./HomeNav.css";

function Nav() {
  const [isStudentLifeOpen, setIsStudentLifeOpen] = useState(false);
  const closeTimeoutRef = useRef(null);
  const location = useLocation();

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleStudentLifeEnter = () => {
    clearCloseTimeout();
    setIsStudentLifeOpen(true);
  };

  const handleStudentLifeLeave = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setIsStudentLifeOpen(false);
    }, 180);
  };

  const closeStudentLifeMenu = () => {
    clearCloseTimeout();
    setIsStudentLifeOpen(false);
  };

  useEffect(() => {
    closeStudentLifeMenu();

    return () => {
      clearCloseTimeout();
    };
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">StudentSupport</Link>
      </div>

      <ul className="nav-links">
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/userRegister">Register</NavLink></li>
        <li><NavLink to="/login">Login</NavLink></li>
        <li><NavLink to="/admin">Admin</NavLink></li>
        <li><NavLink to="/modulepage">Module Page</NavLink></li>
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
                onClick={closeStudentLifeMenu}
              >
                {club.title}
              </NavLink>
            ))}
          </div>
        </li>
        <li><NavLink to="/studentsupport">Student Support</NavLink></li>
        <li><NavLink to="/resources">Resources</NavLink></li>
        <li><NavLink to="/faq">FAQ</NavLink></li>

      </ul>
    </nav>
  );
}
export default Nav;