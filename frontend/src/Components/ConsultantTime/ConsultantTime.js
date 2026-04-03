import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './ConsultantTime.css';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

function ConsultantTime() {
  const { consultantId, date } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [consultant, setConsultant] = useState(location.state?.consultant || null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(!location.state?.consultant);

  useEffect(() => {
    const fetchConsultantAndSlots = async () => {
      try {
        if (!consultant) {
          // Fetch consultant from backend
          const consultantResponse = await axios.get(`http://localhost:5001/studentsupport/${consultantId}`);
          setConsultant(consultantResponse.data.lecturer || consultantResponse.data);
        }
        
        // Simulate some slots being already booked (in real app, this would come from backend)
        const bookedSlots = ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'];
        const available = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
        setAvailableSlots(available);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching consultant:', err);
        setLoading(false);
      }
    };

    fetchConsultantAndSlots();
  }, [consultantId, consultant]);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBooking = () => {
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    // Save booking to localStorage (in real app, this would be an API call)
    const booking = {
      consultantId,
      consultantName: consultant.name,
      date,
      time: selectedTime,
      timestamp: new Date().toISOString()
    };

    const existingBookings = JSON.parse(localStorage.getItem('consultantBookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('consultantBookings', JSON.stringify(existingBookings));

    alert(`Booking confirmed for ${consultant.name} on ${date} at ${selectedTime}`);
    navigate('/studentsupport');
  };

  const handleBack = () => {
    navigate(`/consultant-booking/${consultantId}`, { state: { consultant } });
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
    return <div className="loading">Loading time slots...</div>;
  }

  if (!consultant) {
    return <div className="error">Consultant not found</div>;
  }

  return (
    <div className="consultant-time-container">
      <div className="time-header">
        <button onClick={handleBack} className="back-btn">
          ← Back to Date Selection
        </button>
        <h1>Select Time Slot</h1>
      </div>

      <div className="consultant-summary">
        <div className="consultant-info">
          <h3>{consultant.name}</h3>
          <span className="consultant-title">{consultant.title}</span>
          <div className="rating">
            {renderStars(consultant.rating || 0)}
            <span className="rating-text">({consultant.rating || 0})</span>
          </div>
        </div>
        
        <div className="booking-details">
          <div className="detail-item">
            <span className="label">Date:</span>
            <span className="value">{new Date(date).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <span className="label">Faculty:</span>
            <span className="value">{consultant.faculty}</span>
          </div>
          <div className="detail-item">
            <span className="label">Room:</span>
            <span className="value">{consultant.room}</span>
          </div>
        </div>
      </div>

      <div className="time-selection">
        <h3>Available Time Slots</h3>
        <p>Click on a time slot to select it for your booking</p>
        
        <div className="time-slots-grid">
          {availableSlots.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={`time-slot ${selectedTime === time ? 'selected' : ''}`}
            >
              {time}
            </button>
          ))}
        </div>
      </div>

      <div className="booking-actions">
        <div className="info-card">
          <h4>📅 Booking Summary</h4>
          <ul>
            <li>Consultant: {consultant.name}</li>
            <li>Date: {new Date(date).toLocaleDateString()}</li>
            <li>Time: {selectedTime || 'Not selected'}</li>
            <li>Duration: 30 minutes</li>
            <li>Location: {consultant.room}</li>
          </ul>
          
          <button
            onClick={handleBooking}
            className="confirm-booking-btn"
            disabled={!selectedTime}
          >
            Confirm Booking
          </button>
        </div>
      </div>

      <div className="booking-info">
        <div className="info-card">
          <h4>ℹ️ Important Information</h4>
          <ul>
            <li>Please arrive 5 minutes before your scheduled time</li>
            <li>Cancellations must be made at least 2 hours in advance</li>
            <li>You will receive a confirmation email after booking</li>
            <li>Consultation fee may apply</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConsultantTime;
