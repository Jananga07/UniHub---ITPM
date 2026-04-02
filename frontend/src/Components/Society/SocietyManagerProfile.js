import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./SocietyManagerProfile.css";

function SocietyManagerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [manager, setManager] = useState(null);
  const [society, setSociety] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("society");

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

        const assignedSociety =
          managerUser?.societyId
            ? societies.find((s) => s._id === managerUser.societyId) || null
            : null;

        if (!isMounted) return;
        setManager(managerUser);
        setSociety(assignedSociety);
      } catch (err) {
        console.error(err);
        if (!isMounted) return;
        setManager(null);
        setSociety(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleDelete = async () => {
    if (!manager?._id) return;

    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/Users/${manager._id}`);
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

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
          <p>We couldn’t load this profile. Try signing in again.</p>
          <button
            type="button"
            className="profile-btn profile-btn--primary"
            onClick={() => navigate("/login")}
          >
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page profile-page--manager">
      <aside className="profile-sidebar">
        <div className="profile-sidebar__brand">Uni Hub</div>

        <div className="profile-avatar-wrap">
          <div className="profile-avatar profile-avatar--manager">
            {manager.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-identity">
          <h1 className="profile-name">{manager.name}</h1>
          <p className="profile-email">{manager.gmail}</p>
          <span className="profile-badge profile-badge--manager">
            Society manager
          </span>
        </div>

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
            <dt>Assigned society</dt>
            <dd>{society?.societyName || "—"}</dd>
          </div>
        </dl>

        <nav className="profile-nav" aria-label="Profile sections">
          <button
            type="button"
            className={`profile-nav__btn ${
              activeTab === "society" ? "is-active" : ""
            }`}
            onClick={() => setActiveTab("society")}
          >
            <span className="profile-nav__icon" aria-hidden>
              ◎
            </span>
            Society
          </button>
          <button
            type="button"
            className={`profile-nav__btn ${
              activeTab === "module" ? "is-active" : ""
            }`}
            onClick={() => setActiveTab("module")}
          >
            <span className="profile-nav__icon" aria-hidden>
              ▤
            </span>
            Modules
          </button>
        </nav>

        <button
          type="button"
          className="profile-btn profile-btn--danger profile-btn--block"
          onClick={handleDelete}
        >
          Delete account
        </button>
      </aside>

      <main className="profile-main">
        <header className="profile-main__header">
          <p className="profile-main__eyebrow">Society manager dashboard</p>
          <h2 className="profile-main__title">
            {activeTab === "society" ? "Your society" : "Modules & resources"}
          </h2>
          <p className="profile-main__subtitle">
            {activeTab === "society"
              ? "Overview of the society you manage and its details."
              : "Connect module tools here when your backend features are ready."}
          </p>
        </header>

        <section className="profile-panel profile-panel--manager">
          {activeTab === "society" && (
            <div className="profile-panel__body">
              {society ? (
                <div className="manager-society-card">
                  <div className="manager-society-card__header">
                    <h3 className="profile-feature__title">{society.societyName}</h3>
                    <span className="manager-society-card__pill">Managed</span>
                  </div>
                  <p className="manager-society-card__desc">
                    {society.description ||
                      "No description has been added for this society yet."}
                  </p>
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary"
                    onClick={() => navigate("/societypage")}
                  >
                    View all societies
                  </button>
                </div>
              ) : (
                <div className="profile-feature">
                  <h3 className="profile-feature__title">No society assigned</h3>
                  <p className="profile-feature__text">
                    An administrator can link you to a society from the admin
                    dashboard. Until then, you can still browse the public
                    societies list.
                  </p>
                  <button
                    type="button"
                    className="profile-btn profile-btn--primary"
                    onClick={() => navigate("/societypage")}
                  >
                    Browse societies
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "module" && (
            <div className="profile-panel__body">
              <div className="profile-feature">
                <h3 className="profile-feature__title">Module hub</h3>
                <p className="profile-feature__text">
                  Use the module page to align with university modules and
                  resources. Extend this area when society-specific modules are
                  implemented.
                </p>
                <button
                  type="button"
                  className="profile-btn profile-btn--primary"
                  onClick={() => navigate("/modulepage")}
                >
                  Go to module page
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default SocietyManagerProfile;
