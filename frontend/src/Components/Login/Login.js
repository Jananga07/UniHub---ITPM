import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5001";

/** Normalize DB role strings for routing (e.g. "Admin", "societyManager", "Society Manager"). */
function normalizeRole(role) {
  return String(role ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function Login() {
  const navigate = useNavigate();

  const [inputs, setInputs] = useState({
    gmail: "",
    password: ""
  });

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${API_BASE}/users/login`, inputs);

      if (res.data.status === "ok") {
        alert("Login Successful!");

        const user = res.data.user;
        const role = normalizeRole(user.role);

        localStorage.setItem("user", JSON.stringify(user));

        // Same form for all roles — route by normalized role
        if (role === "student") {
          navigate(`/studentprofile/${user._id}`);
        } else if (role === "societymanager" || role === "manager") {
          navigate(`/SocietyManagerProfile/${user._id}`);
        } else if (role === "admin" || role === "administrator") {
          navigate("/admin");
        } else {
          alert("Unknown role: " + user.role);
        }

      } else {
        alert(res.data.message || "Login Failed");
      }

    } catch (err) {
      console.error(err);
      alert("Login Failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Login</h1>
          <p className="login-subtitle">
            Students, society managers, and admins use this page to sign in.
          </p>

          <input
            type="email"
            name="gmail"
            placeholder="Enter Email"
            value={inputs.gmail}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={inputs.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;