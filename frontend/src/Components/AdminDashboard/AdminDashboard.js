import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./ResourcesAdmin.css";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { FaCheckCircle, FaTrashAlt, FaUsers, FaUserGraduate, FaUserTie } from "react-icons/fa";
import ConsultantBookingManagement from "../ConsultantBookingManagement/ConsultantBookingManagement";
import ComplaintHandling from "../ComplaintHandling/ComplaintHandling";

import SearchBar from "../SearchBar/SearchBar.js";
import "../SearchBar/managersSearch.css";
import "../SearchBar/societiesSearch.css";
import { clubTypeOptions } from "../../data/clubData.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const CATEGORIES = ["Lecture Material", "Reading Material", "Short Notes", "Referral Sheets"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^\+?\d{10,15}$/;

const isUniversityEmail = (email) => {
  const domain = email.split("@")[1] || "";
  return /\.(edu|ac\.[a-z]{2,})$/i.test(domain);
};

const normalizeContactNumber = (contactNumber = "") => contactNumber.trim().replaceAll(/[\s-]/g, "");

// ─── FACULTY MANAGEMENT TAB ─────────────────────────────────────────────────
function FacultyTab() {
  const [faculties, setFaculties] = useState([]);
  const [newName, setNewName]     = useState("");
  const [editId, setEditId]       = useState(null);
  const [editName, setEditName]   = useState("");

  const load = () =>
    axios.get(`${API}/resources/faculties`).then((r) => setFaculties(r.data.faculties));

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!newName.trim()) return alert("Enter a faculty name");
    await axios.post(`${API}/resources/faculties`, { name: newName.trim() });
    setNewName(""); load();
  };

  const save = async (id) => {
    if (!editName.trim()) return alert("Enter a valid faculty name");
    await axios.put(`${API}/resources/faculties/${id}`, { name: editName.trim() });
    setEditId(null); setEditName(""); load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;
    await axios.delete(`${API}/resources/faculties/${id}`);
    load();
  };

  return (
    <div>
      <h2 className="ra-section-title">Faculty Management</h2>
      <div className="ra-add-row">
        <input
          className="ra-input"
          placeholder="New faculty name…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="dashboard-btn" onClick={add}>+ Add Faculty</button>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>#</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {faculties.map((f, i) => (
              <tr key={f._id}>
                <td>{i + 1}</td>
                <td>
                  {editId === f._id
                    ? <input className="ra-input-sm" value={editName} onChange={(e) => setEditName(e.target.value)} />
                    : f.name}
                </td>
                <td>
                  {editId === f._id
                    ? <button className="dashboard-btn" onClick={() => save(f._id)}>Save</button>
                    : <>
                        <button className="dashboard-btn" onClick={() => { setEditId(f._id); setEditName(f.name); }}>Edit</button>{" "}
                        <button className="dashboard-btn ra-btn-danger" onClick={() => remove(f._id)}>Delete</button>
                      </>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── RESOURCE MODULE MANAGEMENT TAB ─────────────────────────────────────────
function ResourceModuleTab() {
  const [modules,   setModules]   = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [form, setForm]           = useState({ moduleName: "", moduleCode: "", faculty: "", year: 1, semester: 1 });
  const [editId, setEditId]       = useState(null);
  const [editForm, setEditForm]   = useState({});

  const load = () => Promise.all([
    axios.get(`${API}/resources/modules`).then((r) => setModules(r.data.modules)),
    axios.get(`${API}/resources/faculties`).then((r) => setFaculties(r.data.faculties)),
  ]);

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.moduleName || !form.faculty || !form.year || !form.semester) {
      return alert("Module name, faculty, year, and semester are required");
    }
    await axios.post(`${API}/resources/modules`, form);
    setForm({ moduleName: "", moduleCode: "", faculty: "", year: 1, semester: 1 });
    load();
  };

  const save = async (id) => {
    if (!editForm.moduleName || !editForm.faculty || !editForm.year || !editForm.semester) {
      return alert("Module name, faculty, year, and semester are required");
    }
    await axios.put(`${API}/resources/modules/${id}`, editForm);
    setEditId(null); load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this module?")) return;
    await axios.delete(`${API}/resources/modules/${id}`);
    load();
  };

  return (
    <div>
      <h2 className="ra-section-title">Resource Module Management</h2>
      <div className="ra-form-grid">
        <input className="ra-input" placeholder="Module Name" value={form.moduleName}
          onChange={(e) => setForm({ ...form, moduleName: e.target.value })} />
        <input className="ra-input" placeholder="Module Code (optional)" value={form.moduleCode}
          onChange={(e) => setForm({ ...form, moduleCode: e.target.value })} />
        <select className="ra-input" value={form.faculty}
          onChange={(e) => setForm({ ...form, faculty: e.target.value })}>
          <option value="">Select Faculty</option>
          {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
        </select>
        <select className="ra-input" value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}>
          {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
        </select>
        <select className="ra-input" value={form.semester}
          onChange={(e) => setForm({ ...form, semester: e.target.value })}>
          <option value={1}>Semester 1</option>
          <option value={2}>Semester 2</option>
        </select>
        <button className="dashboard-btn" onClick={add}>+ Add Module</button>
      </div>

      <div className="table-container" style={{ marginTop: 24 }}>
        <table>
          <thead>
            <tr><th>Module</th><th>Code</th><th>Faculty</th><th>Year</th><th>Sem</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {modules.map((m) => (
              <tr key={m._id}>
                <td>{editId === m._id ? <input className="ra-input-sm" value={editForm.moduleName || ""} onChange={(e) => setEditForm({ ...editForm, moduleName: e.target.value })} /> : m.moduleName}</td>
                <td>{editId === m._id ? <input className="ra-input-sm" value={editForm.moduleCode || ""} onChange={(e) => setEditForm({ ...editForm, moduleCode: e.target.value })} /> : m.moduleCode}</td>
                <td>
                  {editId === m._id ? (
                    <select className="ra-input-sm" value={editForm.faculty || ""} onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })}>
                      <option value="">Select Faculty</option>
                      {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
                    </select>
                  ) : m.faculty?.name}
                </td>
                <td>
                  {editId === m._id ? (
                    <select className="ra-input-sm" value={editForm.year || ""} onChange={(e) => setEditForm({ ...editForm, year: Number(e.target.value) })}>
                      {[1, 2, 3, 4].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  ) : m.year}
                </td>
                <td>
                  {editId === m._id ? (
                    <select className="ra-input-sm" value={editForm.semester || ""} onChange={(e) => setEditForm({ ...editForm, semester: Number(e.target.value) })}>
                      <option value={1}>Semester 1</option>
                      <option value={2}>Semester 2</option>
                    </select>
                  ) : m.semester}
                </td>
                <td>
                  {editId === m._id
                    ? <button className="dashboard-btn" onClick={() => save(m._id)}>Save</button>
                    : <>
                        <button className="dashboard-btn" onClick={() => { setEditId(m._id); setEditForm({ moduleName: m.moduleName, moduleCode: m.moduleCode, faculty: m.faculty?._id, year: m.year, semester: m.semester }); }}>Edit</button>{" "}
                        <button className="dashboard-btn ra-btn-danger" onClick={() => remove(m._id)}>Delete</button>
                      </>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── PENDING APPROVALS TAB ────────────────────────────────────────────────
function ApprovalsTab() {
  const [pdfs, setPdfs]         = useState([]);
  const [modules, setModules]   = useState([]);
  const [editId, setEditId]     = useState(null);
  const [editForm, setEditForm] = useState({ title: "", module: "", category: "" });

  const load = () => {
    axios.get(`${API}/resources/pdfs`, { params: { status: "pending" } })
      .then((r) => setPdfs(r.data.pdfs));
    axios.get(`${API}/resources/modules`)
      .then((r) => setModules(r.data.modules));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await axios.put(`${API}/resources/pdfs/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await axios.put(`${API}/resources/pdfs/${id}/reject`);
    load();
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setEditForm({ title: p.title || "", module: p.module?._id || "", category: p.category || "" });
  };

  const cancelEdit = () => { setEditId(null); setEditForm({ title: "", module: "", category: "" }); };

  const saveEdit = async (id) => {
    if (!editForm.title.trim()) return alert("Title cannot be empty.");
    if (!/^[a-zA-Z0-9\s]*$/.test(editForm.title)) return alert("Title can only contain letters and numbers.");
    if (!editForm.module || !editForm.category) return alert("Please select both module and category.");
    try {
      await axios.post(`${API}/resources/pdfs/${id}/update`, { title: editForm.title.trim(), module: editForm.module, category: editForm.category });
      cancelEdit(); load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to save changes.";
      alert("Save failed: " + msg);
    }
  };

  return (
    <div>
      <h2 className="ra-section-title">Pending PDF Approvals</h2>
      {pdfs.length === 0
        ? <p className="ra-empty">No pending uploads. ✅</p>
        : (
          <div className="table-container">
            <table>
              <thead>
                <tr><th>Title</th><th>File</th><th>Module</th><th>Category</th><th>Uploaded By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pdfs.map((p) => (
                  <tr key={p._id}>
                    <td>
                      {editId === p._id ? (
                        <input
                          className="ra-input-sm"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="PDF Title"
                        />
                      ) : p.title}
                    </td>
                    <td>
                      {editId === p._id ? (
                        <select className="ra-input-sm" value={editForm.module}
                          onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}>
                          <option value="">Select Module</option>
                          {modules.map((m) => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
                        </select>
                      ) : p.module?.moduleName}
                    </td>
                    <td>
                      {editId === p._id ? (
                        <select className="ra-input-sm" value={editForm.category}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                          <option value="">Select Category</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      ) : p.category}
                    </td>
                    <td>{p.uploadedBy || "anonymous"}</td>
                    <td>
                      <a
                        href={`${API}/uploads/${p.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#4f46e5", fontSize: 13, fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}
                      >
                        📄 {p.fileName || "View PDF"}
                      </a>
                    </td>
                    <td>
                      {editId === p._id ? (
                        <>
                          <button className="dashboard-btn ra-btn-success" onClick={() => saveEdit(p._id)}>Save</button>{" "}
                          <button className="dashboard-btn" onClick={cancelEdit}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="dashboard-btn" onClick={() => startEdit(p)}>Edit</button>{" "}
                          <button className="dashboard-btn ra-btn-success" onClick={() => approve(p._id)}>Approve</button>{" "}
                          <button className="dashboard-btn ra-btn-danger"  onClick={() => reject(p._id)}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}


// ─── ADMIN PDF UPLOAD TAB ─────────────────────────────────────────────────
function AdminUploadTab() {
  const [faculties, setFaculties] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [form, setForm] = useState({ faculty: "", year: 1, semester: 1, module: "", category: CATEGORIES[0], title: "" });
  const [file, setFile]   = useState(null);
  const [msg, setMsg]     = useState("");
  const [titleErr, setTitleErr] = useState("");

  const handleTitleChange = (e) => {
    const val = e.target.value;
    if (!/^[a-zA-Z0-9\s]*$/.test(val)) {
      setTitleErr("❌ Symbols like @, $, % are not valid. Please use only letters and numbers.");
    } else {
      setTitleErr("");
    }
    setForm({ ...form, title: val });
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

  const loadFaculties = () =>
    axios.get(`${API}/resources/faculties`).then((r) => setFaculties(r.data.faculties));

  const loadModules = (faculty, year, semester) => {
    if (!faculty) return;
    axios.get(`${API}/resources/modules`, { params: { faculty, year, semester } })
      .then((r) => setAllModules(r.data.modules));
  };

  useEffect(() => { loadFaculties(); }, []);
  useEffect(() => { loadModules(form.faculty, form.year, form.semester); }, [form.faculty, form.year, form.semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (titleErr) return setMsg("❌ Please fix title errors before uploading.");
    if (!form.faculty || !form.year || !form.semester || !form.module || !form.title || !file) {
      return setMsg("❌ All frontend fields and file are required before uploading.");
    }
    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("module", form.module);
    fd.append("category", form.category);
    fd.append("adminUpload", "true");
    fd.append("file", file);
    try {
      await axios.post(`${API}/resources/pdfs/upload`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMsg("✅ PDF uploaded and approved successfully.");
      setFile(null); setForm({ ...form, title: "", module: "" });
    } catch {
      setMsg("❌ Upload failed.");
    }
  };

  return (
    <div>
      <h2 className="ra-section-title">Upload PDF (Admin)</h2>
      <div className="ra-upload-form">
        <form onSubmit={handleSubmit}>
          <select className="ra-input" value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value, module: "" })}>
            <option value="">Select Faculty</option>
            {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <select className="ra-input" value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value), module: "" })}>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select className="ra-input" value={form.semester}
            onChange={(e) => setForm({ ...form, semester: Number(e.target.value), module: "" })}>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
          <select className="ra-input" value={form.module}
            onChange={(e) => setForm({ ...form, module: e.target.value })}>
            <option value="">Select Module</option>
            {allModules.map((m) => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
          </select>
          <select className="ra-input" value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="ra-input" placeholder="PDF Title" value={form.title}
            onChange={handleTitleChange} required />
          {titleErr && <p style={{ fontSize: 13, margin: "4px 0", color: "#ef4444" }}>{titleErr}</p>}
          <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          {msg && <p style={{ fontSize: 13, margin: "8px 0", color: msg.includes("❌") ? "#ef4444" : "#10b981" }}>{msg}</p>}
          <button className="dashboard-btn" type="submit">Upload & Approve</button>
        </form>
      </div>
    </div>
  );
}

// ─── ANALYTICS TAB ────────────────────────────────────────────────────────
function AnalyticsTab() {
  const [data, setData]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    axios.get(`${API}/resources/analytics`)
      .then((r) => { setData(r.data.pdfs); setTotal(r.data.totalDownloads); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this PDF permanently?")) {
      try {
        await axios.delete(`${API}/resources/pdfs/${id}`);
        loadData();
      } catch (err) { alert("Failed to delete PDF"); }
    }
  };

  const COLORS = ["#4f46e5","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

  const pieData = {
    labels: data.map((d) => d.title.length > 20 ? d.title.slice(0, 20) + "…" : d.title),
    datasets: [{
      data: data.map((d) => d.downloadCount),
      backgroundColor: data.map((_, i) => COLORS[i % COLORS.length]),
      borderWidth: 1,
    }],
  };

  return (
    <div>
      <h2 className="ra-section-title">Download Analytics</h2>
      {loading ? <p>Loading…</p> : (
        <>
          <div className="ra-analytics-summary">
            <div className="dashboard-card"><h3>Total Downloads</h3><CountUp end={total} duration={2} /></div>
            <div className="dashboard-card"><h3>Approved PDFs</h3><CountUp end={data.length} duration={2} /></div>
          </div>

          {data.length > 0 && (
            <div className="ra-chart-wrap">
              <h3 style={{ marginBottom: 16, fontWeight: 600, color: "#1e1b4b" }}>Download Distribution</h3>
              <div style={{ maxWidth: 380, margin: "0 auto" }}>
                <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
              </div>
            </div>
          )}

          <div className="table-container" style={{ marginTop: 24 }}>
            <table>
              <thead>
                <tr><th>PDF Title</th><th>Downloads</th><th>Avg Rating</th><th>Ratings</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d._id}>
                    <td>{d.title}</td>
                    <td>{d.downloadCount}</td>
                    <td>{d.averageRating > 0 ? `${d.averageRating} ★` : "—"}</td>
                    <td>{d.ratingCount}</td>
                    <td>
                      <button className="dashboard-btn ra-btn-danger" onClick={() => handleDelete(d._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

// ─── RATINGS OVERVIEW TAB ────────────────────────────────────────────────
function RatingsTab() {
  const [pdfs, setPdfs] = useState([]);

  const loadData = () => {
    axios.get(`${API}/resources/pdfs`, { params: { status: "approved" } })
      .then((r) => setPdfs(r.data.pdfs));
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this PDF permanently?")) {
      try {
        await axios.delete(`${API}/resources/pdfs/${id}`);
        loadData();
      } catch (err) { alert("Failed to delete PDF"); }
    }
  };

  return (
    <div>
      <h2 className="ra-section-title">PDF Ratings Overview</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Title</th><th>Module</th><th>Category</th><th>Avg Rating</th><th>Total Ratings</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {pdfs.map((p) => {
              const avg = p.ratings && p.ratings.length
                ? Math.round(p.ratings.reduce((s, r) => s + r.rating, 0) / p.ratings.length * 10) / 10
                : 0;
              return (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.module?.moduleName}</td>
                  <td>{p.category}</td>
                  <td>{avg > 0 ? `${avg} ★` : "—"}</td>
                  <td>{p.ratings?.length || 0}</td>
                  <td>
                    <button className="dashboard-btn ra-btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────
function AdminDashboard() {
  const [users, setUsers]       = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCategory, setUserCategory] = useState("student");
  const [searchQuery, setSearchQuery] = useState({});
  const [editUserId, setEditUserId] = useState(null);
  const [modules, setModules]   = useState([]);
  const [societies, setSocieties] = useState([]);
  const [clubTypes, setClubTypes] = useState(clubTypeOptions);
  const [formData, setFormData] = useState({});
  const [editSocietyId, setEditSocietyId] = useState(null);
  const [editSocietyDescription, setEditSocietyDescription] = useState("");
  const [editSocietyClubType, setEditSocietyClubType] = useState("");
  const [societyManagerError, setSocietyManagerError] = useState("");
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [selectedManagerIds, setSelectedManagerIds] = useState([]);
  const [selectedSocietyIds, setSelectedSocietyIds] = useState([]);
  const [managerSearch, setManagerSearch] = useState("");
  const [societyDirectorySearch, setSocietyDirectorySearch] = useState("");
  const societyManagerFormRef = useRef(null);
  const societyManagerNameInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(); fetchModules(); fetchSocieties(); fetchClubTypes();
  }, []);

  const fetchUsers = async () => {
    try { const r = await axios.get(`${API}/Users/admin/users`); setUsers(r.data.users); }
    catch (e) { console.error(e); }
  };

  const fetchModules = async () => {
    try { const r = await axios.get(`${API}/modules`); setModules(r.data.modules || []); }
    catch (e) { console.error(e); }
  };

  const fetchSocieties = async () => {
    try { const r = await axios.get(`${API}/societies`); setSocieties(r.data.societies || []); }
    catch (e) { console.error(e); }
  };

  const fetchClubTypes = async () => {
    try {
      const response = await axios.get(`${API}/societies/club-types`);
      setClubTypes(response.data.clubTypes || clubTypeOptions);
    } catch (e) {
      console.error(e);
      setClubTypes(clubTypeOptions);
    }
  };

  const handleChange = (e) => {
    if (activeTab === "societyManager" && societyManagerError) {
      setSocietyManagerError("");
    }

    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateSocietyManagerForm = (data) => {
    const email = data.gmail?.trim().toLowerCase() || "";
    const contactNumber = normalizeContactNumber(data.contact);

    if (!email) return "University email is required.";
    if (!EMAIL_REGEX.test(email)) return "Enter a valid email address.";
    if (!isUniversityEmail(email)) return "Use a valid university email ending with .edu or .ac.xx.";
    if (!contactNumber) return "Contact number is required.";
    if (!CONTACT_REGEX.test(contactNumber)) return "Contact number must be 10 to 15 digits.";

    return "";
  };

  const submitData = async (endpoint, role) => {
    try {
      let data = role ? { ...formData, role } : { ...formData };

      if (endpoint === "societies") {
        data = {
          name: (formData.name || "").trim(),
          description: (formData.description || "").trim(),
          clubType: formData.clubType || "",
        };

        if (!data.name || !data.description || !data.clubType) {
          alert("All fields are required");
          return;
        }
      }

      if (role === "societyManager") {
        const validationError = validateSocietyManagerForm(data);

        if (validationError) {
          setSocietyManagerError(validationError);
          return;
        }

        data.gmail = data.gmail.trim().toLowerCase();
        data.contact = normalizeContactNumber(data.contact);
        setSocietyManagerError("");
      }

      await axios.post(`${API}/${endpoint}`, data);
      alert(endpoint === "Users" && role === "societyManager"
        ? "Society manager assigned successfully"
        : "Added successfully");
      setFormData({});
      fetchUsers();
      if (endpoint === "modules") fetchModules();
      if (endpoint === "societies") fetchSocieties();
    } catch (error) {
      const fallbackMessage = endpoint === "societies"
        ? "Failed to add society"
        : endpoint === "Users" && role === "societyManager"
          ? "Failed to assign society manager"
          : "Error!";

      alert(error.response?.data?.message || fallbackMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try { await axios.delete(`${API}/Users/${id}`); fetchUsers(); }
      catch { alert("Delete failed!"); }
    }
  };

  const handleDeleteSociety = async (id) => {
    if (!window.confirm("Are you sure you want to delete this society?")) return;

    try {
      await axios.delete(`${API}/societies/${id}`);
      setSelectedSocietyIds((currentIds) => currentIds.filter((currentId) => currentId !== id));
      fetchSocieties();
      alert("Society deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Society delete failed!");
    }
  };

  const handleDeleteSelectedSocieties = async () => {
    if (selectedSocietyIds.length === 0) {
      alert("Select at least one society to delete.");
      return;
    }

    if (!window.confirm(`Delete ${selectedSocietyIds.length} selected societ${selectedSocietyIds.length === 1 ? "y" : "ies"}?`)) {
      return;
    }

    try {
      const results = await Promise.allSettled(
        selectedSocietyIds.map((societyId) => axios.delete(`${API}/societies/${societyId}`))
      );

      const failedResults = results.filter((result) => result.status === "rejected");
      const deletedCount = results.length - failedResults.length;

      await fetchSocieties();

      if (failedResults.length === 0) {
        setSelectedSocietyIds([]);
        alert(`${deletedCount} societ${deletedCount === 1 ? "y" : "ies"} deleted successfully!`);
        return;
      }

      const firstError = failedResults[0].reason?.response?.data?.message || "Some societies could not be deleted.";
      const successfulIds = selectedSocietyIds.filter((_id, index) => results[index].status === "fulfilled");

      setSelectedSocietyIds((currentIds) => currentIds.filter((id) => !successfulIds.includes(id)));
      alert(`${deletedCount} deleted. ${failedResults.length} failed. ${firstError}`);
    } catch (error) {
      alert(error.response?.data?.message || "Bulk society delete failed!");
    }
  };

  const handleStartSocietyEdit = (society) => {
    setEditSocietyId(society._id);
    setEditSocietyDescription(society.description || "");
    setEditSocietyClubType(society.clubType || "");
  };

  const handleCancelSocietyEdit = () => {
    setEditSocietyId(null);
    setEditSocietyDescription("");
    setEditSocietyClubType("");
  };

  const handleSaveSocietyEdit = async (societyId) => {
    const trimmedDescription = editSocietyDescription.trim();

    if (!trimmedDescription) {
      alert("Description is required.");
      return;
    }

    if (!editSocietyClubType) {
      alert("Club type is required.");
      return;
    }

    try {
      await axios.put(`${API}/societies/${societyId}`, {
        description: trimmedDescription,
        clubType: editSocietyClubType,
      });
      handleCancelSocietyEdit();
      fetchSocieties();
      alert("Society updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Society update failed!");
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({
      name: user.name,
      gmail: user.gmail,
      password: "",
      age: user.age,
      address: user.address,
      contact: user.contact,
      role: user.role,
      societyId: user.societyId || "",
    });
    setSocietyManagerError("");

    requestAnimationFrame(() => {
      societyManagerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        societyManagerNameInputRef.current?.focus();
      }, 180);
    });
  };

  const saveEdit = async () => {
    try {
      const payload = {
        ...formData,
        role: "societyManager",
        name: (formData.name || "").trim(),
        gmail: (formData.gmail || "").trim().toLowerCase(),
        contact: normalizeContactNumber(formData.contact || ""),
      };

      const validationError = validateSocietyManagerForm(payload);

      if (validationError) {
        setSocietyManagerError(validationError);
        return;
      }

      await axios.put(`${API}/Users/${editUserId}`, payload);
      setEditUserId(null); setFormData({}); fetchUsers();
      setSocietyManagerError("");
      alert("Updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed!");
    }
  };

  const handleCancelManagerEdit = () => {
    setEditUserId(null);
    setFormData({});
    setSocietyManagerError("");
  };

  const filteredUsers = users
    .filter((u) => u.role?.trim().toLowerCase() === userCategory)
    .filter((u) =>
      u.name.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "") ||
      u.gmail.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "")
    );

  const societyManagers = users.filter((u) => u.role === "societyManager");
  const filteredManagers = societyManagers.filter((manager) =>
    manager.name?.toLowerCase().includes(managerSearch.toLowerCase())
  );
  const filteredSocieties = societies.filter((society) => {
    const searchTerm = societyDirectorySearch.trim().toLowerCase();

    if (!searchTerm) {
      return true;
    }

    return [society.name, society.societyName, society.description, society.clubType]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchTerm));
  });

  useEffect(() => {
    const managerIds = new Set(societyManagers.map((manager) => manager._id));

    setSelectedManagerIds((currentIds) =>
      currentIds.filter((id) => managerIds.has(id))
    );
  }, [societyManagers]);

  useEffect(() => {
    const societyIds = new Set(societies.map((society) => society._id));

    setSelectedSocietyIds((currentIds) =>
      currentIds.filter((id) => societyIds.has(id))
    );
  }, [societies]);

  const handleOpenSocietyManagerForm = () => {
    setActiveTab("societyManager");

    requestAnimationFrame(() => {
      societyManagerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        societyManagerNameInputRef.current?.focus();
      }, 180);
    });
  };

  const allManagersSelected = filteredManagers.length > 0
    && filteredManagers.every((manager) => selectedManagerIds.includes(manager._id));

  const handleToggleAllManagers = () => {
    setSelectedManagerIds((currentIds) => {
      const visibleManagerIds = filteredManagers.map((manager) => manager._id);

      if (allManagersSelected) {
        return currentIds.filter((id) => !visibleManagerIds.includes(id));
      }

      return [...new Set([...currentIds, ...visibleManagerIds])];
    });
  };

  const handleToggleManagerSelection = (managerId) => {
    setSelectedManagerIds((currentIds) =>
      currentIds.includes(managerId)
        ? currentIds.filter((id) => id !== managerId)
        : [...currentIds, managerId]
    );
  };
  const allSocietiesSelected = filteredSocieties.length > 0
    && filteredSocieties.every((society) => selectedSocietyIds.includes(society._id));

  const handleToggleAllSocieties = () => {
    setSelectedSocietyIds((currentIds) => {
      const visibleSocietyIds = filteredSocieties.map((society) => society._id);

      if (allSocietiesSelected) {
        return currentIds.filter((id) => !visibleSocietyIds.includes(id));
      }

      return [...new Set([...currentIds, ...visibleSocietyIds])];
    });
  };

  const handleToggleSocietySelection = (societyId) => {
    setSelectedSocietyIds((currentIds) =>
      currentIds.includes(societyId)
        ? currentIds.filter((id) => id !== societyId)
        : [...currentIds, societyId]
    );
  };
  const RESOURCE_TABS = [
    { key: "resourceFaculty",    label: "📁 Faculties" },
    { key: "resourceModule",     label: "📚 Res. Modules" },
    { key: "resourceApprovals",  label: "✅ Approvals" },
    { key: "resourceUpload",     label: "📤 Upload PDF" },
    { key: "resourceAnalytics",  label: "📊 Analytics" },
    { key: "resourceRatings",    label: "⭐ Ratings" },
  ];
  const isResourceTabActive = RESOURCE_TABS.some((tab) => tab.key === activeTab);

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>Uni Hub</h2>
        <div className="sidebar-nav">
          <button className={`sidebar-link ${activeTab === "dashboard" ? "sidebar-link-active" : ""}`} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={`sidebar-link ${activeTab === "users" ? "sidebar-link-active" : ""}`} onClick={() => setActiveTab("users")}>All Users</button>
          <button className={`sidebar-link ${activeTab === "societyManager" ? "sidebar-link-active" : ""}`} onClick={handleOpenSocietyManagerForm}>Add Society Manager</button>
          
          <button className={`sidebar-link ${activeTab === "society" ? "sidebar-link-active" : ""}`} onClick={() => setActiveTab("society")}>Add Society</button>
          <button className="sidebar-link sidebar-link-primary" onClick={() => navigate("/adquiz")}>Add Quiz</button>

          <button
            className={`sidebar-link sidebar-toggle ${showResourcesMenu || isResourceTabActive ? "sidebar-link-active" : ""}`}
            onClick={() => setShowResourcesMenu(!showResourcesMenu)}
          >
            <span>Resources Management</span>
            <span>{showResourcesMenu ? "▲" : "▼"}</span>
          </button>
          {showResourcesMenu && (
            <div className="sidebar-submenu">
              {RESOURCE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`sidebar-submenu-link ${activeTab === t.key ? "ra-sidebar-active" : ""}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button 
          className="sidebar-link" 
          onClick={() => setActiveTab("complaintHandling")}
          style={{ marginTop: '10px' }}
        >
          📋 Complaint Handling
        </button>

        <button
          className={`sidebar-link ${activeTab === "consultantBookings" ? "sidebar-link-active" : ""}`}
          onClick={() => setActiveTab("consultantBookings")}
        >
          Consultant Bookings
        </button>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <h1>Admin Dashboard</h1>
          <div className="admin-profile">Admin</div>
        </div>

        {/* Dashboard Cards */}
        {activeTab === "dashboard" && (
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <FaUsers className="card-icon" />
              <h3>Total Users</h3>
              <p><CountUp end={users.length} duration={2} /></p>
            </div>
            <div className="dashboard-card">
              <FaUserGraduate className="card-icon" />
              <h3>Students</h3>
              <p><CountUp end={users.filter(u => u.role === "Student").length} duration={2} /></p>
            </div>
            <div className="dashboard-card">
              <FaUserTie className="card-icon" />
              <h3>Society Managers</h3>
              <p><CountUp end={users.filter(u => u.role === "societyManager").length} duration={2} /></p>
            </div>
          </div>
        )}

        {/* Users Section */}
        {activeTab === "users" && (
  <div className="users-section">

    {/* Tabs */}
    <div className="category-tabs">
      {["student", "societymanager"].map(cat => (
        <button
          key={cat}
          className={userCategory === cat ? "active" : ""}
          onClick={() => setUserCategory(cat)}
        >
          {cat === "societymanager"
            ? "Society Managers"
            : "Students"}
        </button>
      ))}
    </div>

    {/* Search */}
    <SearchBar
      value={searchQuery[userCategory] || ""}
      onChange={(e) =>
        setSearchQuery({
          ...searchQuery,
          [userCategory]: e.target.value
        })
      }
      placeholder={`Search ${userCategory}...`}
      className="users-directory-search"
    />

    {/* Table */}
    <div className="table-container">
      <h2>{userCategory === "student" ? "Student List" : "Society Manager List"}</h2>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Age</th>
            <th>Address</th>
            <th>Contact</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
  {filteredUsers.map((u) => (
    <tr key={u._id}>

      <td>{u.name}</td>
      <td>{u.gmail}</td>
      <td>{u.age}</td>
      <td>{u.address}</td>
      <td>{u.contact}</td>

      <td>
        <button
          className="dashboard-btn"
          onClick={() => handleDelete(u._id)}
        >
          Delete
        </button>
      </td>

    </tr>
  ))}
</tbody>
      </table>
    </div>

  </div>
)}

        {/* Society Manager Dashboard */}
        {activeTab === "societyManager" && (
          <div className="society-manager-dashboard">
            <div className="society-manager-page-shell">
              <div className="form-card society-manager-form society-manager-page-card" ref={societyManagerFormRef}>
                <div className="society-manager-page-card-glow" aria-hidden="true" />
                <div className="section-header-block society-manager-page-header">
                  <span className="section-kicker society-manager-page-kicker">Administration</span>
                  <h2>Add Society Manager</h2>
                  <p className="section-subtext">Create a manager account and assign it to an available society in one step.</p>
                </div>

                <div className="society-manager-grid society-manager-page-grid">
                  <input
                    ref={societyManagerNameInputRef}
                    name="name"
                    placeholder="Full name"
                    value={formData.name || ""}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="gmail"
                    placeholder="University email"
                    value={formData.gmail || ""}
                    onChange={handleChange}
                    title="Use a university email ending with .edu or .ac.xx"
                  />
                  <input
                    name="password"
                    placeholder={editUserId ? "Leave blank to keep current password" : "Temporary password"}
                    type="password"
                    value={formData.password || ""}
                    onChange={handleChange}
                  />
                  <input
                    name="age"
                    placeholder="Age"
                    value={formData.age || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="society-manager-field-wide"
                    name="address"
                    placeholder="Address"
                    value={formData.address || ""}
                    onChange={handleChange}
                  />
                  <input
                    className="society-manager-field-wide"
                    type="tel"
                    inputMode="numeric"
                    name="contact"
                    placeholder="Contact number"
                    value={formData.contact || ""}
                    onChange={handleChange}
                    title="Contact number must be 10 to 15 digits"
                  />
                </div>

                {societyManagerError && (
                  <p className="society-manager-error-text">{societyManagerError}</p>
                )}

                <div className="society-manager-page-footer">
                  <select
                    className="society-manager-select"
                    name="societyId"
                    value={formData.societyId || ""}
                    onChange={handleChange}
                  >
                    <option value="">
                      {societies.length > 0 ? "Select society" : "No societies available"}
                    </option>
                    {societies.map((s) => <option key={s._id} value={s._id}>{s.name || s.societyName}</option>)}
                  </select>
                  <button
                    className="dashboard-btn society-manager-submit"
                    onClick={() => (editUserId ? saveEdit() : submitData("Users", "societyManager"))}
                  >
                    {editUserId ? "Save Changes" : "Add Society Manager"}
                  </button>
                  {editUserId && (
                    <button
                      className="dashboard-btn society-manager-secondary-btn"
                      onClick={handleCancelManagerEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="manager-directory-page-shell">
              <div className="form-card manager-list-card manager-list-card-full manager-directory-page-card">
                <div className="manager-directory-page-glow" aria-hidden="true" />
              <div className="manager-list-header manager-directory-page-header">
                <div>
                  <span className="section-kicker manager-directory-page-kicker">Management</span>
                  <h2>Registered Society Managers</h2>
                  <p className="section-subtext manager-directory-page-subtext">Review assigned managers and track which societies already have ownership.</p>
                </div>
                <div className="manager-list-actions">
                  <span className="manager-count-badge manager-directory-page-count">{filteredManagers.length} of {societyManagers.length} registered</span>
                </div>
              </div>

              <SearchBar
                value={managerSearch}
                onChange={(event) => setManagerSearch(event.target.value)}
                placeholder="Search by manager name..."
                className="manager-search-bar"
              />

              {societyManagers.length === 0 ? <div className="manager-empty-state manager-directory-empty-state"><p>No society managers registered yet. Start by creating the first manager account.</p><button className="dashboard-btn manager-action-btn" onClick={handleOpenSocietyManagerForm}>Create First Manager</button></div> : filteredManagers.length === 0 ? <div className="manager-empty-state manager-directory-empty-state"><p>No managers match your search.</p></div> : (
                <div className="manager-directory-shell manager-directory-page-shell-inner">
                  <div className="manager-selection-bar manager-directory-page-selection-bar">
                    <div className="manager-selection-copy manager-directory-page-selection-copy">
                      <strong>{selectedManagerIds.length}</strong> selected across the manager directory
                    </div>
                    <div className="manager-selection-tools">
                      <button className="manager-selection-button manager-directory-page-selection-button" onClick={handleToggleAllManagers}>
                        {allManagersSelected ? "Clear selection" : "Select all"}
                      </button>
                    </div>
                  </div>

                  <table className="manager-directory-table manager-directory-page-table">
                    <thead>
                      <tr>
                        <th className="manager-checkbox-col">
                          <input type="checkbox" checked={allManagersSelected} onChange={handleToggleAllManagers} />
                        </th>
                        <th>Manager</th>
                        <th>Society</th>
                        <th>Contact</th>
                        <th>Age</th>
                        <th>Status</th>
                        <th className="manager-actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredManagers.map((m) => {
                        const society = societies.find((s) => s._id === m.societyId);
                        const isSelected = selectedManagerIds.includes(m._id);
                        const initials = m.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("");

                        return (
                          <tr
                            key={m._id}
                            className={
                              isSelected
                                ? "manager-row-selected manager-directory-page-row-selected"
                                : "manager-directory-page-row"
                            }
                          >
                            <td className="manager-checkbox-col">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleManagerSelection(m._id)}
                              />
                            </td>
                            <td>
                              <div className="manager-identity-cell">
                                <div className="manager-avatar manager-directory-page-avatar">{initials || "SM"}</div>
                                <div className="manager-meta-block">
                                  <strong>{m.name}</strong>
                                  <span>{m.gmail}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="manager-society-stack">
                                <span className="society-tag">
                                  {society
                                    ? society.name || society.societyName
                                    : "No society assigned"}
                                </span>
                                <span className="manager-address-text">
                                  {m.address || "Address not added"}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="manager-meta-block manager-compact-block">
                                <strong>{m.contact || "No contact"}</strong>
                                <span>{m.gmail}</span>
                              </div>
                            </td>
                            <td>{m.age || "-"}</td>
                            <td>
                              <span className={`manager-status-badge ${society ? "manager-status-active" : "manager-status-pending"}`}>
                                <FaCheckCircle />
                                {society ? "Assigned" : "Not assigned"}
                              </span>
                            </td>
                            <td className="manager-actions-col">
                              <div className="manager-row-actions manager-directory-page-actions">
                                <button
                                  className="manager-icon-action manager-icon-action-edit"
                                  title="Edit manager"
                                  onClick={() => handleEdit(m)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="manager-icon-action manager-icon-action-danger"
                                  title="Delete manager"
                                  onClick={() => handleDelete(m._id)}
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
            </div>
          </div>
        )}

        {/* Society Management */}
        {activeTab === "society" && (
          <div className="society-manager-dashboard-grid">
            <div className="society-page-shell">
              <div className="society-page-card">
                <div className="society-page-card-glow" aria-hidden="true" />

                <div className="section-header-block society-page-header">
                  <span className="section-kicker society-page-kicker">Community</span>
                  <h2>Add Society</h2>
                  <p className="section-subtext society-page-subtext">
                    Create a society record and keep the community directory organized for manager assignment.
                  </p>
                </div>

                <div className="society-page-form-grid">
                  <div className="society-page-field society-page-field-full">
                    <label className="society-page-label" htmlFor="society-name">Society Name</label>
                    <input
                      id="society-name"
                      name="name"
                      placeholder="Enter society name"
                      value={formData.name || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="society-page-field society-page-field-full">
                    <label className="society-page-label" htmlFor="society-description">Description</label>
                    <textarea
                      id="society-description"
                      className="society-page-description"
                      name="description"
                      placeholder="Describe the society, its purpose, and the type of student community it serves"
                      value={formData.description || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="society-page-field society-page-field-full">
                    <label className="society-page-label" htmlFor="society-club-type">Club Type</label>
                    <div className="society-page-select-wrap">
                      <select
                        id="society-club-type"
                        name="clubType"
                        value={formData.clubType || ""}
                        onChange={handleChange}
                      >
                        <option value="">Select Club Type</option>
                        {clubTypes.map((option) => (
                          <option key={option.slug || option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="society-page-footer">
                  <button className="dashboard-btn society-page-submit" onClick={() => submitData("societies")}>Add Society</button>
                </div>
              </div>
            </div>

            <div className="society-directory-shell">
              <div className="society-directory-card">
                <div className="manager-list-header society-directory-header">
                  <div>
                    <span className="section-kicker society-directory-kicker">Directory</span>
                    <h2>Registered Societies</h2>
                    <p className="section-subtext society-directory-subtext">All societies added through the admin panel are listed here.</p>
                  </div>
                  <div className="manager-list-actions society-directory-actions">
                    {societies.length > 0 && (
                      <button
                        className="dashboard-btn society-delete-btn society-directory-delete-btn"
                        onClick={handleDeleteSelectedSocieties}
                      >
                        Delete Selected ({selectedSocietyIds.length})
                      </button>
                    )}
                    <span className="manager-count-badge society-directory-count">{filteredSocieties.length} of {societies.length} societies</span>
                  </div>
                </div>

                <SearchBar
                  value={societyDirectorySearch}
                  onChange={(event) => setSocietyDirectorySearch(event.target.value)}
                  placeholder="Search societies by name, description, or club type"
                  className="society-search-bar"
                />

                {societies.length === 0 ? (
                  <div className="manager-empty-state society-directory-empty-state">
                    <p>No societies have been added yet.</p>
                  </div>
                ) : filteredSocieties.length === 0 ? (
                  <div className="manager-empty-state society-directory-empty-state">
                    <p>No societies match your current search.</p>
                  </div>
                ) : (
                  <div className="manager-directory-shell society-directory-table-shell">
                    <div className="manager-selection-bar society-directory-selection-bar">
                      <div className="manager-selection-copy society-directory-selection-copy">
                        <strong>{selectedSocietyIds.length}</strong> selected across the directory
                      </div>
                      <div className="manager-selection-tools">
                        <button className="manager-selection-button society-directory-selection-button" onClick={handleToggleAllSocieties}>
                          {allSocietiesSelected ? "Clear selection" : "Select all"}
                        </button>
                      </div>
                    </div>

                    <table className="manager-directory-table society-directory-table">
                      <thead><tr><th className="manager-checkbox-col"><input type="checkbox" checked={allSocietiesSelected} onChange={handleToggleAllSocieties} /></th><th>Society Name</th><th>Description</th><th>Club Type</th><th>Manager Status</th><th>Actions</th></tr></thead>
                      <tbody>
                      {filteredSocieties.map((society) => {
                        const assignedManager = societyManagers.find((manager) => manager.societyId === society._id);
                        const isEditingSociety = editSocietyId === society._id;
                        const isSelectedSociety = selectedSocietyIds.includes(society._id);
                        const clubTypeSlug = (society.clubType || "not-set").toLowerCase().replace(/\s+/g, "-");
                        return (
                          <tr key={society._id} className={`society-directory-row ${isSelectedSociety ? "manager-row-selected society-directory-row-selected" : ""}`}>
                            <td className="manager-checkbox-col">
                              <input
                                type="checkbox"
                                checked={isSelectedSociety}
                                onChange={() => handleToggleSocietySelection(society._id)}
                              />
                            </td>
                            <td>
                              <div className="society-directory-name-cell">
                                <strong>{society.name || society.societyName}</strong>
                              </div>
                            </td>
                            <td>
                              {isEditingSociety ? (
                                <textarea
                                  className="society-description-editor society-directory-description-editor"
                                  value={editSocietyDescription}
                                  onChange={(e) => setEditSocietyDescription(e.target.value)}
                                />
                              ) : (
                                <span className="society-directory-description-text">{society.description || "No description added"}</span>
                              )}
                            </td>
                            <td>
                              {isEditingSociety ? (
                                <select
                                  className="society-clubtype-editor society-directory-clubtype-editor"
                                  value={editSocietyClubType}
                                  onChange={(e) => setEditSocietyClubType(e.target.value)}
                                >
                                  <option value="">Select Club Type</option>
                                  {clubTypes.map((option) => (
                                    <option key={option.slug || option.value} value={option.value}>{option.label}</option>
                                  ))}
                                </select>
                              ) : (
                                <span className={`society-type-badge society-type-badge-${clubTypeSlug}`}>{society.clubType || "Not set"}</span>
                              )}
                            </td>
                            <td>
                              <div className="society-directory-status-stack">
                                <span className={`society-tag ${assignedManager ? "society-tag-assigned" : "society-tag-pending"}`}>
                                  {assignedManager ? "Assigned" : "No manager assigned"}
                                </span>
                                {assignedManager && <span className="society-directory-manager-name">{assignedManager.name}</span>}
                              </div>
                            </td>
                            <td className="society-directory-actions-col">
                              <div className="society-action-group society-directory-action-group">
                                {isEditingSociety ? (
                                  <>
                                    <button
                                      className="dashboard-btn manager-action-btn society-directory-edit-btn"
                                      onClick={() => handleSaveSocietyEdit(society._id)}
                                    >
                                      Save
                                    </button>
                                    <button
                                      className="dashboard-btn society-cancel-btn"
                                      onClick={handleCancelSocietyEdit}
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      className="dashboard-btn manager-action-btn society-directory-edit-btn"
                                      onClick={() => handleStartSocietyEdit(society)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="dashboard-btn society-delete-btn society-directory-delete-row-btn"
                                      onClick={() => handleDeleteSociety(society._id)}
                                    >
                                      Delete
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

       
        {/* ── Resources Admin Tabs ─────────────────────────────────── */}
        {activeTab === "resourceFaculty"   && <FacultyTab />}
        {activeTab === "resourceModule"    && <ResourceModuleTab />}
        {activeTab === "resourceApprovals" && <ApprovalsTab />}
        {activeTab === "resourceUpload"    && <AdminUploadTab />}
        {activeTab === "resourceAnalytics" && <AnalyticsTab />}
        {activeTab === "resourceRatings"   && <RatingsTab />}
        
        {/* Consultant Booking Management Tab */}
        {activeTab === "consultantBookings" && <ConsultantBookingManagement />}

        {/* Complaint Handling Tab - ADDED */}
        {activeTab === "complaintHandling" && <ComplaintHandling />}
      </main>
    </div>
  );
}

export default AdminDashboard;