import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./ClubGrid.css";

function ClubGrid({ clubs }) {
  return (
    <div className="club-grid">
      {clubs.map((club) => (
        <article key={club.slug} className={`club-grid-card ${club.overlayClass}`}>
          <div
            className="club-grid-card__image"
            style={{ backgroundImage: `url(${club.image})` }}
            aria-hidden="true"
          />
          <div className="club-grid-card__overlay" aria-hidden="true" />
          <div className="club-grid-card__content">
            <h3>{club.title}</h3>
            <p>{club.description}</p>
            <Link to={`/clubs/${club.slug}`} className="club-grid-card__button">
              Learn More
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

ClubGrid.propTypes = {
  clubs: PropTypes.arrayOf(
    PropTypes.shape({
      slug: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      image: PropTypes.string.isRequired,
      overlayClass: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ClubGrid;