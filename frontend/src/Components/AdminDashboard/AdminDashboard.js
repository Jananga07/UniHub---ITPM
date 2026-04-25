import { useCallback, useEffect, useRef, useState } from "react";
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
import {
  FaBookOpen,
  FaCalendarAlt,
  FaChartPie,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaFileUpload,
  FaFolderOpen,
  FaGraduationCap,
  FaHome,
  FaLayerGroup,
  FaPlusCircle,
  FaStar,
  FaTrashAlt,
  FaUserGraduate,
  FaUserTie,
  FaUsers,
} from "react-icons/fa";
import ConsultantBookingManagement from "../ConsultantBookingManagement/ConsultantBookingManagement";
import ComplaintHandling from "../ComplaintHandling/ComplaintHandling";
import AddQuiz from "../Quiz/AddQuiz";
import QuizOverview from "../Quiz/QuizOverview";
import SearchBar from "../SearchBar/SearchBar.js";
import "../SearchBar/managersSearch.css";
import "../SearchBar/societiesSearch.css";
import { clubTypeOptions } from "../../data/clubData.js";
import {
  FacultyTab,
  ResourceModuleTab,
  ApprovalsTab,
  AdminUploadTab,
  AnalyticsTab,
  RatingsTab,
  DashboardDownloadAnalytics,
} from "./ResourcesAdmin";

ChartJS.register(ArcElement, Tooltip, Legend);

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_REGEX = /^\+?\d{10,15}$/;

const isUniversityEmail = (email) => {
  const domain = email.split("@")[1] || "";
  return /\.(edu|ac\.[a-z]{2,})$/i.test(domain);
};

