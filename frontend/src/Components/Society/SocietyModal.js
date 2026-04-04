/* global globalThis */
import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import {
  FiBriefcase,
  FiChevronDown,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { PiStudentBold } from "react-icons/pi";
import "./SocietyModal.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const STUDENT_ID_REGEX = /^it\d{8}$/i;
const CONTACT_NUMBER_REGEX = /^\d{10}$/;

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const trimListMarker = (line) => line.replace(/^[-*•]\s*/, "").trim();

const INITIAL_FORM_STATE = {
  fullName: "",
  email: "",
  contactNumber: "",
  studentId: "",
  faculty: "",
  year: "",
  reason: "",
};

const FACULTY_OPTIONS = [
  "Faculty of Computing",
  "Faculty of Engineering",
  "Faculty of Business",
  "Faculty of Humanities",
  "Department of Media Studies",
  "Department of Science",
];

const YEAR_OPTIONS = ["1", "2", "3", "4"];

const buildInitialFormState = (storedUser) => ({
  ...INITIAL_FORM_STATE,
  fullName: storedUser?.name || "",
  email: storedUser?.gmail || "",
  contactNumber: storedUser?.contact || "",
});

function SocietyModal({ society, clubImage, isOpen, onClose }) {
  const storedUser = getStoredUser();
  const [modalView, setModalView] = useState("details");
  const [formState, setFormState] = useState(buildInitialFormState(storedUser));
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const description = society?.description?.trim() || "No description added for this society yet.";

  const { paragraphs, bulletPoints } = useMemo(() => {
    const lines = description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const extractedBulletPoints = lines
      .filter((line) => /^[-*•]\s+/.test(line))
      .map(trimListMarker);

    const extractedParagraphs = description
      .split(/\n{2,}/)
      .map((section) => section.trim())
      .filter(Boolean)
      .map((section) =>
        section
          .split(/\r?\n/)
          .filter((line) => !/^[-*•]\s+/.test(line.trim()))
          .join(" ")
          .trim()
      )
      .filter(Boolean);

    return {
      paragraphs: extractedParagraphs.length ? extractedParagraphs : [description],
      bulletPoints: extractedBulletPoints,
    };
  }, [description]);

  useEffect(() => {
    if (!isOpen) {
      setModalView("details");
      setFormState(buildInitialFormState(storedUser));
      setFormErrors({});
      setIsSubmitting(false);
      setSubmitError("");
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    globalThis.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      globalThis.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setModalView("details");
    setFormState(buildInitialFormState(storedUser));
    setFormErrors({});
    setIsSubmitting(false);
    setSubmitError("");
  }, [society?._id, storedUser?.contact, storedUser?.gmail, storedUser?.name]);

  if (!isOpen || !society) {
    return null;
  }

  const societyName = society.name || society.societyName || "Untitled Society";
  const isImmersiveView = modalView === "form";

  const resetModalState = () => {
    setModalView("details");
    setFormState(buildInitialFormState(storedUser));
    setFormErrors({});
    setIsSubmitting(false);
    setSubmitError("");
  };

  const handleClose = () => {
    resetModalState();
    onClose();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));

    setSubmitError("");

    setFormErrors((current) => {
      if (!current[name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formState.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!formState.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!formState.contactNumber.trim()) {
      nextErrors.contactNumber = "Contact number is required.";
    } else if (!CONTACT_NUMBER_REGEX.test(formState.contactNumber.trim())) {
      nextErrors.contactNumber = "Contact number must contain exactly 10 digits.";
    }

    if (!formState.studentId.trim()) {
      nextErrors.studentId = "Student ID is required.";
    } else if (!STUDENT_ID_REGEX.test(formState.studentId.trim())) {
      nextErrors.studentId = "Student ID must be in the format IT22574886.";
    }

    if (!formState.faculty) {
      nextErrors.faculty = "Please select a faculty or department.";
    }

    if (!formState.year) {
      nextErrors.year = "Please select a year.";
    }

    if (!formState.reason.trim()) {
      nextErrors.reason = "Reason for joining is required.";
    }

    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      await axios.post(`${API}/api/membership/apply`, {
        user_id: storedUser?._id || "",
        club_id: society._id,
        club_name: societyName,
        manager_id: society.managerId || "",
        name: formState.fullName,
        email: formState.email,
        contact: formState.contactNumber,
        student_id: formState.studentId,
        faculty: formState.faculty,
        year: formState.year,
        reason: formState.reason,
      });

      setIsSubmitting(false);
      setModalView("details");
      setFormState(buildInitialFormState(storedUser));
      setFormErrors({});
      onClose();
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
      setSubmitError(
        error.response?.data?.message ||
          "Unable to submit your membership application right now."
      );
    }
  };

  const renderTextField = ({ name, label, placeholder, icon, type = "text", autoComplete }) => (
    <label className="society-form__field" htmlFor={name}>
      <span className="society-form__label">{label}</span>
      <div className={`society-form__control ${formErrors[name] ? "is-error" : ""}`}>
        <span className="society-form__icon" aria-hidden="true">
          {icon}
        </span>
        <input
          id={name}
          name={name}
          type={type}
          value={formState[name]}
          onChange={handleChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
        />
      </div>
      {formErrors[name] && <span className="society-form__error">{formErrors[name]}</span>}
    </label>
  );

  const renderSelectField = ({ name, label, placeholder, options }) => (
    <label className="society-form__field" htmlFor={name}>
      <span className="society-form__label">{label}</span>
      <div className={`society-form__control society-form__control--select ${formErrors[name] ? "is-error" : ""}`}>
        <span className="society-form__icon" aria-hidden="true">
          <FiBriefcase />
        </span>
        <select id={name} name={name} value={formState[name]} onChange={handleChange}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span className="society-form__select-arrow" aria-hidden="true">
          <FiChevronDown />
        </span>
      </div>
      {formErrors[name] && <span className="society-form__error">{formErrors[name]}</span>}
    </label>
  );

  return (
    <dialog className="society-modal" open aria-labelledby="society-modal-title">
      <button
        type="button"
        className="society-modal__overlay"
        onClick={handleClose}
        aria-label="Close society details"
      />
      <div className={`society-modal__panel ${isImmersiveView ? "society-modal__panel--immersive" : ""}`}>
        <button
          type="button"
          className={`society-modal__close ${isImmersiveView ? "society-modal__close--immersive" : ""}`}
          onClick={handleClose}
          aria-label="Close society details"
        >
          ×
        </button>

        {modalView === "details" && (
          <div className="society-modal__content">
            <div className="society-modal__copy">
              <span className="society-modal__eyebrow">Society Details</span>
              <h2 id="society-modal-title">{societyName}</h2>
              <div className="society-modal__title-accent" aria-hidden="true" />

              <div className="society-modal__description">
                {paragraphs.map((paragraph, index) => (
                  <p key={`${societyName}-paragraph-${index}`}>{paragraph}</p>
                ))}
              </div>

              {bulletPoints.length > 0 && (
                <ul className="society-modal__bullets">
                  {bulletPoints.map((point, index) => (
                    <li key={`${societyName}-point-${index}`}>{point}</li>
                  ))}
                </ul>
              )}

              <button
                type="button"
                className="society-modal__join-btn"
                onClick={() => setModalView("form")}
              >
                JOIN US <span aria-hidden="true">→</span>
              </button>
            </div>

            <div className="society-modal__media">
              <div className="society-modal__image-frame">
                <img src={clubImage} alt={societyName} className="society-modal__image" />
              </div>
            </div>
          </div>
        )}

        {modalView === "form" && (
          <div className="society-modal__form-wrap society-modal__form-wrap--immersive">
            <div className="society-modal__form-header">
              <span className="society-modal__eyebrow">Membership Application</span>
              <h2 id="society-modal-title">Join {societyName}</h2>
              <p>
                Submit your application to become part of the community. Your request will be reviewed by the club management team.
              </p>
            </div>

            <form className="society-form" onSubmit={handleSubmit} noValidate>
              {submitError && (
                <div className="society-form__submit-error">{submitError}</div>
              )}

              <div className="society-form__grid">
                {renderTextField({
                  name: "fullName",
                  label: "Full Name",
                  placeholder: "Enter your full name",
                  icon: <FiUser />,
                  autoComplete: "name",
                })}
                {renderTextField({
                  name: "email",
                  label: "Email Address",
                  type: "email",
                  placeholder: "name@example.com",
                  icon: <FiMail />,
                  autoComplete: "email",
                })}
                {renderTextField({
                  name: "contactNumber",
                  label: "Contact Number",
                  placeholder: "07X XXX XXXX",
                  icon: <FiPhone />,
                  autoComplete: "tel",
                })}
                {renderTextField({
                  name: "studentId",
                  label: "Student ID",
                  placeholder: "IT22XXXXXX",
                  icon: <PiStudentBold />,
                  autoComplete: "off",
                })}
                {renderSelectField({
                  name: "faculty",
                  label: "Faculty / Department",
                  placeholder: "Select faculty or department",
                  options: FACULTY_OPTIONS,
                })}
                {renderSelectField({
                  name: "year",
                  label: "Year",
                  placeholder: "Select year",
                  options: YEAR_OPTIONS,
                })}
              </div>

              <label className="society-form__field society-form__field--full" htmlFor="reason">
                <span className="society-form__label">Reason for Joining</span>
                <div className={`society-form__control society-form__control--textarea ${formErrors.reason ? "is-error" : ""}`}>
                  <textarea
                    id="reason"
                    name="reason"
                    value={formState.reason}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us what excites you about this club and how you would like to contribute."
                  />
                </div>
                {formErrors.reason && <span className="society-form__error">{formErrors.reason}</span>}
              </label>

              <button type="submit" className="society-form__submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        )}

      </div>
    </dialog>
  );
}

SocietyModal.propTypes = {
  society: PropTypes.shape({
    _id: PropTypes.string,
    managerId: PropTypes.string,
    name: PropTypes.string,
    societyName: PropTypes.string,
    description: PropTypes.string,
  }),
  clubImage: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

SocietyModal.defaultProps = {
  society: null,
};

export default SocietyModal;