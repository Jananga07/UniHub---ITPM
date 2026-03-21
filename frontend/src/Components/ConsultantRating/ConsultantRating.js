import React, { useState, useEffect } from 'react';
import Navigation from '../HomeNav/HomeNav';
import './ConsultantRating.css';

function ConsultantRating() {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const consultantsData = [
    {
      id: 1,
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu",
      rating: 4.5,
      totalRatings: 45,
      totalBookings: 62
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
      totalRatings: 38,
      totalBookings: 71
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
      totalRatings: 28,
      totalBookings: 45
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
      totalRatings: 52,
      totalBookings: 83
    }
  ];

  useEffect(() => {
    // Load consultants data
    const storedConsultants = JSON.parse(localStorage.getItem('consultants') || JSON.stringify(consultantsData));
    setConsultants(storedConsultants);
    
    // Load user bookings
    const storedBookings = JSON.parse(localStorage.getItem('consultantBookings') || '[]');
    const userConsultantIds = [...new Set(storedBookings.map(b => b.consultantId))];
    setUserBookings(userConsultantIds);
    
    setLoading(false);
  }, []);

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= fullStars;
      const isHalf = i === fullStars + 1 && hasHalfStar;
      
      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'full' : isHalf ? 'half' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onStarClick && onStarClick(i)}
        >
          ★
        </span>
      );
    }
    
    return stars;
  };

  const handleStarClick = (starValue) => {
    setRating(starValue);
  };

  const handleSubmitRating = () => {
    if (!selectedConsultant || rating === 0) {
      alert('Please select a consultant and provide a rating');
      return;
    }

    // Create rating object
    const ratingData = {
      consultantId: selectedConsultant.id,
      rating: rating,
      feedback: feedback,
      date: new Date().toISOString(),
      studentEmail: 'student@example.com' // This would come from auth context
    };

    // Save rating to localStorage
    const existingRatings = JSON.parse(localStorage.getItem('consultantRatings') || '[]');
    existingRatings.push(ratingData);
    localStorage.setItem('consultantRatings', JSON.stringify(existingRatings));

    // Update consultant's average rating
    const consultantRatings = existingRatings.filter(r => r.consultantId === selectedConsultant.id);
    const averageRating = consultantRatings.reduce((sum, r) => sum + r.rating, 0) / consultantRatings.length;
    
    const updatedConsultants = consultants.map(c => 
      c.id === selectedConsultant.id 
        ? { ...c, rating: averageRating, totalRatings: consultantRatings.length }
        : c
    );
    
    setConsultants(updatedConsultants);
    localStorage.setItem('consultants', JSON.stringify(updatedConsultants));

    alert('Thank you for your rating!');
    
    // Reset form
    setSelectedConsultant(null);
    setRating(0);
    setFeedback('');
  };

  const getTopConsultants = () => {
    return [...consultants].sort((a, b) => b.rating - a.rating).slice(0, 3);
  };

  const topConsultants = getTopConsultants();

  if (loading) {
    return <div className="loading">Loading consultant ratings...</div>;
  }

  return (
    <div className="consultant-rating-container">
      <Navigation />
      <div className="rating-header">
        <h1>Consultant Ratings</h1>
        <p>Rate consultants based on your consultation experience</p>
      </div>

      {/* Top Consultants */}
      <div className="top-consultants-section">
        <h2>🏆 Top Rated Consultants</h2>
        <div className="top-consultants-grid">
          {topConsultants.map((consultant, index) => (
            <div key={consultant.id} className="top-consultant-card">
              <div className="rank-badge">#{index + 1}</div>
              <div className="consultant-info">
                <h3>{consultant.name}</h3>
                <span className="consultant-title">{consultant.title}</span>
                <div className="rating-display">
                  {renderStars(consultant.rating)}
                  <span className="rating-text">{consultant.rating.toFixed(1)} ({consultant.totalRatings} ratings)</span>
                </div>
                <p className="expertise">{consultant.expertise.substring(0, 60)}...</p>
                <div className="stats">
                  <span className="stat-item">📚 {consultant.totalBookings} bookings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rating Form */}
      <div className="rating-form-section">
        <h2>Rate a Consultant</h2>
        <p>Share your experience to help other students</p>
        
        <div className="rating-form">
          <div className="form-group">
            <label>Select Consultant:</label>
            <select
              value={selectedConsultant?.id || ''}
              onChange={(e) => {
                const consultant = consultants.find(c => c.id === parseInt(e.target.value));
                setSelectedConsultant(consultant);
                setRating(0);
                setFeedback('');
              }}
              className="consultant-select"
            >
              <option value="">Choose a consultant you've consulted</option>
              {consultants
                .filter(c => userBookings.includes(c.id))
                .map(consultant => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name} - {consultant.faculty}
                  </option>
                ))}
            </select>
            {userBookings.length === 0 && (
              <p className="no-bookings-message">You need to book a consultation before rating</p>
            )}
          </div>

          {selectedConsultant && (
            <>
              <div className="form-group">
                <label>Your Rating:</label>
                <div className="star-rating">
                  {renderStars(rating, true, handleStarClick)}
                </div>
                <span className="rating-hint">Click on stars to rate</span>
              </div>

              <div className="form-group">
                <label>Feedback (Optional):</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Share your experience with this consultant..."
                  rows={4}
                  className="feedback-textarea"
                />
              </div>

              <button onClick={handleSubmitRating} className="submit-rating-btn">
                Submit Rating
              </button>
            </>
          )}
        </div>
      </div>

      {/* All Consultants List */}
      <div className="all-consultants-section">
        <h2>All Consultant Ratings</h2>
        <div className="consultants-grid">
          {consultants.map((consultant) => (
            <div key={consultant.id} className="consultant-card">
              <div className="consultant-header">
                <h3>{consultant.name}</h3>
                <span className="consultant-title">{consultant.title}</span>
              </div>
              
              <div className="consultant-details">
                <div className="faculty">{consultant.faculty}</div>
                <div className="expertise">{consultant.expertise}</div>
                <div className="room">📍 {consultant.room}</div>
                <div className="email">📧 {consultant.email}</div>
              </div>
              
              <div className="rating-section">
                <div className="rating-display">
                  {renderStars(consultant.rating)}
                  <span className="rating-text">{consultant.rating.toFixed(1)} out of 5</span>
                </div>
                <div className="rating-stats">
                  <span className="total-ratings">{consultant.totalRatings} ratings</span>
                  <span className="total-bookings">{consultant.totalBookings} bookings</span>
                </div>
              </div>
              
              <div className="consultant-actions">
                <button 
                  onClick={() => {
                    setSelectedConsultant(consultant);
                    setRating(0);
                    setFeedback('');
                  }}
                  className="rate-btn"
                  disabled={!userBookings.includes(consultant.id)}
                >
                  {userBookings.includes(consultant.id) ? 'Rate This Consultant' : 'Book First to Rate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ConsultantRating;
