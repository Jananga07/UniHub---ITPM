import React, { useState, useMemo } from 'react';
import Navigation from '../HomeNav/HomeNav';
import './FAQ.css';

function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData = [
    {
      id: 1,
      category: 'consultation',
      question: 'How do I book a consultation with a lecturer?',
      answer: 'Navigate to Student Support, select a consultant, choose an available date, select a time slot, and confirm your booking.'
    },
    {
      id: 2,
      category: 'consultation',
      question: 'Can I cancel my consultation booking?',
      answer: 'Yes, you can cancel your booking up to 2 hours before the scheduled time through the My Bookings section.'
    },
    {
      id: 3,
      category: 'lecture_materials',
      question: 'Where can I find lecture materials?',
      answer: 'Lecture materials are available in the Module Page under your respective courses. You can also access them through the Resources section.'
    },
    {
      id: 4,
      category: 'lecture_materials',
      question: 'What if I cannot access certain lecture materials?',
      answer: 'Please check your enrollment status for the module. If the issue persists, submit a complaint under the "Lecture Materials" category.'
    },
    {
      id: 5,
      category: 'events',
      question: 'How can I register for club events?',
      answer: 'Visit the Society Page, browse available events, and click on the registration button for the event you\'re interested in.'
    },
    {
      id: 6,
      category: 'events',
      question: 'Can I suggest new club events?',
      answer: 'Yes! You can submit suggestions through the complaint form under the "Club Events" category or contact your club representative directly.'
    },
    {
      id: 7,
      category: 'complaints',
      question: 'How do I file a complaint?',
      answer: 'Go to Student Support page, click on the "Complaint" button, fill out the form with appropriate category, and submit. You can track status in "My Complaints".'
    },
    {
      id: 8,
      category: 'complaints',
      question: 'How long does it take to resolve a complaint?',
      answer: 'Complaint resolution time varies by category. Academic issues typically take 3-5 working days, while administrative issues take 1-3 working days.'
    },
    {
      id: 9,
      category: 'general',
      question: 'How do I contact admin via WhatsApp?',
      answer: 'You can reach admin through WhatsApp at +94705645369 for urgent queries and support.'
    },
    {
      id: 10,
      category: 'general',
      question: 'Where can I find my student profile?',
      answer: 'Log in to your account and navigate to your profile section or access it directly through the Student Profile menu.'
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'lecture_materials', label: 'Lecture Materials' },
    { value: 'events', label: 'Events' },
    { value: 'complaints', label: 'Complaints' },
    { value: 'general', label: 'General' }
  ];

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div className="faq-container">
      <Navigation />
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about Uni Hub services</p>
      </div>

      <div className="faq-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-filter"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="faq-list">
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map(faq => (
            <div key={faq.id} className="faq-item">
              <div className="faq-question">
                <h3>{faq.question}</h3>
              </div>
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No FAQs found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FAQ;
