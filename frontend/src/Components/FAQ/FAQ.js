import React, { useState, useMemo } from 'react';
import Navigation from '../HomeNav/HomeNav';
import './FAQ.css';

function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqData = [
    // ========== Consultation (12 FAQs) ==========
    { id: 1, category: 'consultation', question: 'How do I book a consultation with a lecturer?', answer: 'Navigate to Student Support, select a consultant, choose an available date, select a time slot, and confirm your booking.' },
    { id: 2, category: 'consultation', question: 'Can I cancel my consultation booking?', answer: 'Yes, you can cancel your booking up to 2 hours before the scheduled time through the My Bookings section.' },
    { id: 11, category: 'consultation', question: 'How long does a consultation session last?', answer: 'Each consultation session lasts 30 minutes. If you need more time, you can book consecutive slots (subject to availability).' },
    { id: 12, category: 'consultation', question: 'Can I choose a specific lecturer for consultation?', answer: 'Yes, you can browse the list of available consultants and select the one you prefer based on their expertise and availability.' },
    { id: 13, category: 'consultation', question: 'What if I am late for my consultation?', answer: 'If you are more than 10 minutes late, your slot may be released to another student. Please arrive on time or inform the lecturer via email.' },
    { id: 14, category: 'consultation', question: 'Can I request a consultation for a group?', answer: 'Group consultations are available for project discussions. Please contact the lecturer directly to arrange a group session.' },
    { id: 15, category: 'consultation', question: 'Are consultations recorded?', answer: 'Consultations are not recorded to maintain privacy. However, you may take notes during the session.' },
    { id: 16, category: 'consultation', question: 'Can I reschedule my consultation?', answer: 'Yes, you can reschedule up to 2 hours before the original slot by canceling your booking and creating a new one.' },
    { id: 17, category: 'consultation', question: 'What should I prepare before the consultation?', answer: 'Bring any relevant materials, questions, or assignment drafts. A clear list of points you want to discuss will make the session more productive.' },
    { id: 18, category: 'consultation', question: 'How do I know if my booking is confirmed?', answer: 'You will receive a confirmation email and the booking will appear in your "My Bookings" section immediately after confirmation.' },
    { id: 19, category: 'consultation', question: 'Is there a limit on how many consultations I can book?', answer: 'You can book up to 3 consultations per week to ensure fair access for all students.' },
    { id: 20, category: 'consultation', question: 'Can I provide feedback after the consultation?', answer: 'Yes, after the session you can rate the consultant and leave comments through the rating feature on the Student Support page.' },

    // ========== Lecture Materials (10 FAQs) ==========
    { id: 3, category: 'lecture_materials', question: 'Where can I find lecture materials?', answer: 'Lecture materials are available in the Module Page under your respective courses. You can also access them through the Resources section.' },
    { id: 4, category: 'lecture_materials', question: 'What if I cannot access certain lecture materials?', answer: 'Please check your enrollment status for the module. If the issue persists, submit a complaint under the "Lecture Materials" category.' },
    { id: 21, category: 'lecture_materials', question: 'Are lecture notes available for download?', answer: 'Yes, most lecture materials are available as PDF files that you can download for offline study.' },
    { id: 22, category: 'lecture_materials', question: 'How long are lecture materials kept online?', answer: 'Materials remain available throughout the semester and for one additional year after course completion.' },
    { id: 23, category: 'lecture_materials', question: 'Can I access lecture materials from previous semesters?', answer: 'Previous semester materials are archived. You can request access through the academic support team.' },
    { id: 24, category: 'lecture_materials', question: 'What should I do if I find an error in the lecture notes?', answer: 'Please report any errors through the complaint form under "Lecture Materials" or contact the lecturer directly.' },
    { id: 25, category: 'lecture_materials', question: 'Are there any additional resources like video recordings?', answer: 'Some modules provide recorded lectures. Check the module page for video links.' },
    { id: 26, category: 'lecture_materials', question: 'How can I get past exam papers?', answer: 'Past exam papers are available in the Examination Resources section of the student portal.' },
    { id: 27, category: 'lecture_materials', question: 'Are there reading lists for each module?', answer: 'Yes, recommended reading lists are provided in the module syllabus or under the "Resources" tab.' },
    { id: 28, category: 'lecture_materials', question: 'Can I suggest additional materials for a module?', answer: 'Absolutely! You can submit suggestions to the module coordinator or use the feedback form.' },

    // ========== Events (10 FAQs) ==========
    { id: 5, category: 'events', question: 'How can I register for club events?', answer: 'Visit the Society Page, browse available events, and click on the registration button for the event you\'re interested in.' },
    { id: 6, category: 'events', question: 'Can I suggest new club events?', answer: 'Yes! You can submit suggestions through the complaint form under the "Club Events" category or contact your club representative directly.' },
    { id: 29, category: 'events', question: 'Are events free for students?', answer: 'Most club events are free, but some may have a small registration fee to cover costs. Details are mentioned on the event page.' },
    { id: 30, category: 'events', question: 'How do I know about upcoming events?', answer: 'Events are announced on the Uni Hub homepage, via email newsletters, and on the Society Page.' },
    { id: 31, category: 'events', question: 'Can I bring a friend from outside the university?', answer: 'Some events allow external guests. Check the event description or contact the organizing club for details.' },
    { id: 32, category: 'events', question: 'What if I register but cannot attend?', answer: 'You can cancel your registration through the Society Page up to 24 hours before the event.' },
    { id: 33, category: 'events', question: 'Are there events during exam periods?', answer: 'Events are usually paused during exam weeks to allow students to focus. Only academic workshops may be scheduled.' },
    { id: 34, category: 'events', question: 'How can I start a new club or society?', answer: 'You can propose a new club by submitting a proposal to the Student Affairs Office with a minimum of 10 founding members.' },
    { id: 35, category: 'events', question: 'Do clubs get funding for events?', answer: 'Yes, registered clubs can apply for funding from the university’s Student Activities Fund for approved events.' },
    { id: 36, category: 'events', question: 'Can I get certificates for attending workshops?', answer: 'Many workshops offer participation certificates. Check with the event organizer for details.' },

    // ========== Complaints (10 FAQs) ==========
    { id: 7, category: 'complaints', question: 'How do I file a complaint?', answer: 'Go to Student Support page, click on the "Complaint" button, fill out the form with appropriate category, and submit. You can track status in "My Complaints".' },
    { id: 8, category: 'complaints', question: 'How long does it take to resolve a complaint?', answer: 'Complaint resolution time varies by category. Academic issues typically take 3-5 working days, while administrative issues take 1-3 working days.' },
    { id: 37, category: 'complaints', question: 'Can I file a complaint anonymously?', answer: 'Yes, you can submit anonymous complaints, but providing contact details helps us follow up and update you on progress.' },
    { id: 38, category: 'complaints', question: 'What happens after I submit a complaint?', answer: 'You will receive an acknowledgment email. The relevant department will investigate and provide a resolution or further steps.' },
    { id: 39, category: 'complaints', question: 'Can I appeal a complaint decision?', answer: 'Yes, if you are unsatisfied with the resolution, you can request an appeal through the same complaint system.' },
    { id: 40, category: 'complaints', question: 'Are complaints kept confidential?', answer: 'Absolutely. All complaints are handled confidentially and only shared with necessary personnel.' },
    { id: 41, category: 'complaints', question: 'What if my complaint involves a staff member?', answer: 'Complaints involving staff are escalated to the relevant department head and handled with strict confidentiality.' },
    { id: 42, category: 'complaints', question: 'Can I submit supporting documents with my complaint?', answer: 'Yes, you can attach files (up to 5MB) to provide evidence or additional context.' },
    { id: 43, category: 'complaints', question: 'How will I be updated on my complaint?', answer: 'You will receive email updates whenever the status changes, and you can view detailed logs in the "My Complaints" section.' },
    { id: 44, category: 'complaints', question: 'What if I lose access to my account?', answer: 'You can still submit complaints by contacting the IT Support Desk via email or phone.' },

    // ========== General (10 FAQs) ==========
    { id: 9, category: 'general', question: 'How do I contact admin via WhatsApp?', answer: 'You can reach admin through WhatsApp at +94705645369 for urgent queries and support.' },
    { id: 10, category: 'general', question: 'Where can I find my student profile?', answer: 'Log in to your account and navigate to your profile section or access it directly through the Student Profile menu.' },
    { id: 45, category: 'general', question: 'How do I reset my password?', answer: 'Click "Forgot Password" on the login page and follow the instructions sent to your registered email.' },
    { id: 46, category: 'general', question: 'Is there a mobile app for Uni Hub?', answer: 'Currently, Uni Hub is optimized for mobile browsers. A dedicated app is planned for future release.' },
    { id: 47, category: 'general', question: 'How do I update my contact information?', answer: 'Go to your Profile page, click "Edit Profile", and update your email or phone number.' },
    { id: 48, category: 'general', question: 'What should I do if I encounter a technical issue?', answer: 'Report the issue through the "Technical Support" form, or email it-support@university.edu.' },
    { id: 49, category: 'general', question: 'Can I change my academic program?', answer: 'Program change requests are handled by the Academic Registry. Please visit the administration office.' },
    { id: 50, category: 'general', question: 'Where can I find the academic calendar?', answer: 'The academic calendar is available in the "Academic Info" section or from the main university website.' },
    { id: 51, category: 'general', question: 'How do I apply for a transcript?', answer: 'Transcript requests can be made online through the "Academic Records" portal, or at the Registrar’s office.' },
    { id: 52, category: 'general', question: 'What support services are available for international students?', answer: 'The International Student Office provides visa assistance, accommodation, and cultural integration support.' }
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
  }, [searchTerm, selectedCategory, faqData]);

  return (
    <div className="faq-container">
      <Navigation />
      
      <div className="content-section">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p>Find answers to common questions about Uni Hub services</p>
        </div>

        <div className="faq-stats">
          <div className="stat-card">
            <div className="stat-number">52</div>
            <div className="stat-label">Total FAQs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">5</div>
            <div className="stat-label">Categories</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Support</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{filteredFAQs.length}</div>
            <div className="stat-label">Matching Results</div>
          </div>
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
      </div>

      <div className="content-section">
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
    </div>
  );
}

export default FAQ;