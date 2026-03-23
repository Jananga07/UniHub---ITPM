import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Navigation from "../HomeNav/HomeNav";
import { getClubBySlug } from "../../data/clubData";
import "./ClubDetails.css";

function ClubDetails() {
  const { clubName } = useParams();
  const club = getClubBySlug(clubName || "");

  if (!club) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="club-details-page">
      <Navigation />

      <section className="club-details-hero">
        <div
          className="club-details-hero__image"
          style={{ backgroundImage: `url(${club.image})` }}
          aria-hidden="true"
        />
        <div className={`club-details-hero__overlay ${club.overlayClass}`} aria-hidden="true" />

        <div className="club-details-hero__content">
          <span className="club-details-hero__eyebrow">Club Spotlight</span>
          <h1>{club.title}</h1>
          <p>{club.description}</p>
          <div className="club-details-hero__actions">
            <Link to="/societypage" className="club-details-btn club-details-btn--primary">
              Explore Student Life
            </Link>
            <Link to="/" className="club-details-btn club-details-btn--secondary">
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <section className="club-details-body">
        <div className="club-details-card">
          <h2>About {club.title}</h2>
          <p>{club.details}</p>
        </div>

        <div className="club-details-card club-details-card--accent">
          <h2>Why Join?</h2>
          <ul>
            <li>Connect with students who share similar interests and goals.</li>
            <li>Build practical experience through activities, events, and teamwork.</li>
            <li>Grow leadership, communication, and community engagement skills.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}

export default ClubDetails;