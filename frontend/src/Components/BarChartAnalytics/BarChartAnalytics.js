import React from 'react';
import './BarChartAnalytics.css';

function BarChartAnalytics({ categoryStats, totalComplaints }) {
  // Helper to compute safe percentage width (avoid NaN)
  const getPercentage = (count) => {
    if (totalComplaints === 0) return '0%';
    return `${(count / totalComplaints) * 100}%`;
  };

  const getBarColor = (category) => {
    switch (category) {
      case 'lecture_materials': return '#3b82f6';
      case 'club_events': return '#10b981';
      case 'others': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'lecture_materials': return '📚';
      case 'club_events': return '🎉';
      case 'others': return '📝';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'lecture_materials': return 'Lecture Materials';
      case 'club_events': return 'Club Events';
      case 'others': return 'Others';
      default: return category.replace('_', ' ').toUpperCase();
    }
  };

  return (
    <div className="bar-chart-analytics">
      <h3>Complaints by Category</h3>
      <div className="chart-container">
        <div className="bar-chart">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="bar-item">
              <div className="bar-label">
                <span className="category-icon">{getCategoryIcon(category)}</span>
                <span className="category-name">{getCategoryLabel(category)}</span>
                <span className="category-count">({count})</span>
              </div>
              <div className="bar-visual">
                <div 
                  className="bar-fill" 
                  style={{
                    width: getPercentage(count),
                    backgroundColor: getBarColor(category)
                  }}
                >
                  <span className="bar-percentage">
                    {totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalComplaints === 0 && (
          <p className="no-data-message">No complaints submitted yet.</p>
        )}
      </div>
    </div>
  );
}

export default BarChartAnalytics;
