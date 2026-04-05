import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '../HomeNav/HomeNav';
import './MyComplaints.css';

function MyComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setComplaints(JSON.parse(localStorage.getItem('complaints') || '[]'));
  }, []);

  const statusMap = {
    resolved:    { label: 'Resolved',    cls: 'mc-badge--resolved' },
    in_progress: { label: 'In Progress', cls: 'mc-badge--progress' },
    pending:     { label: 'Pending',     cls: 'mc-badge--pending' },
  };

  const urgencyMap = {
    urgent: 'mc-urgency--urgent',
    high:   'mc-urgency--high',
    medium: 'mc-urgency--medium',
    low:    'mc-urgency--low',
  };

  const catIcon = {
    lecture_materials: '📚',
    club_events:       '🎉',
    others:            '📝',
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const filtered = complaints.filter(c => filter === 'all' || c.status === filter);

  const handleEdit = (c) => {
    if (c.status !== 'pending') { alert('Only pending complaints can be edited.'); return; }
    navigate('/complaint-form', { state: { complaint: c } });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this complaint?')) return;
    const updated = complaints.filter(c => c.id !== id);
    setComplaints(updated);
    localStorage.setItem('complaints', JSON.stringify(updated));
  };

  const stats = [
    { label: 'Total',       count: complaints.length,                                    cls: 'mc-stat--total' },
    { label: 'Pending',     count: complaints.filter(c => c.status === 'pending').length, cls: 'mc-stat--pending' },
    { label: 'In Progress', count: complaints.filter(c => c.status === 'in_progress').length, cls: 'mc-stat--progress' },
    { label: 'Resolved',    count: complaints.filter(c => c.status === 'resolved').length, cls: 'mc-stat--resolved' },
  ];

  return (
    <div className="mc-page">
      <Navigation />

      {/* ── Hero ── */}
      <div className="mc-hero">
        <div className="mc-hero__inner">
          <h1 className="mc-hero__title">My Complaints</h1>
          <p className="mc-hero__sub">Track and manage your submitted complaints</p>
          <div className="mc-hero__actions">
            <button onClick={() => navigate('/studentsupport')} className="mc-btn mc-btn--ghost">
              ← Back to Support
            </button>
            <button onClick={() => navigate('/complaint-form')} className="mc-btn mc-btn--primary">
              + New Complaint
            </button>
          </div>
        </div>
      </div>

      <div className="mc-body">

        {/* ── Stats ── */}
        <div className="mc-stats">
          {stats.map(s => (
            <div key={s.label} className={`mc-stat ${s.cls}`}>
              <span className="mc-stat__num">{s.count}</span>
              <span className="mc-stat__label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Filter ── */}
        <div className="mc-filter">
          <span className="mc-filter__label">Filter by status</span>
          <div className="mc-filter__pills">
            {['all', 'pending', 'in_progress', 'resolved'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`mc-pill ${filter === f ? 'mc-pill--active' : ''}`}
              >
                {f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        {filtered.length > 0 ? (
          <div className="mc-list">
            {filtered.map(c => {
              const sm = statusMap[c.status] || statusMap.pending;
              const um = urgencyMap[c.urgency] || 'mc-urgency--medium';
              return (
                <div key={c.id} className="mc-card">
                  <div className="mc-card__top">
                    <div className="mc-card__title-row">
                      <span className="mc-card__icon">{catIcon[c.category] || '📋'}</span>
                      <h3 className="mc-card__title">{c.title}</h3>
                    </div>
                    <div className="mc-card__badges">
                      <span className={`mc-badge ${sm.cls}`}>{sm.label}</span>
                      <span className={`mc-urgency ${um}`}>{c.urgency?.toUpperCase()}</span>
                    </div>
                  </div>

                  <p className="mc-card__desc">{c.description}</p>

                  <div className="mc-card__footer">
                    <div className="mc-card__meta">
                      <span className="mc-meta__cat">{c.category?.replace('_', ' ').toUpperCase()}</span>
                      <span className="mc-meta__date">🕐 {formatDate(c.submittedDate)}</span>
                      {c.contactEmail && <span className="mc-meta__contact">📧 {c.contactEmail}</span>}
                      {c.contactPhone && <span className="mc-meta__contact">📞 {c.contactPhone}</span>}
                    </div>
                    <div className="mc-card__actions">
                      <button
                        className="mc-btn mc-btn--edit"
                        onClick={() => handleEdit(c)}
                        disabled={c.status !== 'pending'}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="mc-btn mc-btn--delete"
                        onClick={() => handleDelete(c.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mc-empty">
            <div className="mc-empty__icon">📋</div>
            <h3 className="mc-empty__title">No complaints found</h3>
            <p className="mc-empty__sub">
              {filter === 'all'
                ? "You haven't submitted any complaints yet."
                : `No ${filter.replace('_', ' ')} complaints found.`}
            </p>
            <button onClick={() => navigate('/complaint-form')} className="mc-btn mc-btn--primary">
              Submit First Complaint
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

export default MyComplaints;
