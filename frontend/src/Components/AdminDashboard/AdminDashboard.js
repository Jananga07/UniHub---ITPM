import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import { useNavigate } from "react-router-dom";
import CountUp from "react-countup";
import { FaUsers, FaUserGraduate, FaUserTie } from "react-icons/fa";


function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userCategory, setUserCategory] = useState("student");
  const [searchQuery, setSearchQuery] = useState({});
  const [modules, setModules] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchModules();
    fetchSocieties();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:5001/Users/admin/users");
      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await axios.get("http://localhost:5001/modules");
      setModules(res.data.modules || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSocieties = async () => {
    try {
      const res = await axios.get("http://localhost:5001/societies");
      setSocieties(res.data.societies || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const submitData = async (endpoint, role) => {
    try {
      const selectedSocietyId = formData.societyId;
      const data = role ? { ...formData, role } : formData;
      await axios.post(`http://localhost:5001/${endpoint}`, data);
      alert("Added Successfully!");

      setFormData({});
      fetchUsers();
      if (endpoint === "modules") {
        fetchModules();
      }
      if (endpoint === "societies") {
        fetchSocieties();
      }
    } catch (err) {
      alert("Error!");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5001/Users/${id}`);
        fetchUsers();
      } catch (err) {
        alert("Delete failed!");
      }
    }
  };




  const filteredUsers = users
    .filter((u) => u.role?.trim().toLowerCase() === userCategory)
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "") ||
        u.gmail.toLowerCase().includes(searchQuery[userCategory]?.toLowerCase() || "")
    );

  // Societies that are not yet assigned to any society manager
  const availableSocietiesForManager = societies.filter(
    (s) => !users.some((u) => u.role === "societyManager" && u.societyId === s._id)
  );

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Uni Hub</h2>
        <a onClick={() => setActiveTab("dashboard")}>Dashboard</a>
        <a onClick={() => setActiveTab("users")}>All Users</a>
        <a onClick={() => setActiveTab("societyManager")}>Add Society Manager</a>
        <a onClick={() => setActiveTab("module")}>Add Module</a>
        <a onClick={() => setActiveTab("society")}>Add Society</a>
        <button onClick={() => navigate("/adquiz")}>Add Quiz</button>
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

        {/* Add Forms */}
        {/* Show Society Manager + Society forms together on one interface */}
        {(activeTab === "societyManager" || activeTab === "society") && (
          <>
            <div className="form-card">
              <h2>Add Society Manager</h2>
              <input name="name" placeholder="Name" onChange={handleChange} />
              <input name="gmail" placeholder="Email" onChange={handleChange} />
              <input name="password" placeholder="Password" type="password" onChange={handleChange} />
              <input name="age" placeholder="Age" onChange={handleChange} />
              <input name="address" placeholder="Address" onChange={handleChange} />
              <input name="contact" placeholder="Contact" onChange={handleChange} />

              {/* Select an existing society for this manager (only unassigned societies) */}
              {availableSocietiesForManager.length > 0 && (
                <select
                  name="societyId"
                  value={formData.societyId || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Society</option>
                  {availableSocietiesForManager.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.societyName}
                    </option>
                  ))}
                </select>
              )}
              <button
                className="dashboard-btn"
                onClick={() =>
                  submitData("Users", "societyManager")
                }
              >
                Add Society Manager
              </button>
            </div>

            {/* Right side: table of registered society managers and their societies */}
            <div className="form-card">
              <h2>Registered Society Managers</h2>
              {users.filter((u) => u.role === "societyManager").length === 0 ? (
                <p>No society managers registered yet.</p>
              ) : (
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Society</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter((u) => u.role === "societyManager")
                        .map((m) => {
                          const society = societies.find(
                            (s) => s._id === m.societyId
                          );
                          return (
                            <tr key={m._id}>
                              <td>{m.name}</td>
                              <td>{m.gmail}</td>
                              <td>
                                {society
                                  ? society.societyName
                                  : "No society assigned"}
                              </td>
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
              <input
                name="societyName"
                placeholder="Society Name"
                value={formData.societyName || ""}
                onChange={handleChange}
              />
              <input
                name="description"
                placeholder="Description"
                value={formData.description || ""}
                onChange={handleChange}
              />
              <button
                className="dashboard-btn"
                onClick={() => submitData("societies")}
              >
                Add Society
              </button>
            </div>
          </>
        )}

        {/* Module form stays as its own section */}
        {activeTab === "module" && (
          <div className="form-card">
            <h2>Add Module</h2>
            <input
              name="moduleName"
              placeholder="Module Name"
              onChange={handleChange}
            />
            <input
              name="moduleCode"
              placeholder="Module Code"
              onChange={handleChange}
            />

            {modules.length > 0 && (
              <div className="module-list">
                <h3>All Modules</h3>
                <ul>
                  {modules.map((m) => (
                    <li key={m._id}>
                      {m.moduleName} ({m.moduleCode})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="dashboard-btn"
              onClick={() => submitData("modules")}
            >
              Add Module
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;