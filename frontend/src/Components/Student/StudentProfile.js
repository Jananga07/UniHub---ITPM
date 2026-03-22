import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./StudentProfile.css";

function StudentProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("society");

  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5001/Users/${user._id}`);
      alert("Account deleted successfully");
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/Users/${id}`);
        setUser(res.data.user);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

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

  if (!user) {
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
    <div className="profile-page profile-page--student">
      <aside className="profile-sidebar">
        <div className="profile-sidebar__brand">Uni Hub</div>

        <div className="profile-avatar-wrap">
          <div className="profile-avatar profile-avatar--student">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="profile-identity">
          <h1 className="profile-name">{user.name}</h1>
          <p className="profile-email">{user.gmail}</p>
          <span className="profile-badge profile-badge--student">Student</span>
        </div>

        <dl className="profile-meta">
          <div className="profile-meta__row">
            <dt>Age</dt>
            <dd>{user.age ?? "—"}</dd>
          </div>
          <div className="profile-meta__row">
            <dt>Contact</dt>
            <dd>{user.contact || "—"}</dd>
          </div>
          <div className="profile-meta__row profile-meta__row--block">
            <dt>Address</dt>
            <dd>{user.address || "—"}</dd>
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
          <p className="profile-main__eyebrow">Student dashboard</p>
          <h2 className="profile-main__title">
            {activeTab === "society" ? "Societies" : "Learning modules"}
          </h2>
          <p className="profile-main__subtitle">
            {activeTab === "society"
              ? "Explore societies and stay connected with campus life."
              : "Access your modules and course resources in one place."}
          </p>
        </header>

        <section className="profile-panel">
          {activeTab === "society" && (
            <div className="profile-panel__body">
              <div className="profile-feature">
                <h3 className="profile-feature__title">Your societies</h3>
                <p className="profile-feature__text">
                  Browse university societies, events, and memberships. Content
                  can be wired to your backend when ready.
                </p>
                <button
                  type="button"
                  className="profile-btn profile-btn--primary"
                  onClick={() => navigate("/societypage")}
                >
                  Open societies
                </button>
              </div>
            </div>
          )}
          {activeTab === "module" && (
            <div className="profile-panel__body">
              <div className="profile-feature">
                <h3 className="profile-feature__title">Module hub</h3>
                <p className="profile-feature__text">
                  Jump to the module overview to see codes, details, and related
                  materials.
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

export default StudentProfile;