import React, { useState, useEffect } from 'react';
import './ConsultantBookingManagement.css';

function ConsultantBookingManagement() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [consultantFilter, setConsultantFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const consultants = [
    { id: 1, name: "Dr. Alice Perera", faculty: "FACULTY OF COMPUTING" },
    { id: 2, name: "Prof. Nimal Fernando", faculty: "FACULTY OF ENGINEERING" },
    { id: 3, name: "Dr. Sarah Kumar", faculty: "FACULTY OF BUSINESS" },
    { id: 4, name: "Prof. Kamal Rajapaksa", faculty: "FACULTY OF COMPUTING" }
  ];

  useEffect(() => {
    // Load bookings from localStorage
    const storedBookings = JSON.parse(localStorage.getItem('consultantBookings') || '[]');
    setBookings(storedBookings);
    setLoading(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
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

  const handleStatusChange = (bookingId, newStatus) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: newStatus }
        : booking
    );
    setBookings(updatedBookings);
    localStorage.setItem('consultantBookings', JSON.stringify(updatedBookings));
    alert(`Booking status updated to ${newStatus}`);
  };

  const filteredBookings = bookings.filter(booking => {
    const statusMatch = filter === 'all' || booking.status === filter;
    const consultantMatch = consultantFilter === 'all' || booking.consultantId === parseInt(consultantFilter);
    return statusMatch && consultantMatch;
  });

  const generateSchedulePDF = () => {
    const filteredData = filteredBookings.map(booking => {
      const consultant = consultants.find(c => c.id === booking.consultantId);
      return {
        'Booking ID': booking.id,
        'Consultant': consultant ? consultant.name : 'Unknown',
        'Faculty': consultant ? consultant.faculty : 'Unknown',
        'Date': booking.date,
        'Time': booking.time,
        'Status': getStatusText(booking.status),
        'Student Email': booking.studentEmail,
        'Booking Date': formatDate(booking.bookingDate)
      };
    });

    // Create CSV content (simplified PDF generation)
    const headers = Object.keys(filteredData[0] || {});
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultant_schedule_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length
    };
    return stats;
  };

  const getConsultantStats = () => {
    const stats = {};
    consultants.forEach(consultant => {
      const consultantBookings = bookings.filter(b => b.consultantId === consultant.id);
      stats[consultant.id] = {
        name: consultant.name,
        total: consultantBookings.length,
        confirmed: consultantBookings.filter(b => b.status === 'confirmed').length,
        pending: consultantBookings.filter(b => b.status === 'pending').length,
        cancelled: consultantBookings.filter(b => b.status === 'cancelled').length
      };
    });
    return stats;
  };

  const bookingStats = getBookingStats();
  const consultantStats = getConsultantStats();

  if (loading) {
    return <div className="loading">Loading consultant bookings...</div>;
  }

  return (
    <div className="booking-management-container">
      <div className="management-header">
        <h1>Consultation Booking Management</h1>
        <p>Manage and track consultant booking schedules</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="stats-dashboard">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{bookingStats.total}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{bookingStats.confirmed}</div>
            <div className="stat-label">Confirmed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{bookingStats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{bookingStats.cancelled}</div>
            <div className="stat-label">Cancelled</div>
          </div>
        </div>

        {/* Consultant Statistics */}
        <div className="consultant-stats">
          <h3>Consultant Performance</h3>
          <div className="consultant-grid">
            {Object.values(consultantStats).map(stat => (
              <div key={stat.name} className="consultant-stat-card">
                <h4>{stat.name}</h4>
                <div className="stat-breakdown">
                  <div className="stat-item">
                    <span className="stat-value">{stat.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item confirmed">
                    <span className="stat-value">{stat.confirmed}</span>
                    <span className="stat-label">Confirmed</span>
                  </div>
                  <div className="stat-item pending">
                    <span className="stat-value">{stat.pending}</span>
                    <span className="stat-label">Pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="filters-section">
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Consultant:</label>
            <select value={consultantFilter} onChange={(e) => setConsultantFilter(e.target.value)}>
              <option value="all">All Consultants</option>
              {consultants.map(consultant => (
                <option key={consultant.id} value={consultant.id}>
                  {consultant.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button onClick={generateSchedulePDF} className="download-btn">
          📊 Download Schedule (CSV)
        </button>
      </div>

      {/* Bookings List */}
      <div className="bookings-list">
        <h2>Bookings ({filteredBookings.length})</h2>
        
        {filteredBookings.length > 0 ? (
          <div className="bookings-grid">
            {filteredBookings.map((booking) => {
              const consultant = consultants.find(c => c.id === booking.consultantId);
              return (
                <div key={booking.id} className="booking-card">
                  <div className="booking-header">
                    <div className="consultant-info">
                      <h3>{consultant ? consultant.name : 'Unknown Consultant'}</h3>
                      <span className="faculty">{consultant ? consultant.faculty : 'Unknown'}</span>
                    </div>
                    <div className="booking-meta">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(booking.status) }}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="detail-row">
                      <span className="label">📅 Date:</span>
                      <span className="value">{booking.date}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">⏰ Time:</span>
                      <span className="value">{booking.time}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">👤 Student:</span>
                      <span className="value">{booking.studentEmail}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">📅 Booked:</span>
                      <span className="value">{formatDate(booking.bookingDate)}</span>
                    </div>
                  </div>

                  {/* Status Management */}
                  <div className="status-management">
                    <label>Update Status:</label>
                    <div className="status-actions">
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'pending')}
                        className={`status-btn ${booking.status === 'pending' ? 'active' : ''}`}
                        style={{ backgroundColor: getStatusColor('pending') }}
                      >
                        Pending
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'confirmed')}
                        className={`status-btn ${booking.status === 'confirmed' ? 'active' : ''}`}
                        style={{ backgroundColor: getStatusColor('confirmed') }}
                      >
                        Confirm
                      </button>
                      <button 
                        onClick={() => handleStatusChange(booking.id, 'cancelled')}
                        className={`status-btn ${booking.status === 'cancelled' ? 'active' : ''}`}
                        style={{ backgroundColor: getStatusColor('cancelled') }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>
              {filter === 'all' && consultantFilter === 'all' 
                ? "No consultant bookings have been made yet." 
                : `No bookings match the current filters.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsultantBookingManagement;