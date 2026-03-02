import React from "react";
import { Link } from "react-router-dom";
import "./HomeNav.css";

function Nav() {
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
        <li><Link to="/societypage">Society Page</Link></li>

      </ul>
    </nav>
  );
}

export default Nav;
