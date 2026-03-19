import React from 'react';
import './StudentSupport.css';

function StudentSupport() {
  const lecturers = [
    {
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu"
    },
    {
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu"
    },
    {
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu"
    },
    {
      name: "Dr. Alice Perera",
      title: "Consultation",
      faculty: "FACULTY OF COMPUTING",
      expertise: "PhD in Computer Science Specialist in Algorithms and Data Structures",
      room: "Room CS-201",
      email: "alice.perera@university.edu"
    }
  ];

  return (
    <div className="student-support-container">
      <h1 className="page-title">Student Support System</h1>
      
      <div className="consultation-booking">
        <h2>Consultation Booking</h2>
        <p className="booking-description">
          Available lecturers for consultation are loaded from the backend. Example data is shown as a fallback.
        </p>
        
        <div className="lecturers-grid">
          {lecturers.map((lecturer, index) => (
            <div key={index} className="lecturer-card">
              <div className="lecturer-header">
                <h3>{lecturer.name}</h3>
                <span className="lecturer-title">{lecturer.title}</span>
              </div>
              
              <div className="lecturer-details">
                <div className="faculty">{lecturer.faculty}</div>
                <div className="expertise">{lecturer.expertise}</div>
                <div className="room">{lecturer.room}</div>
                <div className="email">{lecturer.email}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentSupport;
