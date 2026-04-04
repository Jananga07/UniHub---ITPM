import React, { useState, useEffect } from 'react';
import './ComplaintHandling.css';
import BarChartAnalytics from '../BarChartAnalytics/BarChartAnalytics';

const defaultComplaints = [
  {
    id: 'C-1001',
    title: 'Lecture slides missing key diagrams',
    description: 'The latest engineering lecture slides are missing important circuit diagrams that were referenced during class.',
    category: 'lecture_materials',
    urgency: 'high',
    status: 'pending',
    submittedDate: '2026-03-12T10:20:00Z',
    contactEmail: 'student1@unihub.edu',
    contactPhone: '0712345678'
  },
  {
    id: 'C-1002',
    title: 'Club event announcement delayed',
    description: 'The club event details were posted late and many students missed the registration deadline.',
    category: 'club_events',
    urgency: 'medium',
    status: 'in_progress',
    submittedDate: '2026-03-15T08:45:00Z',
    contactEmail: 'student2@unihub.edu',
    contactPhone: '0723456789'
  },
  {
    id: 'C-1003',
    title: 'Project rubric not shared on time',
    description: 'The project rubric was not uploaded before the project launch, causing confusion about grading criteria.',
    category: 'lecture_materials',
    urgency: 'urgent',
    status: 'pending',
    submittedDate: '2026-03-17T14:30:00Z',
    contactEmail: 'student3@unihub.edu',
    contactPhone: '0734567890'
  },
  {
    id: 'C-1004',
    title: 'Club meeting room double-booked',
    description: 'The planning committee booked the room for the same time as another society meeting.',
    category: 'club_events',
    urgency: 'high',
    status: 'resolved',
    submittedDate: '2026-03-20T12:10:00Z',
    resolvedDate: '2026-03-22T09:00:00Z',
    contactEmail: 'student4@unihub.edu',
    contactPhone: '0745678901'
  },
  {
    id: 'C-1005',
    title: 'Library access request issue',
    description: 'My library access card is not allowing entry despite active membership.',
    category: 'others',
    urgency: 'medium',
    status: 'pending',
    submittedDate: '2026-03-21T09:50:00Z',
    contactEmail: 'student5@unihub.edu',
    contactPhone: '0756789012'
  },
  {
    id: 'C-1006',
    title: 'Lecture recording audio low quality',
    description: 'The recorded lecture audio is too quiet and difficult to follow for review sessions.',
    category: 'lecture_materials',
    urgency: 'high',
    status: 'in_progress',
    submittedDate: '2026-03-22T11:15:00Z',
    contactEmail: 'student6@unihub.edu',
    contactPhone: '0767890123'
  },
  {
    id: 'C-1007',
    title: 'Campus event poster missing date',
    description: 'The campus festival poster did not include the event date, causing confusion among attendees.',
    category: 'club_events',
    urgency: 'low',
    status: 'pending',
    submittedDate: '2026-03-23T16:40:00Z',
    contactEmail: 'student7@unihub.edu',
    contactPhone: '0778901234'
  },
  {
    id: 'C-1008',
    title: 'Course portal login resets repeatedly',
    description: 'The course portal is logging me out every time I submit the assignment form.',
    category: 'lecture_materials',
    urgency: 'urgent',
    status: 'resolved',
    submittedDate: '2026-03-24T10:05:00Z',
    resolvedDate: '2026-03-25T08:20:00Z',
    contactEmail: 'student8@unihub.edu',
    contactPhone: '0789012345'
  },
  {
    id: 'C-1009',
    title: 'Request for more society funding details',
    description: 'The funding procedure for society events was unclear and needs clearer documentation.',
    category: 'club_events',
    urgency: 'medium',
    status: 'in_progress',
    submittedDate: '2026-03-25T14:55:00Z',
    contactEmail: 'student9@unihub.edu',
    contactPhone: '0790123456'
  },
  {
    id: 'C-1010',
    title: 'Sidewalk maintenance request near campus gates',
    description: 'There are cracked sidewalks near the main gate that create a safety hazard in wet weather.',
    category: 'others',
    urgency: 'high',
    status: 'pending',
    submittedDate: '2026-03-26T13:10:00Z',
    contactEmail: 'student10@unihub.edu',
    contactPhone: '0701234567'
  }
];

function ComplaintHandling() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const storedComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
    if (storedComplaints.length === 0) {
      localStorage.setItem('complaints', JSON.stringify(defaultComplaints));
      setComplaints(defaultComplaints);
    } else {
      setComplaints(storedComplaints);
    }
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
    setStatusMessage(`Complaint marked ${getStatusText(newStatus)} successfully.`);

    setTimeout(() => {
      setStatusMessage('');
    }, 2800);
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
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `complaints_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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

      {statusMessage && <div className="status-message">{statusMessage}</div>}

      {/* Complaints List */}
      <div className="complaints-list">
        <h2>Complaints ({filteredComplaints.length})</h2>

        {filteredComplaints.length > 0 ? (
          <div className="complaints-grid">
            {filteredComplaints.map((complaint, index) => (
              <div
                key={complaint.id}
                className="complaint-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
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
                  <span className="status-update-label">Update Status:</span>
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