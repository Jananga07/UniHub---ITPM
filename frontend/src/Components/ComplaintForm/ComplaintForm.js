import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../HomeNav/HomeNav';

function ComplaintForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    urgency: 'medium',
    contactEmail: '',
    contactPhone: ''
  });
  
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'lecture_materials', label: 'Lecture Materials' },
    { value: 'club_events', label: 'Club Events' },
    { value: 'others', label: 'Others' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }
    
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }
    
    if (formData.contactPhone && !/^\d{10}$/.test(formData.contactPhone.replace(/\D/g, ''))) {
      newErrors.contactPhone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would normally send the data to backend
      const complaintData = {
        ...formData,
        id: Date.now(),
        status: 'pending',
        submittedDate: new Date().toISOString(),
        submittedBy: 'current-user' // This would come from auth context
      };
      
      // Save to localStorage for demo purposes
      const existingComplaints = JSON.parse(localStorage.getItem('complaints') || '[]');
      existingComplaints.push(complaintData);
      localStorage.setItem('complaints', JSON.stringify(existingComplaints));
      
      alert('Complaint submitted successfully! You can track its status in "My Complaints".');
      navigate('/my-complaints');
    }
  };

  const handleCancel = () => {
    navigate('/studentsupport');
  };

  return (
    <div className="complaint-form-container">
      <Navigation />
      <div className="complaint-form-header">
        <h1>File a Complaint</h1>
        <p>We take your concerns seriously. Please provide detailed information about your issue.</p>
      </div>

      <form onSubmit={handleSubmit} className="complaint-form">
        <div className="form-group">
          <label htmlFor="category" className="form-label">
            Category <span className="required">*</span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`form-select ${errors.category ? 'error' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.category && <span className="error-message">{errors.category}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Complaint Title <span className="required">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Brief summary of your complaint"
            className={`form-input ${errors.title ? 'error' : ''}`}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Detailed Description <span className="required">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Please provide a detailed description of your issue. Include relevant dates, locations, and any other important information."
            rows={6}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="urgency" className="form-label">
            Urgency Level
          </label>
          <select
            id="urgency"
            name="urgency"
            value={formData.urgency}
            onChange={handleInputChange}
            className="form-select"
          >
            {urgencyLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="contactEmail" className="form-label">
              Contact Email
            </label>
            <input
              type="email"
              id="contactEmail"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              className={`form-input ${errors.contactEmail ? 'error' : ''}`}
            />
            {errors.contactEmail && <span className="error-message">{errors.contactEmail}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="contactPhone" className="form-label">
              Contact Phone
            </label>
            <input
              type="tel"
              id="contactPhone"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              placeholder="07X XXX XXXX"
              className={`form-input ${errors.contactPhone ? 'error' : ''}`}
            />
            {errors.contactPhone && <span className="error-message">{errors.contactPhone}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
          <button type="submit" className="submit-btn">
            Submit Complaint
          </button>
        </div>
      </form>
    </div>
  );
}

export default ComplaintForm;
