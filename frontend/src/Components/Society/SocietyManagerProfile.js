/* global globalThis */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import MembershipRequestsPanel from "./MembershipRequestsPanel";
import "./SocietyManagerProfile.css";

function SocietyManagerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manager, setManager] = useState(null);
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("society");
  const [membershipRequests, setMembershipRequests] = useState([]);

  // Edit profile state
  const [editForm, setEditForm] = useState({ name: "", gmail: "", age: "", address: "", contact: "" });
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const [managerRes, societiesRes] = await Promise.all([
          axios.get(`http://localhost:5001/Users/${id}`),
          axios.get(`http://localhost:5001/societies`),
        ]);
        const managerUser = managerRes.data.user;
        const societies = societiesRes.data.societies || [];
        const assignedSociety = managerUser?.societyId
          ? societies.find((s) => s._id === managerUser.societyId) || null
          : null;
        if (!isMounted) return;
        setManager(managerUser);
        setSociety(assignedSociety);
        // seed edit form
        setEditForm({
          name:    managerUser.name    || "",
          gmail:   managerUser.gmail   || "",
          age:     managerUser.age     || "",
          address: managerUser.address || "",
          contact: managerUser.contact || "",
        });
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setManager(null);
        setSociety(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [id]);

  // Fetch membership requests for KPI count
  useEffect(() => {
    if (!manager?._id) return;
    axios
      .get(`http://localhost:5001/api/membership/manager/${manager._id}`)
      .then((res) => setMembershipRequests(res.data.requests || []))
      .catch(() => {});
  }, [manager?._id]);

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg({ type: "", text: "" });
    try {
      const res = await axios.put(`http://localhost:5001/Users/${manager._id}`, editForm);
      setManager(res.data.user);
      const stored = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...stored, ...res.data.user }));
      setEditMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setEditMsg({ type: "error", text: err.response?.data?.message || "Failed to update profile." });
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!manager?._id) return;
    if (!globalThis.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`http://localhost:5001/Users/${manager._id}`);
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  const pendingCount = membershipRequests.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div className="profile-page profile-page--loading">
        <div className="profile-loading">
          <div className="profile-loading__spinner" aria-hidden />
          <p>Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!manager) {
    return (
      <div className="profile-page profile-page--empty">
        <div className="profile-empty-card">
          <h2>User not found</h2>
          <p>We couldn't load this profile. Try signing in again.</p>
          <button type="button" className="profile-btn profile-btn--primary" onClick={() => navigate("/login")}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--manager">

      {/* ── Sidebar ── */}
      <aside className="profile-sidebar">

        {/* Brand */}
        <div className="profile-sidebar__brand">
          <div className="profile-sidebar__brand-mark">🎓</div>
          <div className="profile-sidebar__brand-copy">
            <h2>UniHub</h2>
            <p>Manager Portal</p>
          </div>
        </div>

        {/* Avatar + Identity */}
        <div className="profile-avatar-wrap">
          <div className="profile-avatar profile-avatar--manager">
            {manager.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-identity">
          <h1 className="profile-name">{manager.name}</h1>
          <p className="profile-email">{manager.gmail}</p>
          <span className="profile-badge profile-badge--manager">🏛 Society Manager</span>
        </div>

        {/* Meta Info */}
        <dl className="profile-meta">
          <div className="profile-meta__row">
            <dt>Age</dt>
            <dd>{manager.age ?? "—"}</dd>
          </div>
          <div className="profile-meta__row">
            <dt>Contact</dt>
            <dd>{manager.contact || "—"}</dd>
          </div>
          <div className="profile-meta__row profile-meta__row--block">
            <dt>Address</dt>
            <dd>{manager.address || "—"}</dd>
          </div>
          <div className="profile-meta__row profile-meta__row--block">
            <dt>Assigned Society</dt>
            <dd>{society?.societyName || "—"}</dd>
          </div>
        </dl>

        {/* Nav */}
        <div className="smp-sidebar-section-label">Navigation</div>
        <nav className="profile-nav" aria-label="Profile sections">
          <button
            type="button"
            className={`profile-nav__btn ${activeTab === "society" ? "is-active" : ""}`}
            onClick={() => setActiveTab("society")}
          >
            <span className="profile-nav__icon smp-icon-blue">🏛</span>
            <span>Society Dashboard</span>
          </button>
          <button
            type="button"
            className={`profile-nav__btn ${activeTab === "membership" ? "is-active" : ""}`}
            onClick={() => setActiveTab("membership")}
          >
            <span className="profile-nav__icon smp-icon-cyan">📋</span>
            <span>Membership Requests</span>
            {pendingCount > 0 && (
              <span style={{
                marginLeft: "auto", background: "#ef4444", color: "#fff",
                fontSize: "10px", fontWeight: 800, borderRadius: "99px",
                minWidth: "20px", height: "20px", display: "inline-flex",
                alignItems: "center", justifyContent: "center", padding: "0 6px"
              }}>{pendingCount}</span>
            )}
          </button>
          <button
            type="button"
            className={`profile-nav__btn ${activeTab === "module" ? "is-active" : ""}`}
            onClick={() => setActiveTab("module")}
          >
            <span className="profile-nav__icon smp-icon-orange">📚</span>
            <span>Modules</span>
          </button>
          <button
            type="button"
            className={`profile-nav__btn ${activeTab === "settings" ? "is-active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            <span className="profile-nav__icon smp-icon-purple">⚙️</span>
            <span>Edit Profile</span>
          </button>
        </nav>

        {/* Delete */}
        <div className="smp-sidebar-section-label">Account</div>
        <div className="smp-sidebar-footer">
          <button
            type="button"
            className="profile-btn profile-btn--danger profile-btn--block"
            onClick={handleDelete}
          >
            <span className="profile-nav__icon" style={{ background: "rgba(239,68,68,0.25)", width: 28, height: 28, minWidth: 28, borderRadius: 7, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🗑</span>
            Delete Account
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="profile-main">

        {/* Topbar */}
        <div className="smp-topbar">
          <div className="smp-topbar-left">
            <h1>Welcome back, {manager.name.split(" ")[0]} 👋</h1>
            <p>Society Manager Dashboard · {society?.societyName || "No society assigned"}</p>
          </div>
          <div className="smp-topbar-right">
            <div className="smp-search-bar">
              <span>🔍</span>
              <input type="text" placeholder="Search..." readOnly />
            </div>
            <button className="smp-notif-btn" title="Notifications">
              🔔
              {pendingCount > 0 && <span className="smp-notif-dot" />}
            </button>
            <div className="smp-profile-chip">
              {manager.name.charAt(0).toUpperCase()} {manager.name.split(" ")[0]}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="smp-kpi-grid">
          <div className="smp-kpi-card smp-kpi-card--blue">
            <div className="smp-kpi-icon smp-kpi-icon--blue">👥</div>
            <div className="smp-kpi-label">Total Members</div>
            <div className="smp-kpi-value">{membershipRequests.filter(r => r.status === "approved").length}</div>
            <div className="smp-kpi-sub">Approved members</div>
          </div>
          <div className="smp-kpi-card smp-kpi-card--orange">
            <div className="smp-kpi-icon smp-kpi-icon--orange">⏳</div>
            <div className="smp-kpi-label">Pending Requests</div>
            <div className="smp-kpi-value">{pendingCount}</div>
            <div className="smp-kpi-sub">Awaiting review</div>
          </div>
          <div className="smp-kpi-card smp-kpi-card--green">
            <div className="smp-kpi-icon smp-kpi-icon--green">✅</div>
            <div className="smp-kpi-label">Total Applications</div>
            <div className="smp-kpi-value">{membershipRequests.length}</div>
            <div className="smp-kpi-sub">All time</div>
          </div>
          <div className="smp-kpi-card smp-kpi-card--purple">
            <div className="smp-kpi-icon smp-kpi-icon--purple">🏛</div>
            <div className="smp-kpi-label">Society Status</div>
            <div className="smp-kpi-value" style={{ fontSize: "18px", paddingTop: "6px" }}>
              {society ? "Active" : "Unassigned"}
            </div>
            <div className="smp-kpi-sub">{society?.societyName || "Contact admin"}</div>
          </div>
        </div>

        {/* Tab Panel */}
        <section className="profile-panel profile-panel--manager">
          <div className="profile-panel__body">

            {/* ── Society Tab ── */}
            {activeTab === "society" && (
              <div>
                <div className="smp-panel-header">
                  <span className="smp-panel-eyebrow">Overview</span>
                  <h2>Your Society</h2>
                  <p>Overview of the society you manage and its current details.</p>
                </div>
                {society ? (
                  <div className="manager-society-card">
                    <div className="manager-society-card__header">
                      <h3>{society.societyName}</h3>
                      <span className="manager-society-card__pill">✅ Managed</span>
                    </div>
                    <p className="manager-society-card__desc">
                      {society.description || "No description has been added for this society yet."}
                    </p>
                    <button type="button" className="profile-btn profile-btn--primary" onClick={() => navigate("/societypage")}>
                      View All Societies →
                    </button>
                  </div>
                ) : (
                  <div className="profile-feature">
                    <h3 className="profile-feature__title">No society assigned</h3>
                    <p className="profile-feature__text">
                      An administrator can link you to a society from the admin dashboard.
                      Until then, you can still browse the public societies list.
                    </p>
                    <button type="button" className="profile-btn profile-btn--primary" onClick={() => navigate("/societypage")}>
                      Browse Societies
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Membership Tab ── */}
            {activeTab === "membership" && (
              <div>
                <div className="smp-panel-header">
                  <span className="smp-panel-eyebrow">Applications</span>
                  <h2>Membership Requests</h2>
                  <p>Review submitted applications and approve or reject them instantly.</p>
                </div>
                <MembershipRequestsPanel
                  managerId={manager?._id || ""}
                  societyName={society?.societyName || society?.name || ""}
                  isActive={activeTab === "membership"}
                />
              </div>
            )}

            {/* ── Module Tab ── */}
            {activeTab === "module" && (
              <div>
                <div className="smp-panel-header">
                  <span className="smp-panel-eyebrow">Resources</span>
                  <h2>Module Hub</h2>
                  <p>Align with university modules and resources for your society members.</p>
                </div>
                <div className="smp-module-placeholder">
                  <p className="profile-feature__text">
                    Use the module page to align with university modules and resources.
                    Extend this area when society-specific modules are implemented.
                  </p>
                  <button type="button" className="profile-btn profile-btn--primary" onClick={() => navigate("/resources")}>
                    Go to Resources →
                  </button>
                </div>
              </div>
            )}

            {/* ── Edit Profile Tab ── */}
            {activeTab === "settings" && (
              <div>
                <div className="smp-panel-header">
                  <span className="smp-panel-eyebrow">Account</span>
                  <h2>Edit Profile</h2>
                  <p>Update your personal details below.</p>
                </div>
                <form className="edit-profile-form" onSubmit={handleEditSave}>
                  <div className="edit-profile-grid">
                    <div className="edit-field">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                    <div className="edit-field">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={editForm.gmail}
                        onChange={(e) => setEditForm({ ...editForm, gmail: e.target.value })}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div className="edit-field">
                      <label>Age</label>
                      <input
                        type="number"
                        value={editForm.age}
                        onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                        placeholder="Your age"
                        min="1"
                      />
                    </div>
                    <div className="edit-field">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        value={editForm.contact}
                        onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })}
                        placeholder="+94XXXXXXXXX"
                      />
                    </div>
                    <div className="edit-field edit-field--full">
                      <label>Address</label>
                      <textarea
                        value={editForm.address}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        placeholder="Your address"
                        rows={3}
                      />
                    </div>
                  </div>
                  {editMsg.text && (
                    <div className={`edit-profile-msg edit-profile-msg--${editMsg.type}`}>
                      {editMsg.type === "success" ? "✅" : "⚠️"} {editMsg.text}
                    </div>
                  )}
                  <div className="edit-profile-actions">
                    <button type="submit" className="profile-btn profile-btn--primary" disabled={editSaving}>
                      {editSaving ? "Saving…" : "💾 Save Changes"}
                    </button>
                    <button
                      type="button"
                      className="edit-cancel-btn"
                      onClick={() => {
                        setEditForm({ name: manager.name || "", gmail: manager.gmail || "", age: manager.age || "", address: manager.address || "", contact: manager.contact || "" });
                        setEditMsg({ type: "", text: "" });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </section>
      </main>
    </div>
  );
}

export default SocietyManagerProfile;
