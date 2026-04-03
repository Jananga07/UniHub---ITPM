import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navigation from '../HomeNav/HomeNav';
import './StudentSupport.css';

function StudentSupport() {
  // Get logged-in user from localStorage (set after login)
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?._id;   // MongoDB _id

  const [showRatingModal, setShowRatingModal] = useState(false);
  const [lecturers, setLecturers] = useState([
    {
      id: 1,
      name: "Dr. Aruna Bandara",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "aruna.bandara@university.edu",
      averageRating: 4.5,
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
      averageRating: 4.8,
      totalBookings: 62
    },
    {
      id: 3,
      name: "Dr. Kanishka Senanayake",
      title: "Consultation",
      faculty: "FACULTY OF BUSINESS",
      expertise: "PhD in Business Administration Specialist in Marketing and Management",
      room: "Room BU-102",
      email: "kanishka.senanayake@university.edu",
      averageRating: 4.2,
      totalBookings: 38
    },
    {
      id: 4,
      name: "Prof. Kamal Rajapaksa",
      title: "Senior Consultant",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Data Science Specialist in Big Data Analytics",
      room: "Room CS-401",
      email: "kamal.rajapaksa@university.edu",
      averageRating: 4.9,
      totalBookings: 71
    },
    {
      id: 5,
      name: "Dr. Saman Kumara",
      title: "Assistant Consultant",
      faculty: "FACULTY OF ENGINEERING",
      expertise: "MSc in Civil Engineering Specialist in Structural Dynamics",
      room: "Room EN-104",
      email: "saman.kumara@university.edu",
      averageRating: 4.0,
      totalBookings: 21
    },
    {
      id: 6,
      name: "Prof. Anura Dissanayake",
      title: "Senior Consultant",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Information Systems Specialist in Cloud Computing",
      room: "Room CS-305",
      email: "anura.dissanayake@university.edu",
      averageRating: 4.7,
      totalBookings: 55
    }
  ]);
  const [topConsultants, setTopConsultants] = useState([]);

  const fetchAllAndTop = () => {
    // Fetch all lecturers
    axios.get('http://localhost:5001/studentsupport')
      .then(res => {
        if (res.data.lecturers && res.data.lecturers.length > 0) {
          setLecturers(res.data.lecturers);
        }
      })
      .catch(err => console.error("Using fallback for lecturers."));

    // Fetch top consultants specifically
    axios.get('http://localhost:5001/api/consultants/top')
      .then(res => {
        if (res.data.topConsultants && res.data.topConsultants.length > 0) {
          setTopConsultants(res.data.topConsultants);
        }
      })
      .catch(err => {
         setTopConsultants([...lecturers].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3));
      });
  };

  useEffect(() => {
    fetchAllAndTop();
  }, []);

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

  const renderInteractiveStars = (consultant) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star empty interactive`}
          onClick={() => handleInlineRate(consultant, i)}
          style={{ cursor: 'pointer', fontSize: '24px', marginRight: '5px' }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const handleInlineRate = async (consultant, starValue) => {
    try {
      const ratingData = {
        consultantId: consultant._id || consultant.id,
        consultantName: consultant.name,
        rating: starValue,
        feedback: '',
        studentEmail: user?.email || 'student@example.com',
        studentName: user?.username || 'Student'
      };

      if (typeof consultant._id === 'string' || typeof consultant.id === 'string') {
        await axios.post(`http://localhost:5001/studentsupport/${consultant._id || consultant.id}/rate`, ratingData);
        fetchAllAndTop(); // Refresh dynamically
      }
      alert(`Thank you for rating ${consultant.name} with ${starValue} stars!`);
    } catch(err) {
      console.error(err);
      if (typeof consultant.id !== 'number') {
         alert('Failed to save rating remotely.');
      }
    }
  };

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
        <button className="rating-btn" onClick={() => setShowRatingModal(true)}>
          <span className="rating-icon">⭐</span>
          Rate Consultants
        </button>
        {/* NEW PROFILE BUTTON – appears only if user is logged in */}
        
      </div>

      {/* Top Consultants */}
      <div className="top-consultants">
        <h2>🏆 Top Rated Consultants</h2>
        <div className="top-consultants-grid">
          {topConsultants.map((consultant, index) => (
            <div key={consultant.id || consultant._id} className="top-consultant-card">
              <div className="rank-badge">#{index + 1}</div>
              <h3>{consultant.name}</h3>
              <div className="rating">
                {renderStars(consultant.averageRating || 0)}
                <span className="rating-text">({consultant.averageRating || 0})</span>
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
            <div key={lecturer.id || lecturer._id} className="lecturer-card">
              <div className="lecturer-header">
                <h3>{lecturer.name}</h3>
                <span className="lecturer-title">{lecturer.title}</span>
                <div className="rating">
                  {renderStars(lecturer.averageRating || 0)}
                  <span className="rating-text">({lecturer.averageRating || 0})</span>
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
                <Link to={`/consultant-booking/${lecturer._id || lecturer.id}`} state={{ consultant: lecturer }}>
                  <button className="book-btn">Book Consultation</button>
                </Link>
                <button className="rate-btn" onClick={() => setShowRatingModal(true)}>Rate Consultant</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showRatingModal && (
        <div className="modal-overlay" onClick={() => setShowRatingModal(false)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{
            background: 'white', padding: '30px', borderRadius: '12px', minWidth: '400px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, color: '#333' }}>Rate Consultants</h2>
              <button onClick={() => setShowRatingModal(false)} style={{
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666'
              }}>×</button>
            </div>
            
            <div className="modal-consultant-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {lecturers.map(consultant => (
                <div key={consultant.id} style={{
                  padding: '15px', border: '1px solid #eee', borderRadius: '8px',
                  display: 'flex', flexDirection: 'column', gap: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#333' }}>{consultant.name}</h3>
                    <span style={{ fontSize: '0.9rem', color: '#666', background: '#f5f5f5', padding: '2px 8px', borderRadius: '12px' }}>
                      {consultant.faculty}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#666', fontWeight: '500' }}>Rate:</span>
                    <div>
                      {renderInteractiveStars(consultant)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentSupport;