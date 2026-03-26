import React from "react";
import PropTypes from "prop-types";
import "./searchIcon.css";

function SearchBar({ value, onChange, placeholder = "Search here", className = "" }) {
  const wrapperClassName = className || "search-bar";

  return (
    <div className={wrapperClassName}>
      <input
        type="text"
        className="search-input-field"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <span className="search-bar-notch" aria-hidden="true" />
      <button type="button" className="search-button" tabIndex={-1} aria-hidden="true">
        <span className="search-button__icon" />
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