import React, { useState, useEffect } from 'react';
import './ComplaintHandling.css';
import BarChartAnalytics from '../BarChartAnalytics/BarChartAnalytics';

function ComplaintHandling() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load complaints from localStorage
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    setComplaints(storedComplaints);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return '#10b981';
      case 'in_progress': return '#f59e0b';
      case 'pending': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'resolved': return 'Resolved';
      case 'in_progress': return 'In Progress';
      case 'pending': return 'Pending';
      default: return 'Unknown';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'lecture_materials': return '📚';
      case 'club_events': return '🎉';
      case 'others': return '📝';
      default: return '📋';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f59e0b';
      case 'medium': return '#3b82f6';
      case 'low': return '#10b981';
      default: return '#6b7280';
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

  const handleStatusChange = (complaintId, newStatus) => {
    const updatedComplaints = complaints.map(complaint =>
      complaint.id === complaintId
        ? { ...complaint, status: newStatus, resolvedDate: newStatus === 'resolved' ? new Date().toISOString() : complaint.resolvedDate || null }
        : complaint
    );
    setComplaints(updatedComplaints);
    localStorage.setItem('complaints', JSON.stringify(updatedComplaints));
    alert(`Complaint status updated to ${newStatus}`);
  };

  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = filter === 'all' || complaint.status === filter;
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    return statusMatch && categoryMatch;
  });

  const generateCSV = () => {
    const filteredData = filteredComplaints.map(complaint => ({
      ID: complaint.id,
      Title: complaint.title,
      Category: complaint.category.replace('_', ' ').toUpperCase(),
      Status: getStatusText(complaint.status),
      Urgency: complaint.urgency.toUpperCase(),
      'Submitted Date': formatDate(complaint.submittedDate),
      'Contact Email': complaint.contactEmail || 'N/A',
      'Contact Phone': complaint.contactPhone || 'N/A',
      Description: complaint.description.substring(0, 100) + '...'
    }));

    if (filteredData.length === 0) {
      alert('No complaints to export.');
      return;
    }

    const headers = Object.keys(filteredData[0]);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCategoryStats = () => {
    return {
      lecture_materials: complaints.filter(c => c.category === 'lecture_materials').length,
      club_events: complaints.filter(c => c.category === 'club_events').length,
      others: complaints.filter(c => c.category === 'others').length
    };
  };

  const getStatusStats = () => {
    return {
      pending: complaints.filter(c => c.status === 'pending').length,
      in_progress: complaints.filter(c => c.status === 'in_progress').length,
      resolved: complaints.filter(c => c.status === 'resolved').length
    };
  };

  const categoryStats = getCategoryStats();
  const statusStats = getStatusStats();
  const totalComplaints = complaints.length;

  if (loading) {
    return <div className="loading">Loading complaints...</div>;
  }

  return (
    <div className="complaint-handling-container">
      <div className="handling-header">
        <h1>Complaint Handling & Management</h1>
        <p>Manage and track student complaints efficiently</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{totalComplaints}</div>
            <div className="stat-label">Total Complaints</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statusStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statusStats.in_progress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{statusStats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
        </div>

        {/* Bar Chart Analytics */}
        <BarChartAnalytics categoryStats={categoryStats} totalComplaints={totalComplaints} />
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select id="status-filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">Category:</label>
            <select id="category-filter" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All Categories</option>
              <option value="lecture_materials">Lecture Materials</option>
              <option value="club_events">Club Events</option>
              <option value="others">Others</option>
            </select>
          </div>
        </div>

        <button onClick={generateCSV} className="download-btn">
          📊 Download Report (CSV)
        </button>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        <h2>Complaints ({filteredComplaints.length})</h2>

        {filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
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
                    {complaint.resolvedDate && (
                      <span className="resolved-date">
                        Resolved: {formatDate(complaint.resolvedDate)}
                      </span>
                    )}
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

                {/* Status Management */}
                <div className="status-management">
                  <label>Update Status:</label>
                  <div className="status-actions">
                    <button
                      onClick={() => handleStatusChange(complaint.id, 'pending')}
                      className={`status-btn ${complaint.status === 'pending' ? 'active' : ''}`}
                      style={{ backgroundColor: getStatusColor('pending') }}
                    >
                      Pending
                    </button>
                    <button
                      onClick={() => handleStatusChange(complaint.id, 'in_progress')}
                      className={`status-btn ${complaint.status === 'in_progress' ? 'active' : ''}`}
                      style={{ backgroundColor: getStatusColor('in_progress') }}
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(complaint.id, 'resolved')}
                      className={`status-btn ${complaint.status === 'resolved' ? 'active' : ''}`}
                      style={{ backgroundColor: getStatusColor('resolved') }}
                    >
                      Resolved
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-complaints">
            <h3>No complaints found</h3>
            <p>
              {filter === 'all' && categoryFilter === 'all'
                ? "No complaints have been submitted yet."
                : "No complaints match the current filters."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ComplaintHandling;
