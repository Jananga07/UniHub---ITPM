import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

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
      const res = await axios.post("http://localhost:5001/users/login", inputs);

      console.log(res.data); // ✅ DEBUG

      if (res.data.status === "ok") {
        alert("Login Successful!");

        const user = res.data.user;
        const role = (user.role || "").trim().toLowerCase();

        localStorage.setItem("user", JSON.stringify(user));

        // ✅ ROLE BASED REDIRECT
        if (role === "student") {
          navigate(`/studentprofile/${user._id}`);
        } 
        else if (role === "societymanager" || role === "manager" || role === "society manager") {
          navigate(`/SocietyManagerProfile/${user._id}`);
        } 
        else if (role === "admin") {
          navigate(`/admin`);
        } 
        else {
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