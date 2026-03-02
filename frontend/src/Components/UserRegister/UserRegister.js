import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserRegister.css";

function UserRegister() {
  const navigate = useNavigate();

  // ✅ Form state
  const [inputs, setInputs] = useState({
    name: "",
    gmail: "",
    password: "",
    role: "Student",   // Fixed role for students
    age: "",
    address: "",
    contact: ""
  });

  // Handle input changes
  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5001/users", inputs);
      console.log(res.data);
      alert("User Registered Successfully!");
      navigate("/login"); // Navigate to login after successful registration
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Registration Failed!");
    }
  };

  return (
    <div className="register-page">
      {/* Centered form container */}
      <div className="register-container">
        <form className="register-form" onSubmit={handleSubmit}>
          <h1>Register as Student</h1>

          {/* Name */}
          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={inputs.name}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <input
            type="email"
            name="gmail"
            placeholder="Enter Email"
            value={inputs.gmail}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            value={inputs.password}
            onChange={handleChange}
            required
          />

          {/* Role (Fixed to Student) */}
          <select
            name="role"
            value="Student"
            disabled
            className="role-select"
          >
            <option value="Student">Student</option>
          </select>

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Enter Age"
            value={inputs.age}
            onChange={handleChange}
          />

          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Enter Address"
            value={inputs.address}
            onChange={handleChange}
          />

          {/* Contact */}
          <input
            type="text"
            name="contact"
            placeholder="Enter Contact Number"
            value={inputs.contact}
            onChange={handleChange}
          />

          {/* Submit Button */}
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default UserRegister;