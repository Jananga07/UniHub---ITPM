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
import { FaCheckCircle, FaEnvelope, FaTrashAlt, FaUsers, FaUserGraduate, FaUserTie } from "react-icons/fa";
import ConsultantBookingManagement from "../ConsultantBookingManagement/ConsultantBookingManagement";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = "http://localhost:5001";
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
    await axios.put(`${API}/resources/faculties/${id}`, { name: editName });
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
    if (!form.moduleName || !form.faculty) return alert("Module name and faculty required");
    await axios.post(`${API}/resources/modules`, form);
    setForm({ moduleName: "", moduleCode: "", faculty: "", year: 1, semester: 1 });
    load();
  };

  const save = async (id) => {
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
                <td>{m.faculty?.name}</td>
                <td>{m.year}</td>
                <td>{m.semester}</td>
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
    if (!file) return setMsg("Please select a PDF file.");
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
            onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} required />
          {msg && <p style={{ fontSize: 13, margin: "8px 0" }}>{msg}</p>}
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

  useEffect(() => {
    axios.get(`${API}/resources/analytics`)
      .then((r) => { setData(r.data.pdfs); setTotal(r.data.totalDownloads); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
                <tr><th>PDF Title</th><th>Downloads</th><th>Avg Rating</th><th>Ratings</th></tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr key={d._id}>
                    <td>{d.title}</td>
                    <td>{d.downloadCount}</td>
                    <td>{d.averageRating > 0 ? `${d.averageRating} ★` : "—"}</td>
                    <td>{d.ratingCount}</td>
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

  useEffect(() => {
    axios.get(`${API}/resources/pdfs`, { params: { status: "approved" } })
      .then((r) => setPdfs(r.data.pdfs));
  }, []);

  return (
    <div>
      <h2 className="ra-section-title">PDF Ratings Overview</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr><th>Title</th><th>Module</th><th>Category</th><th>Avg Rating</th><th>Total Ratings</th></tr>
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
  const [editSocietyId, setEditSocietyId] = useState(null);
  const [editSocietyDescription, setEditSocietyDescription] = useState("");
  const [societyManagerError, setSocietyManagerError] = useState("");
  const [showResourcesMenu, setShowResourcesMenu] = useState(false);
  const [selectedManagerIds, setSelectedManagerIds] = useState([]);
  const societyManagerFormRef = useRef(null);
  const societyManagerNameInputRef = useRef(null);
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
      const data = role ? { ...formData, role } : formData;

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
      alert("Added Successfully!");
      setFormData({});
      fetchUsers();
      if (endpoint === "modules") fetchModules();
      if (endpoint === "societies") fetchSocieties();
    } catch (error) {
      alert(error.response?.data?.message || "Error!");
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
      fetchSocieties();
      alert("Society deleted successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Society delete failed!");
    }
  };

  const handleStartSocietyEdit = (society) => {
    setEditSocietyId(society._id);
    setEditSocietyDescription(society.description || "");
  };

  const handleCancelSocietyEdit = () => {
    setEditSocietyId(null);
    setEditSocietyDescription("");
  };

  const handleSaveSocietyEdit = async (societyId) => {
    const trimmedDescription = editSocietyDescription.trim();

    if (!trimmedDescription) {
      alert("Description is required.");
      return;
    }

    try {
      await axios.put(`${API}/societies/${societyId}`, { description: trimmedDescription });
      handleCancelSocietyEdit();
      fetchSocieties();
      alert("Society updated successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Society update failed!");
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

  const societyManagers = users.filter((u) => u.role === "societyManager");

  useEffect(() => {
    const managerIds = new Set(societyManagers.map((manager) => manager._id));

    setSelectedManagerIds((currentIds) =>
      currentIds.filter((id) => managerIds.has(id))
    );
  }, [societyManagers]);

  const handleOpenSocietyManagerForm = () => {
    setActiveTab("societyManager");

    requestAnimationFrame(() => {
      societyManagerFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      setTimeout(() => {
        societyManagerNameInputRef.current?.focus();
      }, 180);
    });
  };

  const allManagersSelected = societyManagers.length > 0 && selectedManagerIds.length === societyManagers.length;

  const handleToggleAllManagers = () => {
    setSelectedManagerIds(allManagersSelected ? [] : societyManagers.map((manager) => manager._id));
  };

  const handleToggleManagerSelection = (managerId) => {
    setSelectedManagerIds((currentIds) =>
      currentIds.includes(managerId)
        ? currentIds.filter((id) => id !== managerId)
        : [...currentIds, managerId]
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

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Uni Hub</h2>
        <button className="sidebar-link" onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className="sidebar-link" onClick={() => setActiveTab("users")}>All Users</button>
        <button className="sidebar-link" onClick={handleOpenSocietyManagerForm}>Add Society Manager</button>
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

        {/* Society Manager Dashboard */}
        {activeTab === "societyManager" && (
          <div className="society-manager-dashboard">
            <div className="society-manager-page-shell">
              <div className="form-card society-manager-form society-manager-page-card" ref={societyManagerFormRef}>
                <div className="section-header-block society-manager-page-header">
                  <span className="section-kicker">Administration</span>
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
                    placeholder="Temporary password"
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
                    {societies.map((s) => <option key={s._id} value={s._id}>{s.societyName}</option>)}
                  </select>
                  <button
                    className="dashboard-btn society-manager-submit"
                    onClick={() => submitData("Users", "societyManager")}
                  >
                    Add Society Manager
                  </button>
                </div>
              </div>
            </div>

            <div className="form-card manager-list-card manager-list-card-full">
              <div className="manager-list-header">
                <div>
                  <span className="section-kicker">Directory</span>
                  <h2>Registered Society Managers</h2>
                  <p className="section-subtext">Review assigned managers and track which societies already have ownership.</p>
                </div>
                <div className="manager-list-actions">
                  <span className="manager-count-badge">{societyManagers.length} registered</span>
                  <button className="dashboard-btn manager-action-btn" onClick={handleOpenSocietyManagerForm}>Add Society Manager</button>
                </div>
              </div>
              {societyManagers.length === 0 ? <div className="manager-empty-state"><p>No society managers registered yet. Start by creating the first manager account.</p><button className="dashboard-btn manager-action-btn" onClick={handleOpenSocietyManagerForm}>Create First Manager</button></div> : (
                <div className="manager-directory-shell">
                  <div className="manager-selection-bar">
                    <div className="manager-selection-copy">
                      <strong>{selectedManagerIds.length}</strong> of <strong>{societyManagers.length}</strong> managers selected
                    </div>
                    <div className="manager-selection-tools">
                      <button className="manager-selection-button" onClick={handleToggleAllManagers}>
                        {allManagersSelected ? "Clear selection" : "Select all"}
                      </button>
                    </div>
                  </div>

                  <table className="manager-directory-table">
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
                      {societyManagers.map((m) => {
                        const society = societies.find((s) => s._id === m.societyId);
                        const isSelected = selectedManagerIds.includes(m._id);
                        const initials = m.name
                          .split(" ")
                          .filter(Boolean)
                          .slice(0, 2)
                          .map((part) => part[0]?.toUpperCase())
                          .join("");

                        return (
                          <tr key={m._id} className={isSelected ? "manager-row-selected" : ""}>
                            <td className="manager-checkbox-col">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleManagerSelection(m._id)}
                              />
                            </td>
                            <td>
                              <div className="manager-identity-cell">
                                <div className="manager-avatar">{initials || "SM"}</div>
                                <div className="manager-meta-block">
                                  <strong>{m.name}</strong>
                                  <span>{m.gmail}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="manager-society-stack">
                                <span className="society-tag">{society ? society.societyName : "No society assigned"}</span>
                                <span className="manager-address-text">{m.address || "Address not added"}</span>
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
                                {society ? "Assigned" : "Pending"}
                              </span>
                            </td>
                            <td className="manager-actions-col">
                              <div className="manager-row-actions">
                                <button
                                  className="manager-icon-action"
                                  title="Send email"
                                  onClick={() => window.open(`mailto:${m.gmail}`, "_self")}
                                >
                                  <FaEnvelope />
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
        )}

        {/* Society Management */}
        {activeTab === "society" && (
          <div className="society-manager-dashboard-grid">
            <div className="form-card society-list-card">
              <div className="section-header-block">
                <span className="section-kicker">Community</span>
                <h2>Add Society</h2>
                <p className="section-subtext">Create a society record and keep the community directory organized for manager assignment.</p>
              </div>
              <input name="societyName" placeholder="Society Name" value={formData.societyName || ""} onChange={handleChange} />
              <input name="description" placeholder="Description" value={formData.description || ""} onChange={handleChange} />
              <button className="dashboard-btn" onClick={() => submitData("societies")}>Add Society</button>
            </div>

            <div className="form-card society-list-card society-list-card-full">
              <div className="manager-list-header">
                <div>
                  <span className="section-kicker">Directory</span>
                  <h2>Registered Societies</h2>
                  <p className="section-subtext">All societies added through the admin panel are listed here.</p>
                </div>
                <div className="manager-list-actions">
                  <span className="manager-count-badge">{societies.length} societies</span>
                </div>
              </div>

              {societies.length === 0 ? (
                <div className="manager-empty-state">
                  <p>No societies have been added yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table>
                    <thead><tr><th>Society Name</th><th>Description</th><th>Manager Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {societies.map((society) => {
                        const assignedManager = societyManagers.find((manager) => manager.societyId === society._id);
                        const isEditingSociety = editSocietyId === society._id;
                        return (
                          <tr key={society._id}>
                            <td>{society.societyName}</td>
                            <td>
                              {isEditingSociety ? (
                                <textarea
                                  className="society-description-editor"
                                  value={editSocietyDescription}
                                  onChange={(e) => setEditSocietyDescription(e.target.value)}
                                />
                              ) : (
                                society.description || "No description added"
                              )}
                            </td>
                            <td>
                              <span className={`society-tag ${assignedManager ? "society-tag-assigned" : "society-tag-pending"}`}>
                                {assignedManager ? assignedManager.name : "No manager assigned"}
                              </span>
                            </td>
                            <td>
                              <div className="society-action-group">
                                {isEditingSociety ? (
                                  <>
                                    <button
                                      className="dashboard-btn manager-action-btn"
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
                                      className="dashboard-btn manager-action-btn"
                                      onClick={() => handleStartSocietyEdit(society)}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      className="dashboard-btn society-delete-btn"
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