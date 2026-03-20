import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ConsultantBooking.css';

function ConsultantBooking() {
  const { consultantId } = useParams();
  const navigate = useNavigate();
  
  const [consultant, setConsultant] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [loading, setLoading] = useState(true);

  const consultants = [
    {
      id: 1,
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu",
      rating: 4.5,
      totalBookings: 45
    },
    {
      id: 2,
      name: "Prof. Nimal Fernando",
      title: "Senior Consultant",
      faculty: "FACULTY OF ENGINEERING",
      expertise: "PhD in Software Engineering Specialist in Machine Learning and AI",
      room: "Room EN-305",
      email: "nimal.fernando@university.edu",
      rating: 4.8,
      totalBookings: 62
    },
    {
      id: 3,
      name: "Dr. Sarah Kumar",
      title: "Consultation",
      faculty: "FACULTY OF BUSINESS",
      expertise: "PhD in Business Administration Specialist in Marketing and Management",
      room: "Room BU-102",
      email: "sarah.kumar@university.edu",
      rating: 4.2,
      totalBookings: 38
    },
    {
      id: 4,
      name: "Prof. Kamal Rajapaksa",
      title: "Senior Consultant",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Data Science Specialist in Big Data Analytics",
      room: "Room CS-401",
      email: "kamal.r@university.edu",
      rating: 4.9,
      totalBookings: 71
    }
  ];

  useEffect(() => {
    // Find consultant by ID
    const foundConsultant = consultants.find(c => c.id === parseInt(consultantId));
    setConsultant(foundConsultant);
    
    // Generate available dates for the next 14 days (excluding weekends)
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }
    
    setAvailableDates(dates);
    setLoading(false);
  }, [consultantId]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    navigate(`/consultant-time/${consultantId}/${date}`);
  };

  const handleBack = () => {
    navigate('/studentsupport');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star full">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }
    
    return stars;
  };

  if (loading) {
    return <div className="loading">Loading consultant information...</div>;
  }

  if (!consultant) {
    return <div className="error">Consultant not found</div>;
  }

  return (
    <div className="consultant-booking-container">
      <div className="booking-header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Student Support
        </button>
        <h1>Book Consultation</h1>
      </div>

      <div className="consultant-info-card">
        <div className="consultant-header">
          <div className="consultant-basic">
            <h2>{consultant.name}</h2>
            <span className="consultant-title">{consultant.title}</span>
            <div className="rating">
              {renderStars(consultant.rating)}
              <span className="rating-text">({consultant.rating})</span>
            </div>
          </div>
          <div className="consultant-stats">
            <div className="stat-item">
              <span className="stat-number">{consultant.totalBookings}</span>
              <span className="stat-label">Total Bookings</span>
            </div>
          </div>
        </div>
        
        <div className="consultant-details">
          <div className="faculty">{consultant.faculty}</div>
          <div className="expertise">{consultant.expertise}</div>
          <div className="room">📍 {consultant.room}</div>
          <div className="email">📧 {consultant.email}</div>
        </div>
      </div>

      <div className="date-selection">
        <h3>Select Available Date</h3>
        <p>Choose a date for your consultation. Weekends are not available.</p>
        
        <div className="dates-grid">
          {availableDates.map((date) => {
            const dateObj = new Date(date);
            const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNumber = dateObj.getDate();
            const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });
            
            return (
              <button
                key={date}
                onClick={() => handleDateSelect(date)}
                className={`date-card ${selectedDate === date ? 'selected' : ''}`}
              >
                <div className="date-day">{dayName}</div>
                <div className="date-number">{dayNumber}</div>
                <div className="date-month">{monthName}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="booking-info">
        <div className="info-card">
          <h4>📅 Booking Information</h4>
          <ul>
            <li>Consultations are available Monday to Friday</li>
            <li>Each session lasts 30 minutes</li>
            <li>Please arrive 5 minutes before your scheduled time</li>
            <li>Cancellations must be made at least 2 hours in advance</li>
            <li>You will receive a confirmation email after booking</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConsultantBooking;
