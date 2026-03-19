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




        <li><Link to="/societypage">Student Life</Link></li>

        <li><Link to="/studentsupport">Student Support</Link></li>



        <li><Link to="/societypage">Society Page</Link></li>

=======
>>>>>>> 84e4d658e1813d8d8e971fb160ecb0e1a13aa93e

      </ul>
    </nav>
  );
}
export default Nav;