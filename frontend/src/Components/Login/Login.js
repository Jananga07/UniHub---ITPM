import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // ✅ Login form state
  const [inputs, setInputs] = useState({
    gmail: "",
    password: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5001/users/login", inputs);

      if (res.data.status === "ok") {
        alert("Login Successful!");
        localStorage.setItem("userId", res.data.userId);
        navigate(`/StudentProfile/${res.data.userId}`); // Redirect to profile
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

          {/* Email input */}
          <input
            type="email"
            name="gmail"
            placeholder="Enter Email"
            value={inputs.gmail}
            onChange={handleChange}
            required
          />

          {/* Password input */}
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={inputs.password}
            onChange={handleChange}
            required
          />

          {/* Login button */}
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}

export default Login;