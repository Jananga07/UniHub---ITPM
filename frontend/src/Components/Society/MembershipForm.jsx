/* global globalThis */
import React, { useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Navigation from "../HomeNav/HomeNav";
import "./MembershipForm.css";

const API_BASE = "http://localhost:5001";

const initialState = {
  fullName: "",
  placeOfBirth: "",
  dateOfBirth: "",
  address: "",
  nationality: "",
  cityCountry: "",
  gender: "",
  email: "",
  phone: "",
  membershipType: "Regular",
};

function MembershipForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { societyId } = useParams();
  const [formData, setFormData] = useState(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const societyName = useMemo(() => location.state?.societyName || "Selected Society", [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      alert("Please log in to submit membership");
      navigate("/login");
      return;
    }

    let user;

    try {
      user = JSON.parse(storedUser);
    } catch (error) {
      console.error("Failed to parse stored user", error);
      alert("Please log in again");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);

    try {
      await axios.post(`${API_BASE}/api/memberships`, {
        ...formData,
        userId: user._id,
        societyId,
      });

      alert("Membership submitted successfully");
      navigate(-1);
    } catch (error) {
      alert(error.response?.data?.message || "Unable to submit membership right now");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const shouldCancel = globalThis.confirm("Are you sure you want to cancel?");

    if (!shouldCancel) {
      return;
    }

    navigate(-1);
  };

  return (
    <div className="membership-page">
      <Navigation />

      <main className="membership-page__shell">
        <section className="membership-page__card">
          <div className="membership-page__hero">
            <p className="membership-page__eyebrow">Membership Application</p>
            <h1>Membership Form</h1>
            <p className="membership-page__subtitle">{societyName}</p>
          </div>

          <form className="membership-form" onSubmit={handleSubmit}>
            <section className="membership-form__section">
              <h2>Personal Information</h2>
              <div className="membership-form__grid">
                <label className="membership-form__field">
                  <span>Full Name</span>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>Place of Birth</span>
                  <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>Date of Birth</span>
                  <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required />
                </label>
                <label className="membership-form__field membership-form__field--wide">
                  <span>Address</span>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>Nationality</span>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>City/Country</span>
                  <input type="text" name="cityCountry" value={formData.cityCountry} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>Gender</span>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
                <label className="membership-form__field">
                  <span>Email</span>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                </label>
                <label className="membership-form__field">
                  <span>Phone Number</span>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
                </label>
              </div>
            </section>

            <section className="membership-form__section">
              <h2>Membership Type</h2>
              <div className="membership-form__plans">
                {[
                  ["Regular", "3 months"],
                  ["Gold", "6 months"],
                  ["Platinum", "12 months"],
                ].map(([value, duration]) => (
                  <div key={value} className="membership-form__plan">
                    <input
                      id={`membership-plan-${value.toLowerCase()}`}
                      type="radio"
                      name="membershipType"
                      value={value}
                      checked={formData.membershipType === value}
                      onChange={handleChange}
                    />
                    <label className="membership-form__plan-copy" htmlFor={`membership-plan-${value.toLowerCase()}`}>
                      <strong>{value}</strong>
                      <small>{duration}</small>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="membership-form__section">
              <h2>Terms & Conditions</h2>
              <p className="membership-form__terms">
                By submitting this membership application, you confirm that the information provided is accurate and you agree to comply with the rules, participation requirements, and conduct standards of the selected society.
              </p>
            </section>

            <div className="membership-form__actions">
              <button type="button" className="cancel-btn" onClick={handleCancel} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="membership-form__submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default MembershipForm;