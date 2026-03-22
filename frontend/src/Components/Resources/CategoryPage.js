import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Nav from "../HomeNav/HomeNav";
import "./Resources.css";
import axios from "axios";

const API = "http://localhost:5001";

const CATEGORIES = [
  { key: "Lecture Material",  icon: "📝", desc: "Slides and lecture notes" },
  { key: "Reading Material",  icon: "📕", desc: "Textbooks and references" },
  { key: "Short Notes",       icon: "🗒️", desc: "Quick summary notes" },
  { key: "Referral Sheets",   icon: "📋", desc: "Formula sheets and cheat-sheets" },
];

function CategoryPage() {
  const navigate = useNavigate();
  const { moduleId } = useParams();
  const [mod, setMod]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch module info for the breadcrumb
    axios
      .get(`${API}/resources/modules`, { params: {} })
      .catch(() => null);

    // get single module by fetching all and matching — simple approach
    axios
      .get(`${API}/resources/modules`)
      .then((r) => {
        const found = r.data.modules.find((m) => m._id === moduleId);
        setMod(found || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [moduleId]);

  return (
    <div className="res-page">
      <Nav />
      <div className="res-hero">
        <div className="res-hero-breadcrumb">
          <span onClick={() => navigate("/resources")}>Resources</span>
          {" / "}
          {mod ? mod.moduleName : "Module"}
          {" / "}Categories
        </div>
        <h1>{loading ? "Loading…" : mod ? mod.moduleName : "Module"}</h1>
        <p>Select a category to view available study materials</p>
      </div>

      <button className="res-back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="res-grid">
        {CATEGORIES.map(({ key, icon, desc }) => (
          <div
            key={key}
            className="res-card res-cat-card"
            onClick={() => navigate(`/resources/modules/${moduleId}/category/${encodeURIComponent(key)}`)}
          >
            <div className="res-card-icon">{icon}</div>
            <h3>{key}</h3>
            <p>{desc}</p>
            <div className="res-card-arrow">→</div>
          </div>
        ))}
      </div>

      {/* Upload section for users */}
      <UploadSection moduleId={moduleId} />
    </div>
  );
}

function UploadSection({ moduleId }) {
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].key);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg]           = useState("");
  const [titleErr, setTitleErr] = useState("");

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!/^[a-zA-Z0-9\s]*$/.test(val)) {
      setTitleErr("❌ Symbols like @, $, % are not valid. Please use only letters and numbers.");
    } else {
      setTitleErr("");
    }
    setTitle(val);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setMsg("❌ Please select a valid PDF file. Images/other formats are not allowed.");
      setFile(null);
      e.target.value = null; // reset input
    } else {
      setMsg("");
      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (titleErr) return setMsg("❌ Please fix title errors before uploading.");
    if (!file) return setMsg("Please select a PDF file.");
    setUploading(true);
    setMsg("");

    const userId = localStorage.getItem("userId") || "";
    const formData = new FormData();
    formData.append("title", title);
    formData.append("module", moduleId);
    formData.append("category", category);
    formData.append("uploadedBy", userId);
    formData.append("file", file);

    try {
      await axios.post(`${API}/resources/pdfs/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("✅ Uploaded successfully! Awaiting admin approval.");
      setTitle(""); setFile(null);
    } catch (err) {
      setMsg("❌ Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="res-upload-zone">
      <h3>📤 Upload Study Material</h3>
      <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
        Your upload will be reviewed by an admin before becoming publicly visible.
      </p>
      <form onSubmit={handleUpload}>
        <input
          type="text"
          placeholder="Title / Description"
          value={title}
          onChange={handleTitleChange}
          required
        />
        {titleErr && <p style={{ fontSize: 13, margin: "-10px 0 10px 0", color: "#ef4444" }}>{titleErr}</p>}
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.key} value={c.key}>{c.key}</option>
          ))}
        </select>
        <input
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          required
        />
        {msg && <p style={{ fontSize: 13, marginBottom: 10 }}>{msg}</p>}
        <button className="res-upload-btn" type="submit" disabled={uploading}>
          {uploading ? "Uploading…" : "Upload PDF"}
        </button>
      </form>
    </div>
  );
}

export default CategoryPage;
