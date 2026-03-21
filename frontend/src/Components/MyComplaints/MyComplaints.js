import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Navigation/Navigation';
import './MyComplaints.css';

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    // Load complaints from localStorage
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(storedComplaints);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#10b981';
      case 'in_progress':
        return '#f59e0b';
      case 'pending':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved':
        return 'Resolved';
      case 'in_progress':
        return 'In Progress';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'lecture_materials':
        return '📚';
      case 'club_events':
        return '🎉';
      case 'others':
        return '📝';
      default:
        return '📋';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f59e0b';
      case 'medium':
        return '#3b82f6';
      case 'low':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (filter === 'all') return true;
    return complaint.status === filter;
  });

  const handleNewComplaint = () => {
    navigate('/complaint-form');
  };

  const handleBack = () => {
    navigate('/studentsupport');
  };

  return (
    <div className="my-complaints-container">
      <Navigation />
      <div className="complaints-header">
        <h1>My Complaints</h1>
        <p>Track the status of your submitted complaints</p>
        
        <div className="header-actions">
          <button onClick={handleBack} className="back-btn">
            ← Back to Student Support
          </button>
          <button onClick={handleNewComplaint} className="new-complaint-btn">
            + New Complaint
          </button>
        </div>
      </div>

      <div className="filter-section">
        <label htmlFor="status-filter">Filter by Status:</label>
        <select
          id="status-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="status-filter"
        >
          <option value="all">All Complaints</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="complaints-stats">
        <div className="stat-card">
          <div className="stat-number">{complaints.length}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{complaints.filter(c => c.status === 'pending').length}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{complaints.filter(c => c.status === 'in_progress').length}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{complaints.filter(c => c.status === 'resolved').length}</div>
          <div className="stat-label">Resolved</div>
        </div>
      </div>

      {filteredComplaints.length > 0 ? (
        <div className="complaints-list">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="complaint-header">
                <div className="complaint-title-section">
                  <span className="category-icon">{getCategoryIcon(complaint.category)}</span>
                  <h3 className="complaint-title">{complaint.title}</h3>
                </div>
                <div className="complaint-meta">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(complaint.status) }}
                  >
                    {getStatusText(complaint.status)}
                  </span>
                  <span 
                    className="urgency-badge"
                    style={{ color: getUrgencyColor(complaint.urgency) }}
                  >
                    {complaint.urgency.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="complaint-description">
                <p>{complaint.description}</p>
              </div>
              
              <div className="complaint-footer">
                <div className="complaint-info">
                  <span className="category">
                    Category: {complaint.category.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="submission-date">
                    Submitted: {formatDate(complaint.submittedDate)}
                  </span>
                </div>
                
                {(complaint.contactEmail || complaint.contactPhone) && (
                  <div className="contact-info">
                    {complaint.contactEmail && (
                      <span className="contact-item">📧 {complaint.contactEmail}</span>
                    )}
                    {complaint.contactPhone && (
                      <span className="contact-item">📞 {complaint.contactPhone}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-complaints">
          <div className="no-complaints-icon">📋</div>
          <h3>No complaints found</h3>
          <p>
            {filter === 'all' 
              ? "You haven't submitted any complaints yet." 
              : `No complaints with status "${filter}" found.`
            }
          </p>
          <button onClick={handleNewComplaint} className="submit-first-complaint-btn">
            Submit Your First Complaint
          </button>
        </div>
      )}
    </div>
  );
}

export default MyComplaints;
