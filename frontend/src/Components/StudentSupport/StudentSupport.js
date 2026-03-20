import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../HomeNav/HomeNav';
import './StudentSupport.css';

function StudentSupport() {
  const lecturers = [
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

  const handleWhatsAppClick = () => {
    const phoneNumber = '94705645369';
    const message = encodeURIComponent('Hello, I need assistance from UniHub support.');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
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

  const topConsultants = [...lecturers].sort((a, b) => b.rating - a.rating).slice(0, 2);

  return (
    <div className="student-support-container">
      <Navigation />
      <h1 className="page-title">Student Support System</h1>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="whatsapp-btn" onClick={handleWhatsAppClick}>
          <span className="whatsapp-icon">💬</span>
          Contact via WhatsApp
        </button>
        <Link to="/complaint-form">
          <button className="complaint-btn">
            <span className="complaint-icon">📝</span>
            File a Complaint
          </button>
        </Link>
        <Link to="/my-complaints">
          <button className="my-complaints-btn">
            <span className="my-complaints-icon">📋</span>
            My Complaints
          </button>
        </Link>
        <Link to="/consultant-rating">
          <button className="rating-btn">
            <span className="rating-icon">⭐</span>
            Rate Consultants
          </button>
        </Link>
      </div>

      {/* Top Consultants */}
      <div className="top-consultants">
        <h2>🏆 Top Rated Consultants</h2>
        <div className="top-consultants-grid">
          {topConsultants.map((consultant, index) => (
            <div key={consultant.id} className="top-consultant-card">
              <div className="rank-badge">#{index + 1}</div>
              <h3>{consultant.name}</h3>
              <div className="rating">
                {renderStars(consultant.rating)}
                <span className="rating-text">({consultant.rating})</span>
              </div>
              <p className="expertise">{consultant.expertise.substring(0, 50)}...</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="consultation-booking">
        <h2>Consultation Booking</h2>
        <p className="booking-description">
          Available lecturers for consultation are loaded from the backend. Example data is shown as a fallback.
        </p>
        
        <div className="lecturers-grid">
          {lecturers.map((lecturer) => (
            <div key={lecturer.id} className="lecturer-card">
              <div className="lecturer-header">
                <h3>{lecturer.name}</h3>
                <span className="lecturer-title">{lecturer.title}</span>
                <div className="rating">
                  {renderStars(lecturer.rating)}
                  <span className="rating-text">({lecturer.rating})</span>
                </div>
              </div>
              
              <div className="lecturer-details">
                <div className="faculty">{lecturer.faculty}</div>
                <div className="expertise">{lecturer.expertise}</div>
                <div className="room">{lecturer.room}</div>
                <div className="email">{lecturer.email}</div>
                <div className="bookings-info">{lecturer.totalBookings} bookings</div>
              </div>
              
              <div className="lecturer-actions">
                <Link to={`/consultant-booking/${lecturer.id}`}>
                  <button className="book-btn">Book Consultation</button>
                </Link>
                <Link to="/consultant-rating">
                  <button className="rate-btn">Rate Consultant</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentSupport;
