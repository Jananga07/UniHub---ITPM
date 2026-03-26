import React from "react";
import PropTypes from "prop-types";
import "./SearchBar.css";

function SearchBar({ value, onChange, placeholder = "Search here", className = "" }) {
  const wrapperClassName = ["modern-search-bar", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClassName}>
      <input
        type="text"
        className="modern-search-bar__input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <span className="modern-search-bar__notch" aria-hidden="true" />
      <button type="button" className="modern-search-bar__button" tabIndex={-1} aria-hidden="true">
        <span className="modern-search-bar__icon" />
      </button>
    </div>
  );
}

SearchBar.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default SearchBar;