import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Navigate, useParams } from "react-router-dom";
import Navigation from "../HomeNav/HomeNav";
import SocietyCardGrid from "../Society/SocietyCardGrid";
import SocietyModal from "../Society/SocietyModal";
import { getClubBySlug } from "../../data/clubData";
import "./ClubDetails.css";

const API = "http://localhost:5001";

function ClubDetails() {
  const { clubName } = useParams();
  const club = getClubBySlug(clubName || "");
  const [societies, setSocieties] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const clubType = useMemo(() => {
    if (!club) {
      return "";
    }

    return club.title.replace(/\s+Clubs$/i, "").replace(/\s+Based$/i, "");
  }, [club]);

  const filteredSocieties = useMemo(() => {
    const normalizedClubType = clubType.trim().toLowerCase();

    return societies.filter(
      (society) => (society.clubType || "").trim().toLowerCase() === normalizedClubType
    );
  }, [clubType, societies]);

  useEffect(() => {
    if (!clubType) {
      return;
    }

    let isMounted = true;

    const fetchSocieties = async () => {
      setIsLoading(true);
      setLoadError("");

      try {
        const response = await axios.get(`${API}/societies`);

        if (isMounted) {
          setSocieties(response.data.societies || []);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error.response?.data?.message || "Failed to load societies.");
          setSocieties([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSocieties();

    return () => {
      isMounted = false;
    };
  }, [clubType]);

  if (!club) {
    return <Navigate to="/" replace />;
  }

  let societiesContent;

  if (isLoading) {
    societiesContent = (
      <div className="club-details-societies-state">
        <p>Loading societies...</p>
      </div>
    );
  } else if (loadError) {
    societiesContent = (
      <div className="club-details-societies-state club-details-societies-state--error">
        <p>{loadError}</p>
      </div>
    );
  } else if (filteredSocieties.length === 0) {
    societiesContent = (
      <div className="club-details-societies-state">
        <p>No societies have been added for this club type yet.</p>
      </div>
    );
  } else {
    societiesContent = (
      <SocietyCardGrid societies={filteredSocieties} onSelect={setSelectedSociety} />
    );
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
          <h1>{club.title}</h1>
          <p>{club.description}</p>
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

      <section className="club-details-societies">
        <div className="club-details-societies__header">
          <h2>{club.title} Societies</h2>
          <p>Only societies with the selected club type are shown on this page.</p>
        </div>
        {societiesContent}
      </section>

      <SocietyModal
        society={selectedSociety}
        clubImage={club.image}
        isOpen={Boolean(selectedSociety)}
        onClose={() => setSelectedSociety(null)}
      />
    </div>
  );
}


export default ClubDetails;
