import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./StudentProfile.css";

function StudentProfile() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("society"); // default tab

  const navigate = useNavigate();

  //Delete Account
  const handleDelete = async () => {
  const confirmDelete = window.confirm("Are you sure you want to delete your account?");

  if (!confirmDelete) return;

  try {
    await axios.delete(`http://localhost:5001/users/${user._id}`);

    alert("Account deleted successfully");

    // logout user and redirect
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

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User not found</p>;

  return (
    <div className="profile-wrapper">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <h2>{user.name}</h2>
        <p>{user.gmail}</p>
        <ul className="profile-info">
          <li>
            Age: <span>{user.age || "N/A"}</span>
          </li>
          <li>
            Address: <span>{user.address || "N/A"}</span>
          </li>
          <li>
            Contact: <span>{user.contact || "N/A"}</span>
          </li>
          <li>
            Role: <span>{user.role || "Student"}</span>
          </li>

          <button
            className="delete-btn"
            onClick={handleDelete}
          
          >Delete Account</button>
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

      {/* Main content */}
      <div className="main-content">
        <div className="tab-content">
          {activeTab === "society" && (
            <div>
              <h2>Society Page</h2>
              <p>Here you can see and manage your societies.</p>
              {/* Add society content or fetch from backend */}
            </div>
          )}
          {activeTab === "module" && (
            <div>
              <h2>Module Page</h2>
              <p>Here you can see your modules and related content.</p>

              <button 
              className="navigate-module-btn"
              onClick={() => navigate("/modulepage")}
              >Go to Module Page</button>
              
              {/* Add module content or fetch from backend */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;