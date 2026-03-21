import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";
import axios from "axios";

const API = "http://localhost:5001";

function StarRating({ pdfId, currentRating, ratingCount, onRated }) {
  const [hover, setHover] = useState(0);

  const handleRate = async (val) => {
    const userId = localStorage.getItem("userId") || "";
    try {
      const res = await axios.post(`${API}/resources/pdfs/${pdfId}/rate`, {
        rating: val,
        userId,
      });
      onRated(res.data);
    } catch {
      alert("Rating failed. Please try again.");
    }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div className="res-stars">
        {[1, 2, 3, 4, 5].map((s) => (
          <span
            key={s}
            className={`res-star ${s <= (hover || Math.round(currentRating)) ? "filled" : ""}`}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => handleRate(s)}
          >
            ★
          </span>
        ))}
      </div>
      <span style={{ fontSize: 12, color: "#6b7280" }}>
        {currentRating > 0 ? `${currentRating} / 5` : "Not rated"}{" "}
        ({ratingCount} {ratingCount === 1 ? "rating" : "ratings"})
      </span>
    </div>
  );
}

function PdfListPage() {
  const navigate  = useNavigate();
  const { moduleId, category } = useParams();
  const categoryLabel = decodeURIComponent(category);

  const [pdfs, setPdfs]     = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPdfs = () => {
    setLoading(true);
    axios
      .get(`${API}/resources/pdfs`, {
        params: { module: moduleId, category: categoryLabel, status: "approved" },
      })
      .then((r) => setPdfs(r.data.pdfs))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPdfs();
    // eslint-disable-next-line
  }, [moduleId, category]);

  const handleDownload = (pdf) => {
    // Open the download endpoint — server increments counter & sends file
    window.open(`${API}/resources/pdfs/${pdf._id}/download`, "_blank");
    // Optimistically update local count
    setPdfs((prev) =>
      prev.map((p) =>
        p._id === pdf._id ? { ...p, downloadCount: (p.downloadCount || 0) + 1 } : p
      )
    );
  };

  const handleRated = (pdfId, data) => {
    setPdfs((prev) =>
      prev.map((p) =>
        p._id === pdfId
          ? { ...p, averageRating: data.averageRating, ratings: p.ratings }
          : p
      )
    );
  };

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">
          <span onClick={() => navigate("/resources")}>Resources</span>
          {" / "}
          <span onClick={() => navigate(`/resources/modules/${moduleId}`)}>Module</span>
          {" / "}
          {categoryLabel}
        </div>
        <h1>{categoryLabel}</h1>
        <p>Approved study materials available for download</p>
      </div>

      <button
        className="res-back-btn"
        onClick={() => navigate(`/resources/modules/${moduleId}`)}
      >
        ← Back to Categories
      </button>

      {loading ? (
        <div className="res-empty">Loading files…</div>
      ) : pdfs.length === 0 ? (
        <div className="res-empty">
          No approved materials available for this category yet.
        </div>
      ) : (
        <div className="res-pdf-list">
          {pdfs.map((pdf) => (
            <div key={pdf._id} className="res-pdf-card">
              <div className="res-pdf-icon">📄</div>
              <div className="res-pdf-info">
                <h4>{pdf.title}</h4>
                <div className="res-pdf-meta">
                  <span>📥 {pdf.downloadCount || 0} downloads</span>
                  <span>📁 {pdf.fileName}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <StarRating
                    pdfId={pdf._id}
                    currentRating={pdf.averageRating || 0}
                    ratingCount={pdf.ratings ? pdf.ratings.length : 0}
                    onRated={(data) => handleRated(pdf._id, data)}
                  />
                </div>
              </div>
              <div className="res-actions">
                <button
                  className="res-btn res-btn-primary"
                  onClick={() => handleDownload(pdf)}
                >
                  ⬇ Download
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PdfListPage;
