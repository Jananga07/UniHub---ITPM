import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { clubData } from "../../data/clubData.js";
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
  }, [location.pathname, closeStudentLifeMenu]);

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">StudentSupport</Link>
      </div>

      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/userRegister">Register</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/admin">Admin</Link></li>
        <li><Link to="/modulepage">Module Page</Link></li>
        <li><Link to="/studentsupport">Student Support</Link></li>
        <li><Link to="/resources">Resources</Link></li>
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
                onClick={closeStudentLifeMenu}
              >
                {club.title}
              </NavLink>
            ))}
          </div>
        </li>
        

        



        <li><Link to="/societypage">Society Page</Link></li>


      </ul>
    </nav>
  );
}
export default Nav;