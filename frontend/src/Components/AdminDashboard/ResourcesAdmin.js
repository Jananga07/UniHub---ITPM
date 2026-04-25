// ─── ResourcesAdmin.js ───────────────────────────────────────────────────────
// Contains all resource-related admin tabs:
//   FacultyTab, ResourceModuleTab, ApprovalsTab, AdminUploadTab,
//   useResourceAnalytics, DownloadDistributionPie,
//   DashboardDownloadAnalytics, AnalyticsTab, RatingsTab
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import CountUp from "react-countup";
import { Pie } from "react-chartjs-2";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const CATEGORIES = ["Lecture Material", "Reading Material", "Short Notes", "Referral Sheets"];
const ANALYTICS_PIE_COLORS = ["#4f46e5","#06b6d4","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#14b8a6"];

// ─── FACULTY MANAGEMENT TAB ──────────────────────────────────────────────────
export function FacultyTab() {
  const [faculties, setFaculties] = useState([]);
  const [newName,   setNewName]   = useState("");
  const [editId,    setEditId]    = useState(null);
  const [editName,  setEditName]  = useState("");

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
export function ResourceModuleTab() {
  const [modules,   setModules]   = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [form,      setForm]      = useState({ moduleName: "", moduleCode: "", faculty: "", year: 1, semester: 1 });
  const [editId,    setEditId]    = useState(null);
  const [editForm,  setEditForm]  = useState({});

  const load = () => Promise.all([
    axios.get(`${API}/resources/modules`).then((r) => setModules(r.data.modules)),
    axios.get(`${API}/resources/faculties`).then((r) => setFaculties(r.data.faculties)),
  ]);

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!form.moduleName || !form.faculty || !form.year || !form.semester)
      return alert("Module name, faculty, year, and semester are required");
    await axios.post(`${API}/resources/modules`, form);
    setForm({ moduleName: "", moduleCode: "", faculty: "", year: 1, semester: 1 });
    load();
  };

  const save = async (id) => {
    if (!editForm.moduleName || !editForm.faculty || !editForm.year || !editForm.semester)
      return alert("Module name, faculty, year, and semester are required");
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
                      {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
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

// ─── PENDING APPROVALS TAB ───────────────────────────────────────────────────
export function ApprovalsTab() {
  const [pdfs,     setPdfs]     = useState([]);
  const [modules,  setModules]  = useState([]);
  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({ title: "", module: "", category: "" });

  const load = () => {
    axios.get(`${API}/resources/pdfs`, { params: { status: "pending" } }).then((r) => setPdfs(r.data.pdfs));
    axios.get(`${API}/resources/modules`).then((r) => setModules(r.data.modules));
  };

  useEffect(() => { load(); }, []);

  const approve = async (id) => { await axios.put(`${API}/resources/pdfs/${id}/approve`); load(); };
  const reject  = async (id) => { await axios.put(`${API}/resources/pdfs/${id}/reject`);  load(); };

  const startEdit  = (p) => { setEditId(p._id); setEditForm({ title: p.title || "", module: p.module?._id || "", category: p.category || "" }); };
  const cancelEdit = ()  => { setEditId(null);  setEditForm({ title: "", module: "", category: "" }); };

  const saveEdit = async (id) => {
    if (!editForm.title.trim()) return alert("Title cannot be empty.");
    if (!/^[a-zA-Z0-9\s]*$/.test(editForm.title)) return alert("Title can only contain letters and numbers.");
    if (!editForm.module || !editForm.category) return alert("Please select both module and category.");
    try {
      await axios.post(`${API}/resources/pdfs/${id}/update`, { title: editForm.title.trim(), module: editForm.module, category: editForm.category });
      cancelEdit(); load();
    } catch (err) {
      alert("Save failed: " + (err.response?.data?.message || err.message || "Unknown error"));
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
                      {editId === p._id
                        ? <input className="ra-input-sm" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="PDF Title" />
                        : p.title}
                    </td>
                    <td>
                      {editId === p._id
                        ? <select className="ra-input-sm" value={editForm.module} onChange={(e) => setEditForm({ ...editForm, module: e.target.value })}>
                            <option value="">Select Module</option>
                            {modules.map((m) => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
                          </select>
                        : p.module?.moduleName}
                    </td>
                    <td>
                      {editId === p._id
                        ? <select className="ra-input-sm" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                            <option value="">Select Category</option>
                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        : p.category}
                    </td>
                    <td>{p.uploadedBy || "anonymous"}</td>
                    <td>
                      <a href={`${API}/uploads/${p.filePath}`} target="_blank" rel="noreferrer"
                        style={{ color: "#4f46e5", fontSize: 13, fontWeight: 600, textDecoration: "underline", whiteSpace: "nowrap" }}>
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

// ─── ADMIN PDF UPLOAD TAB ────────────────────────────────────────────────────
export function AdminUploadTab() {
  const [faculties,   setFaculties]  = useState([]);
  const [allModules,  setAllModules] = useState([]);
  const [form,        setForm]       = useState({ faculty: "", year: 1, semester: 1, module: "", category: CATEGORIES[0], title: "" });
  const [file,        setFile]       = useState(null);
  const [msg,         setMsg]        = useState("");
  const [titleErr,    setTitleErr]   = useState("");

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitleErr(!/^[a-zA-Z0-9\s]*$/.test(val) ? "❌ Symbols like @, $, % are not valid. Use only letters and numbers." : "");
    setForm({ ...form, title: val });
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f && f.type !== "application/pdf") {
      setMsg("❌ Please select a valid PDF file."); setFile(null); e.target.value = null;
    } else { setMsg(""); setFile(f); }
  };

  useEffect(() => {
    axios.get(`${API}/resources/faculties`).then((r) => setFaculties(r.data.faculties));
  }, []);

  useEffect(() => {
    if (!form.faculty) return;
    axios.get(`${API}/resources/modules`, { params: { faculty: form.faculty, year: form.year, semester: form.semester } })
      .then((r) => setAllModules(r.data.modules));
  }, [form.faculty, form.year, form.semester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (titleErr) return setMsg("❌ Please fix title errors before uploading.");
    if (!form.faculty || !form.year || !form.semester || !form.module || !form.title || !file)
      return setMsg("❌ All fields and file are required.");
    const fd = new FormData();
    fd.append("title", form.title); fd.append("module", form.module);
    fd.append("category", form.category); fd.append("adminUpload", "true"); fd.append("file", file);
    try {
      await axios.post(`${API}/resources/pdfs/upload`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      setMsg("✅ PDF uploaded and approved successfully.");
      setFile(null); setForm({ ...form, title: "", module: "" });
    } catch { setMsg("❌ Upload failed."); }
  };

  return (
    <div>
      <h2 className="ra-section-title">Upload PDF (Admin)</h2>
      <div className="ra-upload-form">
        <form onSubmit={handleSubmit}>
          <select className="ra-input" value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value, module: "" })}>
            <option value="">Select Faculty</option>
            {faculties.map((f) => <option key={f._id} value={f._id}>{f.name}</option>)}
          </select>
          <select className="ra-input" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value), module: "" })}>
            {[1,2,3,4].map((y) => <option key={y} value={y}>Year {y}</option>)}
          </select>
          <select className="ra-input" value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value), module: "" })}>
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
          <select className="ra-input" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>
            <option value="">Select Module</option>
            {allModules.map((m) => <option key={m._id} value={m._id}>{m.moduleName}</option>)}
          </select>
          <select className="ra-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="ra-input" placeholder="PDF Title" value={form.title} onChange={handleTitleChange} required />
          {titleErr && <p style={{ fontSize: 13, margin: "4px 0", color: "#ef4444" }}>{titleErr}</p>}
          <input type="file" accept="application/pdf" onChange={handleFileChange} required />
          {msg && <p style={{ fontSize: 13, margin: "8px 0", color: msg.includes("❌") ? "#ef4444" : "#10b981" }}>{msg}</p>}
          <button className="dashboard-btn" type="submit">Upload & Approve</button>
        </form>
      </div>
    </div>
  );
}

