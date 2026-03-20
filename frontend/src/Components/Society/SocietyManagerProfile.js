import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "../Student/StudentProfile.css";

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

    const confirmDelete = window.confirm("Are you sure you want to delete your account?");
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

  if (loading) return <p>Loading...</p>;
  if (!manager) return <p>User not found</p>;

  return (
    <div className="profile-wrapper">
      <div className="sidebar">
        <div className="avatar">{manager.name?.charAt(0).toUpperCase()}</div>
        <h2>{manager.name}</h2>
        <p>{manager.gmail}</p>

        <ul className="profile-info">
          <li>
            Age: <span>{manager.age || "N/A"}</span>
          </li>
          <li>
            Address: <span>{manager.address || "N/A"}</span>
          </li>
          <li>
            Contact: <span>{manager.contact || "N/A"}</span>
          </li>
          <li>
            Role: <span>{manager.role || "Society Manager"}</span>
          </li>
          <li>
            Society: <span>{society?.societyName || "N/A"}</span>
          </li>

          <button className="delete-btn" onClick={handleDelete}>
            Delete Account
          </button>
        </ul>

        <button
          className={activeTab === "society" ? "active" : ""}
          onClick={() => setActiveTab("society")}
        >
          Society
        </button>

        <button
          className={activeTab === "module" ? "active" : ""}
          onClick={() => setActiveTab("module")}
        >
          Module
        </button>
      </div>

      <div className="main-content">
        <div className="tab-content">
          {activeTab === "society" && (
            <div>
              <h2>Managed Society</h2>
              <p>{society?.societyName ? `You manage: ${society.societyName}` : "No society assigned."}</p>
              <p>{society?.description ? `Description: ${society.description}` : ""}</p>
            </div>
          )}

          {activeTab === "module" && (
            <div>
              <h2>Module</h2>
              <p>This section is available when you connect society manager module features.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SocietyManagerProfile;