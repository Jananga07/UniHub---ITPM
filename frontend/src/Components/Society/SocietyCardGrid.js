import React from "react";
import PropTypes from "prop-types";
import {
  FaCameraRetro,
  FaFutbol,
  FaGlobe,
  FaHandsHelping,
  FaPalette,
  FaPrayingHands,
} from "react-icons/fa";
import "./SocietyCardGrid.css";

const societyIconByType = {
  Sports: FaFutbol,
  Activity: FaHandsHelping,
  Cultural: FaPalette,
  Media: FaCameraRetro,
  International: FaGlobe,
  Religious: FaPrayingHands,
};

function SocietyCardGrid({ societies, onSelect }) {
  return (
    <div className="society-card-grid" role="list">
      {societies.map((society, index) => {
        const Icon = societyIconByType[society.clubType] || FaHandsHelping;
        const societyName = society.name || society.societyName || "Untitled Society";

        return (
          <button
            key={society._id || `${societyName}-${index}`}
            type="button"
            className="society-card-grid__card"
            onClick={() => onSelect(society)}
          >
            <div className="society-card-grid__accent" aria-hidden="true" />
            <div className="society-card-grid__icon-wrap">
              <span className="society-card-grid__icon-shell" aria-hidden="true">
                <Icon className="society-card-grid__icon" />
              </span>
            </div>
            <div className="society-card-grid__body">
              <h3>{societyName}</h3>
              <p>{society.clubType} Society</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

SocietyCardGrid.propTypes = {
  societies: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
      societyName: PropTypes.string,
      clubType: PropTypes.string,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default SocietyCardGrid;