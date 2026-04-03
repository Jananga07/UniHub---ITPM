import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ConsultantRating.css';

function ConsultantRating() {
  const [consultants, setConsultants] = useState([]);
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [userRatings, setUserRatings] = useState([]);

  const studentEmail = 'student@example.com';
  const studentName = 'John Doe';

  // Fetch consultants from backend
  const fetchConsultants = async () => {
    try {
      const response = await axios.get('http://localhost:5001/studentsupport');
      const consultantsData = response.data || [];
      
      // Fetch ratings for each consultant
      const consultantsWithRatings = await Promise.all(
        consultantsData.map(async (consultant) => {
          try {
            const ratingResponse = await axios.get(
              `http://localhost:5001/consultant-ratings?consultantId=${consultant._id}`
            );
            const ratings = ratingResponse.data.ratings || [];
            
            // Calculate average rating and total ratings
            const avgRating = ratings.length > 0 
              ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
              : 0;
            
            return {
              ...consultant,
              id: consultant._id,
              rating: avgRating,
              totalRatings: ratings.length
            };
          } catch (err) {
            console.error(`Error fetching ratings for consultant ${consultant._id}:`, err);
            return {
              ...consultant,
              id: consultant._id,
              rating: 0,
              totalRatings: 0
            };
          }
        })
      );
      
      setConsultants(consultantsWithRatings);
    } catch (err) {
      console.error('Error fetching consultants:', err);
      setError('Failed to load consultants. Please try again later.');
    }
  };

  // Fetch user ratings
  const fetchUserRatings = async () => {
    try {
      const response = await axios.get('http://localhost:5001/consultant-ratings');
      const allRatings = response.data.ratings || [];
      const userSpecificRatings = allRatings.filter(r => r.studentEmail === studentEmail);
      setUserRatings(userSpecificRatings);
    } catch (err) {
      console.error('Error fetching user ratings:', err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      // Fetch data from backend
      await Promise.all([
        fetchConsultants(),
        fetchUserRatings()
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);

  const renderStars = (value, interactive = false, onStarClick = null) => {
    const stars = [];
    const fullStars = Math.floor(value);
    const hasHalfStar = value % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= fullStars;
      const isHalf = i === fullStars + 1 && hasHalfStar;

      stars.push(
        <span
          key={i}
          className={`star ${isFilled ? 'full' : isHalf ? 'half' : 'empty'} ${interactive ? 'interactive' : ''}`}
          onClick={() => interactive && onStarClick && onStarClick(i)}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          onKeyDown={(e) => {
            if (interactive && (e.key === 'Enter' || e.key === ' ')) {
              onStarClick(i);
            }
          }}
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

  const handleInlineRate = async (consultantToRate, starValue) => {
    if (submitting) return;
    setSubmitting(true);
    
    try {
      const existingRating = userRatings.find(
        (r) => r.consultantId === consultantToRate.id && r.studentEmail === studentEmail
      );
      
      const ratingData = {
        consultantId: consultantToRate.id,
        consultantName: consultantToRate.name,
        rating: starValue,
        feedback: existingRating?.feedback || '',
        studentEmail,
        studentName
      };

      // Submit rating to backend
      const response = await axios.post(
        `http://localhost:5001/studentsupport/${consultantToRate.id}/rate`,
        ratingData
      );

      if (response.data) {
        // Refresh consultants data to get updated ratings
        await fetchConsultants();
        await fetchUserRatings();

        alert(`Successfully rated ${consultantToRate.name} with ${starValue} stars!`);
        
        // Reset form variables (though we don't use them anymore)
        setSelectedConsultant(null);
        setRating(0);
        setFeedback('');
      }
    } catch (err) {
      console.error('Error submitting rating:', err);
      alert('Failed to submit rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTopConsultants = () => {
    return [...consultants].sort((a, b) => b.rating - a.rating).slice(0, 3);
  };

  const getUserRatingForConsultant = (consultantId) => {
    return userRatings.find(
      (r) => r.consultantId === consultantId && r.studentEmail === studentEmail
    );
  };

  const topConsultants = getTopConsultants();
  const allConsultantsOptions = consultants; // Show all consultants for rating

  if (error) {
    return (
      <div className="consultant-rating-container">
        <div className="error-message">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading consultant ratings...</div>;
  }

  if (consultants.length === 0) {
    return (
      <div className="consultant-rating-container">
        <div className="error-message">
          <h2>No Consultants Available</h2>
          <p>Unable to load consultant information. Please try refreshing the page.</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="consultant-rating-container">
      <div className="rating-header">
        <h1>Consultant Ratings</h1>
        <p>Rate consultants based on your consultation experience</p>
      </div>

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
                  <span className="rating-text">
                    {consultant.rating.toFixed(1)} ({consultant.totalRatings} ratings)
                  </span>
                </div>
                <p className="expertise">
                  {consultant.expertise.length > 60
                    ? `${consultant.expertise.substring(0, 60)}...`
                    : consultant.expertise}
                </p>
                <div className="stats">
                  <span className="stat-item">📚 {consultant.totalBookings} bookings</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>



      <div className="all-consultants-section">
        <h2>All Consultant Ratings</h2>
        <div className="consultants-grid">
          {consultants.map((consultant) => {
            const userRating = getUserRatingForConsultant(consultant.id);

            return (
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

                <div className="consultant-actions interactive-rating-actions">
                  <h4 style={{marginBottom: "5px", color: "#555"}}>{userRating ? "Update Your Rating:" : "Rate this Consultant:"}</h4>
                  <div className="inline-star-rating" style={{fontSize: "24px", cursor: "pointer"}}>
                    {renderStars(
                      userRating ? userRating.rating : 0,
                      true,
                      (starValue) => handleInlineRate(consultant, starValue)
                    )}
                  </div>
                  {userRating && userRating.feedback && (
                    <p className="your-feedback" style={{marginTop: "8px", fontStyle: "italic", fontSize: "14px"}}>"{userRating.feedback}"</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ConsultantRating;
