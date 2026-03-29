import React, { useEffect, useState } from "react";
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
import { FaUsers, FaUserGraduate, FaUserTie } from "react-icons/fa";
import ConsultantBookingManagement from "../ConsultantBookingManagement/ConsultantBookingManagement";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "http://localhost:5001";
const CATEGORIES = ["Lecture Material", "Reading Material", "Short Notes", "Referral Sheets"];

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
          <thead><tr><th>#</th><th>Name</th><th>Actions</th></tr></thead>
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
  const [pdfs, setPdfs] = useState([]);

  const load = () =>
    axios.get(`${API}/resources/pdfs`, { params: { status: "pending" } })
      .then((r) => setPdfs(r.data.pdfs));

  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    await axios.put(`${API}/resources/pdfs/${id}/approve`);
    load();
  };

  const reject = async (id) => {
    await axios.put(`${API}/resources/pdfs/${id}/reject`);
    load();
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
                <tr><th>Title</th><th>Module</th><th>Category</th><th>Uploaded By</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {pdfs.map((p) => (
                  <tr key={p._id}>
                    <td>{p.title}</td>
                    <td>{p.module?.moduleName}</td>
                    <td>{p.category}</td>
                    <td>{p.uploadedBy || "anonymous"}</td>
                    <td>
                      <button className="dashboard-btn ra-btn-success" onClick={() => approve(p._id)}>Approve</button>{" "}
                      <button className="dashboard-btn ra-btn-danger"  onClick={() => reject(p._id)}>Reject</button>
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
  const [formData, setFormData] = useState({});
  const [societyManagerError, setSocietyManagerError] = useState("");
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers(); fetchModules(); fetchSocieties();
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

  const handleChange = (e) => {
    setSocietyManagerError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const availableSocietiesForManager = societies.filter(
    (s) => !users.some((u) => u.role === "societyManager" && u.societyId === s._id)
  );

  const validateSocietyManagerForm = () => {
    const name = (formData.name || "").trim();
    const gmail = (formData.gmail || "").trim();
    const password = (formData.password || "").trim();
    const address = (formData.address || "").trim();
    const contact = (formData.contact || "").trim();
    const ageVal = formData.age;

    if (!name) return "Name is required.";
    if (!gmail) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(gmail)) {
      return "Enter a valid email address.";
    }
    if (!password) return "Password is required.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (ageVal === undefined || ageVal === "" || ageVal === null) {
      return "Age is required.";
    }
    const ageNum = Number(ageVal);
    if (!Number.isInteger(ageNum) || ageNum < 16 || ageNum > 100) {
      return "Age must be a whole number between 16 and 100.";
    }
    if (!address) return "Address is required.";
    if (!contact) return "Contact number is required.";
    if (!/^\+?\d{10,15}$/.test(contact.replace(/\s/g, ""))) {
      return "Contact must be 10–15 digits (optional + prefix).";
    }
    if (availableSocietiesForManager.length > 0 && !formData.societyId) {
      return "Please select a society for this manager.";
    }
    if (availableSocietiesForManager.length === 0) {
      return "Create a society first (no unassigned societies available).";
    }
    return "";
  };

  const submitSocietyManager = async () => {
    setSocietyManagerError("");
    const err = validateSocietyManagerForm();
    if (err) {
      setSocietyManagerError(err);
      return;
    }
    try {
      const payload = {
        name: formData.name.trim(),
        gmail: formData.gmail.trim().toLowerCase(),
        password: formData.password.trim(),
        role: "societyManager",
        age: Number(formData.age),
        address: formData.address.trim(),
        contact: formData.contact.replace(/\s/g, ""),
        societyId: formData.societyId,
      };
      await axios.post(`${API}/Users`, payload);
      alert("Society manager added successfully!");
      setFormData((prev) => ({
        ...prev,
        name: "",
        gmail: "",
        password: "",
        age: "",
        address: "",
        contact: "",
        societyId: "",
      }));
      setSocietyManagerError("");
      fetchUsers();
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || "Could not add society manager.");
    }
  };

  const submitData = async (endpoint, role) => {
    try {
      const data = role ? { ...formData, role } : formData;
      await axios.post(`${API}/${endpoint}`, data);
      alert("Added Successfully!");
      setFormData({});
      fetchUsers();
      if (endpoint === "modules") fetchModules();
      if (endpoint === "societies") fetchSocieties();
    } catch { alert("Error!"); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try { await axios.delete(`${API}/Users/${id}`); fetchUsers(); }
      catch { alert("Delete failed!"); }
    }
  };

  const handleEdit = (user) => {
    setEditUserId(user._id);
    setFormData({ name: user.name, gmail: user.gmail, age: user.age, address: user.address, contact: user.contact, role: user.role });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API}/admin/users/${editUserId}`, formData);
      setEditUserId(null); setFormData({}); fetchUsers();
      alert("Updated successfully!");
    } catch { alert("Update failed!"); }
  };

  const filteredUsers = users
    .filter((u) => u.role?.trim().toLowerCase() === userCategory)
    .filter((u) =>
      u.name.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "") ||
      u.gmail.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "")
    );

  const RESOURCE_TABS = [
    { key: "resourceFaculty",    label: "📁 Faculties" },
    { key: "resourceModule",     label: "📚 Res. Modules" },
    { key: "resourceApprovals",  label: "✅ Approvals" },
    { key: "resourceUpload",     label: "📤 Upload PDF" },
    { key: "resourceAnalytics",  label: "📊 Analytics" },
    { key: "resourceRatings",    label: "⭐ Ratings" },
  ];

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Uni Hub</h2>
        <button className="sidebar-link" onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className="sidebar-link" onClick={() => setActiveTab("users")}>All Users</button>
        <button className="sidebar-link" onClick={() => setActiveTab("societyManager")}>Add Society Manager</button>
        <button className="sidebar-link" onClick={() => setActiveTab("module")}>Add Module</button>
        <button className="sidebar-link" onClick={() => setActiveTab("society")}>Add Society</button>
        <button onClick={() => navigate("/adquiz")}>Add Quiz</button>

        <button 
          onClick={() => setShowResourcesMenu(!showResourcesMenu)} 
          style={{ marginTop: '10px', backgroundColor: '#374151', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Resources Management</span>
          <span>{showResourcesMenu ? "▲" : "▼"}</span>
        </button>
        {showResourcesMenu && (
          <div style={{ marginLeft: "10px", marginTop: "5px", display: "flex", flexDirection: "column" }}>
            {RESOURCE_TABS.map((t) => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                className={activeTab === t.key ? "ra-sidebar-active" : ""}
                style={{ fontSize: "14px", padding: "8px 12px", marginBottom: "4px" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Consultant Booking Management Link */}
        <button 
          className="sidebar-link" 
          onClick={() => setActiveTab("consultantBookings")}
          style={{ marginTop: '10px' }}
        >
          Consultant Bookings
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
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
      <p>
        <CountUp end={users.length} duration={2} />
      </p>
    </div>

    <div className="dashboard-card">
      <FaUserGraduate className="card-icon" />
      <h3>Students</h3>
      <p>
        <CountUp 
          end={users.filter(u => u.role === "Student").length} 
          duration={2} 
        />
      </p>
    </div>

    <div className="dashboard-card">
      <FaUserTie className="card-icon" />
      <h3>Society Managers</h3>
      <p>
        <CountUp 
          end={users.filter(u => u.role === "societyManager").length} 
          duration={2} 
        />
      </p>
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
    <input
      type="text"
      placeholder={`Search ${userCategory}...`}
      value={searchQuery[userCategory] || ""}
      onChange={(e) =>
        setSearchQuery({
          ...searchQuery,
          [userCategory]: e.target.value
        })
      }
      className="search-input"
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

        {/* Existing: Society Manager + Society forms */}
        {(activeTab === "societyManager" || activeTab === "society") && (
          <>
            <div className="form-card">
              <h2>Add Society Manager</h2>
              {societyManagerError && (
                <p className="form-error" role="alert">{societyManagerError}</p>
              )}
              <input
                name="name"
                placeholder="Name"
                value={formData.name || ""}
                onChange={handleChange}
                autoComplete="name"
              />
              <input
                name="gmail"
                type="email"
                placeholder="Email"
                value={formData.gmail || ""}
                onChange={handleChange}
                autoComplete="email"
              />
              <input
                name="password"
                placeholder="Password (min. 6 characters)"
                type="password"
                value={formData.password || ""}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <input
                name="age"
                type="number"
                min={16}
                max={100}
                placeholder="Age"
                value={formData.age ?? ""}
                onChange={handleChange}
              />
              <input
                name="address"
                placeholder="Address"
                value={formData.address || ""}
                onChange={handleChange}
                autoComplete="street-address"
              />
              <input
                name="contact"
                placeholder="Contact (10–15 digits)"
                value={formData.contact || ""}
                onChange={handleChange}
                inputMode="numeric"
              />
              {availableSocietiesForManager.length > 0 && (
                <select name="societyId" value={formData.societyId || ""} onChange={handleChange}>
                  <option value="">Select Society</option>
                  {availableSocietiesForManager.map((s) => <option key={s._id} value={s._id}>{s.societyName}</option>)}
                </select>
              )}
              {availableSocietiesForManager.length === 0 && (
                <p className="form-hint">
                  Add a society below (or ensure one has no manager yet) before assigning a manager.
                </p>
              )}
              <button type="button" className="dashboard-btn" onClick={submitSocietyManager}>
                Add Society Manager
              </button>
            </div>
            <div className="form-card">
              <h2>Registered Society Managers</h2>
              {users.filter((u) => u.role === "societyManager").length === 0 ? <p>No society managers registered yet.</p> : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Name</th><th>Email</th><th>Society</th></tr></thead>
                    <tbody>
                      {users.filter((u) => u.role === "societyManager").map((m) => {
                        const society = societies.find((s) => s._id === m.societyId);
                        return (
                          <tr key={m._id}>
                            <td>{m.name}</td><td>{m.gmail}</td>
                            <td>{society ? society.societyName : "No society assigned"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="form-card">
              <h2>Add Society</h2>
              <input name="societyName" placeholder="Society Name" value={formData.societyName || ""} onChange={handleChange} />
              <input name="description" placeholder="Description" value={formData.description || ""} onChange={handleChange} />
              <button className="dashboard-btn" onClick={() => submitData("societies")}>Add Society</button>
            </div>
          </>
        )}

        {/* Existing: Module form */}
        {activeTab === "module" && (
          <div className="form-card">
            <h2>Add Module</h2>
            <input name="moduleName" placeholder="Module Name" onChange={handleChange} />
            <input name="moduleCode" placeholder="Module Code" onChange={handleChange} />
            {modules.length > 0 && (
              <div className="module-list">
                <h3>All Modules</h3>
                <ul>{modules.map((m) => <li key={m._id}>{m.moduleName} ({m.moduleCode})</li>)}</ul>
              </div>
            )}
            <button className="dashboard-btn" onClick={() => submitData("modules")}>Add Module</button>
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
      </div>
    </div>
  );
}

export default AdminDashboard;