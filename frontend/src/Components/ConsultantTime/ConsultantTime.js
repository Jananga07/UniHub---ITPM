import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ConsultantTime.css';

const CONSULTANTS = [
  {
    id: 1,
    name: "Dr. Alice Perera",
    title: "Consultation",
    faculty: "FACULTY OF COMPUTING"
  },
  {
    id: 2,
    name: "Prof. Nimal Fernando",
    title: "Senior Consultant",
    faculty: "FACULTY OF ENGINEERING"
  },
  {
    id: 3,
    name: "Dr. Sarah Kumar",
    title: "Consultation",
    faculty: "FACULTY OF BUSINESS"
  },
  {
    id: 4,
    name: "Prof. Kamal Rajapaksa",
    title: "Senior Consultant",
    faculty: "FACULTY OF COMPUTING"
  }
];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '01:00 PM', '01:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM'
];

function ConsultantTime() {
  const { consultantId, date } = useParams();
  const navigate = useNavigate();
  
  const [consultant, setConsultant] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find consultant by ID
    const foundConsultant = CONSULTANTS.find(c => c.id === parseInt(consultantId));
    setConsultant(foundConsultant);
    
    // Simulate some slots being already booked
    const bookedSlots = ['10:00 AM', '11:30 AM', '02:30 PM', '04:00 PM'];
    const available = TIME_SLOTS.filter(slot => !bookedSlots.includes(slot));
    setAvailableSlots(available);
    setLoading(false);
  }, [consultantId]);

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleBookingConfirm = () => {
    if (!selectedTime) {
      alert('Please select a time slot');
      return;
    }

    // Create booking object
    const booking = {
      id: Date.now(),
      consultantId: parseInt(consultantId),
      consultantName: consultant.name,
      date: date,
      time: selectedTime,
      status: 'confirmed',
      bookingDate: new Date().toISOString(),
      studentEmail: 'student@example.com' // This would come from auth context
    };

    // Save to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('consultantBookings') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('consultantBookings', JSON.stringify(existingBookings));

    // Navigate to confirmation or back to student support
    alert(`Booking confirmed!\n\nConsultant: ${consultant.name}\nDate: ${date}\nTime: ${selectedTime}\n\nYou will receive a confirmation email shortly.`);
    navigate('/studentsupport');
  };

  const handleBack = () => {
    navigate(`/consultant-booking/${consultantId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading available time slots...</div>;
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

      <div className="booking-summary">
        <div className="summary-card">
          <h3>Booking Summary</h3>
          <div className="summary-details">
            <div className="summary-item">
              <span className="label">Consultant:</span>
              <span className="value">{consultant.name}</span>
            </div>
            <div className="summary-item">
              <span className="label">Date:</span>
              <span className="value">{formatDate(date)}</span>
            </div>
            {selectedTime && (
              <div className="summary-item">
                <span className="label">Selected Time:</span>
                <span className="value selected">{selectedTime}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="time-selection">
        <h3>Available Time Slots</h3>
        <p>Each consultation session lasts 30 minutes</p>
        
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
        
        {availableSlots.length === 0 && (
          <div className="no-slots">
            <p>No available time slots for this date. Please select another date.</p>
            <button onClick={handleBack} className="back-to-dates-btn">
              Choose Different Date
            </button>
          </div>
        )}
      </div>

      {selectedTime && (
        <div className="booking-confirmation">
          <div className="confirmation-card">
            <h4>📋 Booking Details</h4>
            <div className="booking-details">
              <div className="detail-row">
                <span>Consultation Type:</span>
                <span>Academic Advisory</span>
              </div>
              <div className="detail-row">
                <span>Duration:</span>
                <span>30 minutes</span>
              </div>
              <div className="detail-row">
                <span>Location:</span>
                <span>Virtual Meeting (Link will be sent via email)</span>
              </div>
              <div className="detail-row">
                <span>Preparation:</span>
                <span>Please prepare your questions in advance</span>
              </div>
            </div>
            
            <div className="confirmation-actions">
              <button onClick={handleBack} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleBookingConfirm} className="confirm-btn">
                Confirm Booking
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="important-notes">
        <div className="notes-card">
          <h4>⚠️ Important Notes</h4>
          <ul>
            <li>Please arrive 5 minutes early for virtual consultations</li>
            <li>Have your questions and relevant materials ready</li>
            <li>Cancellations must be made at least 2 hours in advance</li>
            <li>You will receive a calendar invitation and meeting link via email</li>
            <li>If you need to reschedule, please contact the consultant directly</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ConsultantTime;
