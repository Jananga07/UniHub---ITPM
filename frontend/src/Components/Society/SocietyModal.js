/* global globalThis */
import React, { useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import "./SocietyModal.css";

const trimListMarker = (line) => line.replace(/^[-*•]\s*/, "").trim();

function SocietyModal({ society, clubImage, isOpen, onClose }) {
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

  if (!isOpen || !society) {
    return null;
  }

  const societyName = society.name || society.societyName || "Untitled Society";

  return (
    <dialog className="society-modal" open aria-labelledby="society-modal-title">
      <button
        type="button"
        className="society-modal__overlay"
        onClick={onClose}
        aria-label="Close society details"
      />
      <div className="society-modal__panel">
        <button type="button" className="society-modal__close" onClick={onClose} aria-label="Close society details">
          ×
        </button>

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
          </div>

          <div className="society-modal__media">
            <div className="society-modal__image-frame">
              <img src={clubImage} alt={societyName} className="society-modal__image" />
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}

SocietyModal.propTypes = {
  society: PropTypes.shape({
    _id: PropTypes.string,
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