const normalizeContactNumber = (contactNumber = "") => contactNumber.trim().replaceAll(/[\s-]/g, "");

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
  const [showQuizMenu, setShowQuizMenu] = useState(false);
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

  const validateSocietyForm = (data) => {
    const name = (data.name || "").trim();
    const description = (data.description || "").trim();
    const clubType = (data.clubType || "").trim();

    if (!name || !description || !clubType) {
      return null;
    }

    return { name, description, clubType };
  };

  const submitData = async (endpoint, role) => {
    try {
      let data = role ? { ...formData, role } : { ...formData };

      if (endpoint === "societies") {
        data = validateSocietyForm(formData);

        if (!data) {
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

  // ─── Sidebar / tab config ────────────────────────────────────────────────
  const RESOURCE_TABS = [
    { key: "resourceFaculty",   label: "Faculties",    icon: FaFolderOpen },
    { key: "resourceModule",    label: "Res. Modules", icon: FaBookOpen },
    { key: "resourceApprovals", label: "Approvals",    icon: FaCheckCircle },
    { key: "resourceUpload",    label: "Upload PDF",   icon: FaFileUpload },
    { key: "resourceAnalytics", label: "Analytics",    icon: FaChartPie },
    { key: "resourceRatings",   label: "Ratings",      icon: FaStar },
  ];

  const isResourceTabActive = RESOURCE_TABS.some((tab) => tab.key === activeTab);
  const QUIZ_TABS = [
    { key: "quiz",         label: "Add Quiz",      icon: FaPlusCircle },
    { key: "quizOverview", label: "Quiz Overview", icon: FaChartPie   },
  ];
  const isQuizTabActive = QUIZ_TABS.some((tab) => tab.key === activeTab);

  const SIDEBAR_LINKS = [
    { key: "dashboard",      label: "Dashboard",           icon: FaHome,       onClick: () => setActiveTab("dashboard") },
    { key: "users",          label: "All Users",           icon: FaUsers,      onClick: () => setActiveTab("users") },
    { key: "societyManager", label: "Add Society Manager", icon: FaUserTie,    onClick: handleOpenSocietyManagerForm },
    { key: "society",        label: "Add Society",         icon: FaPlusCircle, onClick: () => setActiveTab("society") },
  ];

  const SIDEBAR_FOOTER_LINKS = [
    { key: "complaintHandling",   label: "Complaint Handling",   icon: FaClipboardList, onClick: () => setActiveTab("complaintHandling") },
    { key: "consultantBookings",  label: "Consultant Bookings",  icon: FaCalendarAlt,   onClick: () => setActiveTab("consultantBookings") },
  ];

  // ─── Derived selection state ─────────────────────────────────────────────
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

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-panel">
          <div className="sidebar-brand">
            <div className="sidebar-brand-mark">
              <FaGraduationCap />
            </div>
            <div className="sidebar-brand-copy">
              <h2>Uni Hub</h2>
              <p>Admin console</p>
            </div>
          </div>

          <div className="sidebar-nav">
            <div className="sidebar-section-label">Main Menu</div>
            {SIDEBAR_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`sidebar-link ${activeTab === item.key ? "sidebar-link-active" : ""}`}
                  onClick={item.onClick}
                >
                  <span className="sidebar-link-main">
                    <span className="sidebar-link-icon"><Icon /></span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </span>
                </button>
              );
            })}

            <div className="sidebar-section-label sidebar-section-label-spaced">Resources</div>
            <button
              className={`sidebar-link sidebar-toggle ${showResourcesMenu || isResourceTabActive ? "sidebar-link-active" : ""}`}
              onClick={() => setShowResourcesMenu(!showResourcesMenu)}
            >
              <span className="sidebar-link-main">
                <span className="sidebar-link-icon"><FaLayerGroup /></span>
                <span className="sidebar-link-label">Resources Management</span>
              </span>
              <span className="sidebar-toggle-icon">{showResourcesMenu ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            {showResourcesMenu && (
              <div className="sidebar-submenu">
                {RESOURCE_TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`sidebar-submenu-link ${activeTab === t.key ? "ra-sidebar-active" : ""}`}
                    >
                      <span className="sidebar-submenu-icon"><Icon /></span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="sidebar-section-label sidebar-section-label-spaced">Quiz</div>
            <button
              className={`sidebar-link sidebar-toggle ${showQuizMenu || isQuizTabActive ? "sidebar-link-active" : ""}`}
              onClick={() => setShowQuizMenu(!showQuizMenu)}
            >
              <span className="sidebar-link-main">
                <span className="sidebar-link-icon"><FaChartPie /></span>
                <span className="sidebar-link-label">Quiz Management</span>
              </span>
              <span className="sidebar-toggle-icon">{showQuizMenu ? <FaChevronUp /> : <FaChevronDown />}</span>
            </button>
            {showQuizMenu && (
              <div className="sidebar-submenu">
                {QUIZ_TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.key}
                      onClick={() => setActiveTab(t.key)}
                      className={`sidebar-submenu-link ${activeTab === t.key ? "ra-sidebar-active" : ""}`}
                    >
                      <span className="sidebar-submenu-icon"><Icon /></span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sidebar-footer">
            {SIDEBAR_FOOTER_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`sidebar-link ${activeTab === item.key ? "sidebar-link-active" : ""}`}
                  onClick={item.onClick}
                >
                  <span className="sidebar-link-main">
                    <span className="sidebar-link-icon"><Icon /></span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </span>
                </button>
              );
            })}
            <div className="sidebar-footnote">
              <span className="sidebar-footnote-dot" />
              <span>University management workspace</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="topbar">
          <h1>Admin Dashboard</h1>
          <div className="admin-profile">Admin</div>
        </div>

        {/* Dashboard Cards */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <FaUsers className="card-icon" />
                <h3>Total Users</h3>
                <p><CountUp end={users.length} duration={2} /></p>
              </div>
              <div className="dashboard-card">
                <FaUserGraduate className="card-icon" />
                <h3>Students</h3>
                <p><CountUp end={users.filter(u => u.role === "student").length} duration={2} /></p>
              </div>
              <div className="dashboard-card">
                <FaUserTie className="card-icon" />
                <h3>Society Managers</h3>
                <p><CountUp end={users.filter(u => u.role === "societyManager").length} duration={2} /></p>
              </div>
            </div>
            <DashboardDownloadAnalytics />
          </>
        )}

        {/* Users Section */}
        {activeTab === "users" && (
          <div className="users-section">
            {/* Tabs */}
            <div className="category-tabs">
              {["student", "societymanager"].map((cat) => (
                <button
                  key={cat}
                  className={userCategory === cat ? "active" : ""}
                  onClick={() => setUserCategory(cat)}
                >
                  {cat === "societymanager" ? "Society Managers" : "Students"}
                </button>
              ))}
            </div>

            {/* Search */}
            <SearchBar
              value={searchQuery[userCategory] || ""}
              onChange={(e) =>
                setSearchQuery({ ...searchQuery, [userCategory]: e.target.value })
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
        {activeTab === "quiz" && <AddQuiz />}
        {activeTab === "quizOverview" && <QuizOverview />}
      </main>
    </div>
  );
}

export default AdminDashboard;
