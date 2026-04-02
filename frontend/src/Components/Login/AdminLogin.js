import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const ADMIN_EMAIL    = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

function AdminLogin() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({ gmail: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (inputs.gmail === ADMIN_EMAIL && inputs.password === ADMIN_PASSWORD) {
      const adminUser = { gmail: ADMIN_EMAIL, role: "admin", name: "Admin" };
      localStorage.setItem("user", JSON.stringify(adminUser));
      navigate("/");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>Admin Login</h1>
          <p className="login-subtitle">Restricted to administrators only.</p>

          <input
            type="email"
            name="gmail"
            placeholder="Admin Email"
            value={inputs.gmail}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={inputs.password}
            onChange={handleChange}
            required
          />

          {error && (
            <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "10px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button type="submit">Sign In</button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
