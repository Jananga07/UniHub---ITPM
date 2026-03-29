import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserRegister.css";

function UserRegister() {
  const navigate = useNavigate();

  // Role is not shown in the UI — only student registration uses this page; API gets role: "student" on submit.
  const [inputs, setInputs] = useState({
    name: "",
    gmail: "",
    password: "",
    age: "",
    address: "",
    contact: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setInputs((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateInputs = () => {
    const trimmedName = inputs.name.trim();
    const trimmedEmail = inputs.gmail.trim();
    const trimmedPassword = inputs.password.trim();
    const trimmedAddress = inputs.address.trim();
    const trimmedContact = inputs.contact.trim();
    const ageNumber = Number(inputs.age);

    if (!trimmedName) return "Name is required.";
    if (!trimmedEmail) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) return "Enter a valid email address.";
    if (!trimmedPassword) return "Password is required.";
    if (trimmedPassword.length < 6) return "Password must be at least 6 characters.";
    if (!inputs.age) return "Age is required.";
    if (!Number.isInteger(ageNumber) || ageNumber < 16 || ageNumber > 100) {
      return "Age must be between 16 and 100.";
    }
    if (!trimmedAddress) return "Address is required.";
    if (!trimmedContact) return "Contact number is required.";
    if (!/^\+?\d{10,15}$/.test(trimmedContact)) {
      return "Contact number must be 10 to 15 digits.";
    }

    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const payload = {
        name: inputs.name.trim(),
        gmail: inputs.gmail.trim().toLowerCase(),
        password: inputs.password.trim(),
        role: "student",
        age: Number(inputs.age),
        address: inputs.address.trim(),
        contact: inputs.contact.trim(),
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL || "http://localhost:5001"}/users`, payload);
      console.log(res.data);
      alert("User Registered Successfully!");
      navigate("/login");
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
          <p className="register-subtitle">
            This form is for <strong>student accounts only</strong>. Your role is set automatically — no need to choose it.
          </p>
          {error && <p className="register-error" role="alert">{error}</p>}

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

          {/* Age */}
          <input
            type="number"
            name="age"
            placeholder="Enter Age"
            value={inputs.age}
            onChange={handleChange}
            min="16"
            max="100"
            required
          />

          {/* Address */}
          <input
            type="text"
            name="address"
            placeholder="Enter Address"
            value={inputs.address}
            onChange={handleChange}
            required
          />

          {/* Contact */}
          <input
            type="text"
            name="contact"
            placeholder="Enter Contact Number"
            value={inputs.contact}
            onChange={handleChange}
            pattern="^\+?\d{10,15}$"
            title="Contact number must be 10 to 15 digits"
            required
          />

          {/* Submit Button */}
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default UserRegister;