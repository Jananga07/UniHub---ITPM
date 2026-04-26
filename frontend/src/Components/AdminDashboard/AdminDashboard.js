import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
import "./ResourcesAdmin.css";
import "./UsersManagement.css";
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
  FaBell,
  FaCalendarAlt,
  FaChartPie,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaClipboardList,
  FaClock,
  FaCog,
  FaExclamationTriangle,
  FaFileUpload,
  FaFolderOpen,
  FaGraduationCap,
  FaHome,
  FaLayerGroup,
  FaPlusCircle,
  FaSearch,
  FaSignOutAlt,
  FaStar,
  FaTrashAlt,
  FaUser,
  FaUserGraduate,
  FaUserPlus,
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
import ParticipationChart from "../Quiz/ParticipationChart";

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery2, setSearchQuery2] = useState("");
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
    { key: "resourceFaculty",   label: "Faculties",    icon: FaFolderOpen,  color: "#f59e0b" },
    { key: "resourceModule",    label: "Res. Modules", icon: FaBookOpen,    color: "#06b6d4" },
    { key: "resourceApprovals", label: "Approvals",    icon: FaCheckCircle, color: "#10b981" },
    { key: "resourceUpload",    label: "Upload PDF",   icon: FaFileUpload,  color: "#8b5cf6" },
    { key: "resourceAnalytics", label: "Analytics",    icon: FaChartPie,    color: "#ec4899" },
    { key: "resourceRatings",   label: "Ratings",      icon: FaStar,        color: "#f97316" },
  ];

  const isResourceTabActive = RESOURCE_TABS.some((tab) => tab.key === activeTab);
  const QUIZ_TABS = [
    { key: "quiz",         label: "Add Quiz",      icon: FaPlusCircle, color: "#10b981" },
    { key: "quizOverview", label: "Quiz Overview", icon: FaChartPie,   color: "#6366f1" },
  ];
  const isQuizTabActive = QUIZ_TABS.some((tab) => tab.key === activeTab);

  const SIDEBAR_LINKS = [
    { key: "dashboard",      label: "Dashboard",           icon: FaHome,       color: "#6366f1", onClick: () => setActiveTab("dashboard") },
    { key: "users",          label: "All Users",           icon: FaUsers,      color: "#06b6d4", onClick: () => setActiveTab("users") },
    { key: "societyManager", label: "Add Society Manager", icon: FaUserTie,    color: "#f59e0b", onClick: handleOpenSocietyManagerForm },
    { key: "society",        label: "Add Society",         icon: FaPlusCircle, color: "#10b981", onClick: () => setActiveTab("society") },
  ];

  const SIDEBAR_FOOTER_LINKS = [
    { key: "complaintHandling",  label: "Complaint Handling",  icon: FaClipboardList, color: "#ef4444", onClick: () => setActiveTab("complaintHandling") },
    { key: "consultantBookings", label: "Consultant Bookings", icon: FaCalendarAlt,   color: "#8b5cf6", onClick: () => setActiveTab("consultantBookings") },
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
                    <span className="sidebar-icon-badge" style={{ background: item.color + "22", color: item.color }}>
                      <Icon />
                    </span>
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
                <span className="sidebar-icon-badge" style={{ background: "#f59e0b22", color: "#f59e0b" }}>
                  <FaLayerGroup /></span>
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
                      <span className="sidebar-icon-badge sidebar-icon-badge--sm" style={{ background: t.color + "22", color: t.color }}>
                        <Icon />
                      </span>
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
                <span className="sidebar-icon-badge" style={{ background: "#6366f122", color: "#6366f1" }}>
                  <FaChartPie />
                </span>
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
                      <span className="sidebar-icon-badge sidebar-icon-badge--sm" style={{ background: t.color + "22", color: t.color }}>
                        <Icon />
                      </span>
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            <div className="sidebar-section-label sidebar-section-label-spaced">Support</div>
            {SIDEBAR_FOOTER_LINKS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`sidebar-link ${activeTab === item.key ? "sidebar-link-active" : ""}`}
                  onClick={item.onClick}
                >
                  <span className="sidebar-link-main">
                    <span className="sidebar-icon-badge" style={{ background: item.color + "22", color: item.color }}>
                      <Icon />
                    </span>
                    <span className="sidebar-link-label">{item.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sidebar-footer">
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
          {/* Left — title */}
          <div className="topbar__left">
            <h1 className="topbar__title">Admin Dashboard</h1>
            <p className="topbar__welcome">Welcome back, Admin 👋</p>
          </div>

          {/* Center — search */}
          <div className="topbar__search">
            <FaSearch className="topbar__search-icon" />
            <input
              type="text"
              className="topbar__search-input"
              placeholder="Search students, societies, quizzes..."
              value={searchQuery2}
              onChange={(e) => setSearchQuery2(e.target.value)}
            />
          </div>

          {/* Right — actions */}
          <div className="topbar__right">
            {/* Notification bell */}
            <button className="topbar__icon-btn" title="Notifications">
              <FaBell />
              <span className="topbar__notif-badge">3</span>
            </button>

            {/* Profile dropdown */}
            <div className="topbar__profile-wrap">
              <button
                className="topbar__profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="topbar__avatar">A</div>
                <div className="topbar__profile-info">
                  <span className="topbar__profile-name">Admin</span>
                  <span className="topbar__profile-role">System Administrator</span>
                </div>
                <FaChevronDown className={`topbar__chevron ${showProfileMenu ? "topbar__chevron--open" : ""}`} />
              </button>

              {showProfileMenu && (
                <div className="topbar__dropdown">
                  <div className="topbar__dropdown-header">
                    <div className="topbar__dropdown-avatar">A</div>
                    <div>
                      <p className="topbar__dropdown-name">Admin</p>
                      <span className="topbar__dropdown-badge">System Administrator</span>
                    </div>
                  </div>
                  <div className="topbar__dropdown-divider" />
                  <button className="topbar__dropdown-item">
                    <FaUser /> My Profile
                  </button>
                  <button className="topbar__dropdown-item">
                    <FaCog /> Settings
                  </button>
                  <div className="topbar__dropdown-divider" />
                  <button
                    className="topbar__dropdown-item topbar__dropdown-item--danger"
                    onClick={() => { localStorage.removeItem("user"); window.location.href = "/"; }}
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dashboard Cards */}
        {activeTab === "dashboard" && (
          <>
            <div className="dashboard-grid">
              {/* Total Users */}
              <div className="kpi-card kpi-card--indigo">
                <div className="kpi-card__top-bar" />
                <div className="kpi-card__inner">
                  <div className="kpi-card__icon-wrap kpi-icon--indigo">
                    <FaUsers />
                  </div>
                  <div className="kpi-card__body">
                    <span className="kpi-card__label">Total Users</span>
                    <span className="kpi-card__num">
                      <CountUp end={users.length} duration={2} />
                    </span>
                    <span className="kpi-card__trend kpi-trend--up">
                      <span className="kpi-trend__arrow">↑</span> +5 this week
                    </span>
                  </div>
                </div>
              </div>

              {/* Students */}
              <div className="kpi-card kpi-card--cyan">
                <div className="kpi-card__top-bar" />
                <div className="kpi-card__inner">
                  <div className="kpi-card__icon-wrap kpi-icon--cyan">
                    <FaUserGraduate />
                  </div>
                  <div className="kpi-card__body">
                    <span className="kpi-card__label">Students</span>
                    <span className="kpi-card__num">
                      <CountUp end={users.filter(u => u.role === "student").length} duration={2} />
                    </span>
                    <span className="kpi-card__trend kpi-trend--up">
                      <span className="kpi-trend__arrow">↑</span> +2 today
                    </span>
                  </div>
                </div>
              </div>

              {/* Society Managers */}
              <div className="kpi-card kpi-card--emerald">
                <div className="kpi-card__top-bar" />
                <div className="kpi-card__inner">
                  <div className="kpi-card__icon-wrap kpi-icon--emerald">
                    <FaUserTie />
                  </div>
                  <div className="kpi-card__body">
                    <span className="kpi-card__label">Society Managers</span>
                    <span className="kpi-card__num">
                      <CountUp end={users.filter(u => u.role === "societyManager").length} duration={2} />
                    </span>
                    <span className="kpi-card__trend kpi-trend--up">
                      <span className="kpi-trend__arrow">↑</span> +1 this month
                    </span>
                  </div>
                </div>
              </div>

              {/* Active Societies */}
              <div className="kpi-card kpi-card--amber">
                <div className="kpi-card__top-bar" />
                <div className="kpi-card__inner">
                  <div className="kpi-card__icon-wrap kpi-icon--amber">
                    <FaPlusCircle />
                  </div>
                  <div className="kpi-card__body">
                    <span className="kpi-card__label">Active Societies</span>
                    <span className="kpi-card__num">
                      <CountUp end={societies.length} duration={2} />
                    </span>
                    <span className="kpi-card__trend kpi-trend--up">
                      <span className="kpi-trend__arrow">↑</span> +8 this month
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-charts-row">
              <div className="dashboard-chart-card">
                <DashboardDownloadAnalytics />
              </div>
              <div className="dashboard-chart-card">
                <ParticipationChart />
              </div>
            </div>

            {/* ── Info Cards Row ── */}
            <div className="dash-info-row">

              {/* Recent Activities */}
              <div className="dash-info-card">
                <div className="dash-info-card__header">
                  <div className="dash-info-card__icon-wrap" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                    <FaBell />
                  </div>
                  <div>
                    <h3 className="dash-info-card__title">Recent Activities</h3>
                    <p className="dash-info-card__sub">Latest system actions</p>
                  </div>
                </div>
                <ul className="dash-activity-list">
                  {[
                    { icon: <FaUserPlus />,    color: "#4f46e5", text: "New student registered",    time: "2 min ago" },
                    { icon: <FaUserTie />,     color: "#f59e0b", text: "Society manager added",     time: "18 min ago" },
                    { icon: <FaPlusCircle />,  color: "#10b981", text: "Quiz created for CS201",    time: "1 hr ago" },
                    { icon: <FaFileUpload />,  color: "#06b6d4", text: "Resource uploaded",         time: "3 hr ago" },
                    { icon: <FaCheckCircle />, color: "#10b981", text: "Complaint resolved",        time: "5 hr ago" },
                  ].map((a, i) => (
                    <li key={i} className="dash-activity-item">
                      <span className="dash-activity-icon" style={{ background: a.color + "18", color: a.color }}>
                        {a.icon}
                      </span>
                      <span className="dash-activity-text">{a.text}</span>
                      <span className="dash-activity-time">{a.time}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Latest Complaints */}
              <div className="dash-info-card">
                <div className="dash-info-card__header">
                  <div className="dash-info-card__icon-wrap" style={{ background: "#fef2f2", color: "#ef4444" }}>
                    <FaExclamationTriangle />
                  </div>
                  <div>
                    <h3 className="dash-info-card__title">Latest Complaints</h3>
                    <p className="dash-info-card__sub">Recent student submissions</p>
                  </div>
                </div>
                <ul className="dash-complaint-list">
                  {[
                    { name: "Amal Perera",    category: "Lecture Materials", time: "10 min ago", status: "pending" },
                    { name: "Nimal Silva",    category: "Club Events",       time: "1 hr ago",   status: "in_review" },
                    { name: "Kasun Fernando", category: "Others",            time: "2 hr ago",   status: "resolved" },
                    { name: "Dilani Jayawardena", category: "Lecture Materials", time: "4 hr ago", status: "pending" },
                    { name: "Ruwan Bandara", category: "Club Events",        time: "6 hr ago",   status: "resolved" },
                  ].map((c, i) => (
                    <li key={i} className="dash-complaint-item">
                      <div className="dash-complaint-info">
                        <span className="dash-complaint-name">{c.name}</span>
                        <span className="dash-complaint-cat">{c.category}</span>
                      </div>
                      <div className="dash-complaint-right">
                        <span className={`dash-status-badge dash-status--${c.status}`}>
                          {c.status === "in_review" ? "In Review" : c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                        </span>
                        <span className="dash-activity-time">{c.time}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Upcoming Sessions */}
              <div className="dash-info-card">
                <div className="dash-info-card__header">
                  <div className="dash-info-card__icon-wrap" style={{ background: "#ecfdf5", color: "#10b981" }}>
                    <FaCalendarAlt />
                  </div>
                  <div>
                    <h3 className="dash-info-card__title">Upcoming Sessions</h3>
                    <p className="dash-info-card__sub">Consultant appointments</p>
                  </div>
                </div>
                <ul className="dash-session-list">
                  {[
                    { student: "Amal Perera",    consultant: "Dr. Aruna Bandara",    date: "Today",    time: "10:00 AM" },
                    { student: "Nimal Silva",    consultant: "Prof. Nimal Fernando", date: "Today",    time: "2:30 PM"  },
                    { student: "Kasun Fernando", consultant: "Dr. Kanishka S.",      date: "Tomorrow", time: "9:00 AM"  },
                    { student: "Dilani J.",      consultant: "Prof. Kamal R.",       date: "Tomorrow", time: "11:00 AM" },
                    { student: "Ruwan Bandara",  consultant: "Dr. Saman Kumara",     date: "26 Apr",   time: "3:00 PM"  },
                  ].map((s, i) => (
                    <li key={i} className="dash-session-item">
                      <div className="dash-session-info">
                        <span className="dash-session-student">{s.student}</span>
                        <span className="dash-session-consultant">with {s.consultant}</span>
                      </div>
                      <div className="dash-session-time">
                        <span className="dash-session-date">
                          <FaCalendarAlt style={{ fontSize: 10, marginRight: 3 }} />{s.date}
                        </span>
                        <span className="dash-session-clock">
                          <FaClock style={{ fontSize: 10, marginRight: 3 }} />{s.time}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </>
        )}

        {/* ── Users Management Section ── */}
        {activeTab === "users" && (
          <UsersManagementPanel
            users={users}
            societies={societies}
            userCategory={userCategory}
            setUserCategory={setUserCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleDelete={handleDelete}
          />
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

/* ═══════════════════════════════════════════════════════════════
   USERS MANAGEMENT PANEL — Premium SaaS Data Table
═══════════════════════════════════════════════════════════════ */
const PAGE_SIZE = 8;

function UsersManagementPanel({ users, societies, userCategory, setUserCategory, searchQuery, setSearchQuery, handleDelete }) {
  const navigate = useNavigate();
  const [viewUser, setViewUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");

  const students = users.filter(u => u.role?.trim().toLowerCase() === "student");
  const managers = users.filter(u => u.role?.trim().toLowerCase() === "societymanager");
  const activeList = userCategory === "student" ? students : managers;
  const q = searchQuery[userCategory]?.toLowerCase() || "";

  const filtered = activeList.filter(u =>
    u.name?.toLowerCase().includes(q) ||
    u.gmail?.toLowerCase().includes(q) ||
    u.contact?.toLowerCase().includes(q)
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = (a[sortField] || "").toString().toLowerCase();
    const bv = (b[sortField] || "").toString().toLowerCase();
    return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const allSelected = paginated.length > 0 && paginated.every(u => selectedIds.includes(u._id));

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleAll = () => {
    const ids = paginated.map(u => u._id);
    setSelectedIds(prev => allSelected ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])]);
  };

  const toggleOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const handleBulkDelete = () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Delete ${selectedIds.length} selected user(s)?`)) return;
    selectedIds.forEach(id => handleDelete(id));
    setSelectedIds([]);
  };

  const exportCSV = () => {
    const rows = [["Name","Email","Age","Address","Contact","Role"]];
    filtered.forEach(u => rows.push([u.name, u.gmail, u.age||"", u.address||"", u.contact||"", u.role]));
    const csv = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `${userCategory}_users.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const getSocietyName = (societyId) => {
    const s = societies.find(s => s._id === societyId);
    return s?.societyName || s?.name || "—";
  };

  const SortIcon = ({ field }) => (
    <span className="um-sort-icon">
      {sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : " ↕"}
    </span>
  );

  // Reset page on tab/search change
  useEffect(() => { setCurrentPage(1); setSelectedIds([]); }, [userCategory, q]);

  return (
    <div className="um-shell">

      {/* ── Page Header ── */}
      <div className="um-page-header">
        <div className="um-page-header-left">
          <span className="um-eyebrow">Administration</span>
          <h2 className="um-title">All Users Management</h2>
          <p className="um-subtitle">Manage students and society managers across the platform</p>
        </div>
        <div className="um-page-header-right">
          <button className="um-btn um-btn--outline" onClick={exportCSV}>
            <FaFileUpload /> Export CSV
          </button>
          <button className="um-btn um-btn--primary" onClick={() => navigate("/register")}>
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="um-stats-row">
        <div className="um-stat-card um-stat--blue">
          <div className="um-stat-icon um-stat-icon--blue"><FaUsers /></div>
          <div className="um-stat-body">
            <span className="um-stat-label">Total Users</span>
            <span className="um-stat-value">{users.length}</span>
          </div>
        </div>
        <div className="um-stat-card um-stat--cyan">
          <div className="um-stat-icon um-stat-icon--cyan"><FaUserGraduate /></div>
          <div className="um-stat-body">
            <span className="um-stat-label">Students</span>
            <span className="um-stat-value">{students.length}</span>
          </div>
        </div>
        <div className="um-stat-card um-stat--purple">
          <div className="um-stat-icon um-stat-icon--purple"><FaUserTie /></div>
          <div className="um-stat-body">
            <span className="um-stat-label">Managers</span>
            <span className="um-stat-value">{managers.length}</span>
          </div>
        </div>
        <div className="um-stat-card um-stat--green">
          <div className="um-stat-icon um-stat-icon--green"><FaCheckCircle /></div>
          <div className="um-stat-body">
            <span className="um-stat-label">New This Week</span>
            <span className="um-stat-value">+{Math.min(users.length, 5)}</span>
          </div>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="um-table-card">

        {/* Toolbar */}
        <div className="um-toolbar">
          <div className="um-tabs">
            <button
              className={`um-tab ${userCategory === "student" ? "um-tab--active" : ""}`}
              onClick={() => setUserCategory("student")}
            >
              <FaUserGraduate /> Students
              <span className="um-tab-count">{students.length}</span>
            </button>
            <button
              className={`um-tab ${userCategory === "societymanager" ? "um-tab--active" : ""}`}
              onClick={() => setUserCategory("societymanager")}
            >
              <FaUserTie /> Society Managers
              <span className="um-tab-count">{managers.length}</span>
            </button>
          </div>

          <div className="um-toolbar-right">
            {selectedIds.length > 0 && (
              <button className="um-btn um-btn--danger-sm" onClick={handleBulkDelete}>
                <FaTrashAlt /> Delete ({selectedIds.length})
              </button>
            )}
            <div className="um-search-wrap">
              <FaSearch className="um-search-icon" />
              <input
                className="um-search-input"
                type="text"
                placeholder={`Search ${userCategory === "student" ? "students" : "managers"}…`}
                value={searchQuery[userCategory] || ""}
                onChange={e => setSearchQuery({ ...searchQuery, [userCategory]: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="um-table-wrap">
          <table className="um-table">
            <thead>
              <tr>
                <th className="um-th-check">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="um-th-sortable" onClick={() => toggleSort("name")}>
                  User <SortIcon field="name" />
                </th>
                <th className="um-th-sortable" onClick={() => toggleSort("gmail")}>
                  Email <SortIcon field="gmail" />
                </th>
                <th>Contact</th>
                {userCategory === "student" ? <th>Age / Address</th> : <th>Assigned Society</th>}
                <th>Status</th>
                <th className="um-th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="um-empty-row">
                    <div className="um-empty-state">
                      <FaUsers className="um-empty-icon" />
                      <p>No {userCategory === "student" ? "students" : "managers"} found</p>
                    </div>
                  </td>
                </tr>
              ) : paginated.map((u, idx) => (
                <tr key={u._id} className={`um-row ${selectedIds.includes(u._id) ? "um-row--selected" : ""} ${idx % 2 === 1 ? "um-row--alt" : ""}`}>
                  <td className="um-td-check">
                    <input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleOne(u._id)} />
                  </td>
                  <td>
                    <div className="um-user-cell">
                      <div className={`um-avatar ${userCategory === "student" ? "um-avatar--blue" : "um-avatar--purple"}`}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="um-user-info">
                        <span className="um-user-name">{u.name}</span>
                        <span className="um-user-role">{userCategory === "student" ? "Student" : "Society Manager"}</span>
                      </div>
                    </div>
                  </td>
                  <td className="um-email-cell">{u.gmail}</td>
                  <td className="um-contact-cell">{u.contact || "—"}</td>
                  <td className="um-detail-cell">
                    {userCategory === "student"
                      ? <span>{u.age ? `Age ${u.age}` : "—"}{u.address ? ` · ${u.address}` : ""}</span>
                      : <span className="um-society-tag">{getSocietyName(u.societyId)}</span>
                    }
                  </td>
                  <td>
                    <span className="um-status-badge um-status--active">Active</span>
                  </td>
                  <td className="um-actions-cell">
                    <button
                      className="um-action-btn um-action-btn--view"
                      title="View profile"
                      onClick={() => setViewUser(u)}
                    >
                      <FaUser />
                    </button>
                    <button
                      className="um-action-btn um-action-btn--delete"
                      title="Delete user"
                      onClick={() => handleDelete(u._id)}
                    >
                      <FaTrashAlt />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="um-pagination">
          <span className="um-pagination-info">
            Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, sorted.length)}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="um-pagination-btns">
            <button className="um-page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} className={`um-page-btn ${p === currentPage ? "um-page-btn--active" : ""}`} onClick={() => setCurrentPage(p)}>{p}</button>
            ))}
            <button className="um-page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</button>
          </div>
        </div>
      </div>

      {/* ── View User Modal ── */}
      {viewUser && (
        <div className="um-modal-overlay" onClick={() => setViewUser(null)}>
          <div className="um-modal" onClick={e => e.stopPropagation()}>
            <button className="um-modal-close" onClick={() => setViewUser(null)}>✕</button>
            <div className={`um-modal-avatar ${viewUser.role === "student" ? "um-avatar--blue" : "um-avatar--purple"}`}>
              {viewUser.name?.charAt(0).toUpperCase()}
            </div>
            <h3 className="um-modal-name">{viewUser.name}</h3>
            <span className="um-modal-role-badge">{viewUser.role === "student" ? "Student" : "Society Manager"}</span>
            <dl className="um-modal-meta">
              <div><dt>Email</dt><dd>{viewUser.gmail}</dd></div>
              <div><dt>Age</dt><dd>{viewUser.age || "—"}</dd></div>
              <div><dt>Contact</dt><dd>{viewUser.contact || "—"}</dd></div>
              <div><dt>Address</dt><dd>{viewUser.address || "—"}</dd></div>
              {viewUser.role !== "student" && (
                <div><dt>Society</dt><dd>{getSocietyName(viewUser.societyId)}</dd></div>
              )}
            </dl>
            <div className="um-modal-actions">
              <button className="um-btn um-btn--danger-sm" onClick={() => { handleDelete(viewUser._id); setViewUser(null); }}>
                <FaTrashAlt /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;