// ─── ANALYTICS HOOK ──────────────────────────────────────────────────────────
export function useResourceAnalytics() {
  const [data,    setData]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    setLoading(true);
    axios.get(`${API}/resources/analytics`)
      .then((r) => { setData(r.data.pdfs); setTotal(r.data.totalDownloads); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return { data, total, loading, loadData };
}

// ─── PIE CHART COMPONENT ─────────────────────────────────────────────────────
export function DownloadDistributionPie({ data, total }) {
  const pieData = {
    labels: data.map((d) => (d.title.length > 20 ? `${d.title.slice(0, 20)}…` : d.title)),
    datasets: [{
      data: data.map((d) => d.downloadCount),
      backgroundColor: data.map((_, i) => ANALYTICS_PIE_COLORS[i % ANALYTICS_PIE_COLORS.length]),
      borderWidth: 1,
    }],
  };

  return (
    <>
      <div className="ra-analytics-summary">
        <div className="dashboard-card">
          <h3>Total Downloads</h3>
          <p><CountUp end={total} duration={2} /></p>
        </div>
        <div className="dashboard-card">
          <h3>Approved PDFs</h3>
          <p><CountUp end={data.length} duration={2} /></p>
        </div>
      </div>
      {data.length > 0 && (
        <div className="ra-chart-wrap">
          <h3 style={{ marginBottom: 16, fontWeight: 600, color: "#1e1b4b" }}>Download Distribution</h3>
          <div style={{ maxWidth: 380, margin: "0 auto" }}>
            <Pie data={pieData} options={{ plugins: { legend: { position: "bottom" } } }} />
          </div>
        </div>
      )}
    </>
  );
}

// ─── DASHBOARD MINI ANALYTICS (shown on main dashboard tab) ─────────────────
export function DashboardDownloadAnalytics() {
  const { data, total, loading } = useResourceAnalytics();
  return (
    <div className="dashboard-resource-analytics">
      <h2 className="ra-section-title dashboard-resource-analytics-heading">Resource download analytics</h2>
      {loading
        ? <p className="dashboard-resource-analytics-loading">Loading…</p>
        : <DownloadDistributionPie data={data} total={total} />}
    </div>
  );
}

// ─── ANALYTICS TAB ───────────────────────────────────────────────────────────
export function AnalyticsTab() {
  const { data, total, loading, loadData } = useResourceAnalytics();

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PDF permanently?")) return;
    try { await axios.delete(`${API}/resources/pdfs/${id}`); loadData(); }
    catch { alert("Failed to delete PDF"); }
  };

  return (
    <div>
      <h2 className="ra-section-title">Download Analytics</h2>
      {loading ? <p>Loading…</p> : (
        <>
          <DownloadDistributionPie data={data} total={total} />
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
                    <td><button className="dashboard-btn ra-btn-danger" onClick={() => handleDelete(d._id)}>Delete</button></td>
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

// ─── RATINGS OVERVIEW TAB ────────────────────────────────────────────────────
export function RatingsTab() {
  const [pdfs, setPdfs] = useState([]);

  const loadData = () =>
    axios.get(`${API}/resources/pdfs`, { params: { status: "approved" } }).then((r) => setPdfs(r.data.pdfs));

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this PDF permanently?")) return;
    try { await axios.delete(`${API}/resources/pdfs/${id}`); loadData(); }
    catch { alert("Failed to delete PDF"); }
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
              const avg = p.ratings?.length
                ? Math.round(p.ratings.reduce((s, r) => s + r.rating, 0) / p.ratings.length * 10) / 10
                : 0;
              return (
                <tr key={p._id}>
                  <td>{p.title}</td>
                  <td>{p.module?.moduleName}</td>
                  <td>{p.category}</td>
                  <td>{avg > 0 ? `${avg} ★` : "—"}</td>
                  <td>{p.ratings?.length || 0}</td>
                  <td><button className="dashboard-btn ra-btn-danger" onClick={() => handleDelete(p._id)}>Delete</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
