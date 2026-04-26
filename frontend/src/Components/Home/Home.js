import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navigation from "../HomeNav/HomeNav";
import ClubGrid from "../ClubGrid/ClubGrid.js";
import ImageSlider from "../ImageSlider/ImageSlider";
import { clubData } from "../../data/clubData.js";
import "./Home.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

function getUser() {
  try { return JSON.parse(localStorage.getItem("user")); }
  catch { return null; }
}

const RANK_META = [
  { badge: "🥇", cls: "lb-gold",   avatarCls: "lb-av--gold"   },
  { badge: "🥈", cls: "lb-silver", avatarCls: "lb-av--silver" },
  { badge: "🥉", cls: "lb-bronze", avatarCls: "lb-av--bronze" },
];

const FEATURES = {
  guest: [
    { icon: "📖", title: "Learning Resources", desc: "Access and share important study materials and PDFs.", link: "/resources",     btn: "View Resources"  },
    { icon: "🎓", title: "Student Support",    desc: "Book consultants and get the help you need.",          link: "/studentsupport", btn: "Get Support"     },
    { icon: "✨", title: "Join Us",            desc: "Create an account to access all features.",            link: "/userRegister",   btn: "Register Now"   },
  ],
  student: [
    { icon: "📖", title: "Learning Resources", desc: "Access study materials, PDFs and module quizzes.",     link: "/resources",     btn: "View Resources"  },
    { icon: "🎓", title: "Student Support",    desc: "Book a consultant session or raise a complaint.",      link: "/studentsupport", btn: "Get Support"     },
    { icon: "👤", title: "My Profile",         desc: "View your profile, societies and modules.",            link: null,             btn: "My Profile"      },
  ],
  admin: [
    { icon: "⚙️", title: "Admin Dashboard",   desc: "Manage users, societies, resources and quizzes.",      link: "/admin",         btn: "Go to Dashboard" },
    { icon: "📋", title: "Complaint Handling", desc: "Review and resolve student complaints.",               link: "/admin",         btn: "View Complaints" },
    { icon: "📁", title: "Resources",          desc: "Manage faculties, modules and uploaded PDFs.",         link: "/admin",         btn: "Manage Resources"},
  ],
};

const ANNOUNCEMENTS = [
  { icon: "📢", title: "Workshop Registrations Open",   body: "New workshop registrations are now open. Sign up before slots fill up." },
  { icon: "📚", title: "Updated Study Materials",       body: "Updated PDF notes are now available in the resources section for all modules." },
  { icon: "🎓", title: "Community Meeting This Friday", body: "Student community meeting scheduled for this Friday at 3 PM in Hall A." },
  { icon: "🏆", title: "Quiz Season Begins",            body: "Monthly quiz competition has started. Check your profile for available quizzes." },
];

function Home() {
  const user   = getUser();
  const role   = user?.role?.trim().toLowerCase();
  const isStudent = role === "student";
  const isAdmin   = role === "admin" || role === "administrator";

  const featureKey = isStudent ? "student" : isAdmin ? "admin" : "guest";
  const features   = FEATURES[featureKey];

  // patch student profile link
  if (isStudent) {
    features[2].link = `/studentprofile/${user._id}`;
  }

  const sliderImages = [
    {
      src: "https://images.unsplash.com/photo-1562774053-701939374585?w=1600&q=90",
      alt: "University Campus",
      title: "Welcome to Uni Hub",
      description: "Your comprehensive platform for learning, collaboration, and student success",
      buttonText: isStudent ? "My Profile" : isAdmin ? "Dashboard" : "Get Started",
      buttonLink: isStudent ? `/studentprofile/${user._id}` : isAdmin ? "/admin" : "/userRegister",
    },
    {
      src: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=90",
      alt: "Students Learning",
      title: "Excellence in Education",
      description: "Access quality resources, expert guidance, and a supportive community",
      buttonText: "Explore Resources",
      buttonLink: "/resources",
    },
    {
      src: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1600&q=90",
      alt: "University Life",
      title: "Grow Beyond the Classroom",
      description: "Join clubs, book consultants, and build your future with UniHub",
      buttonText: "Student Support",
      buttonLink: "/studentsupport",
    },
  ];

  // Leaderboard state
  const [leaders, setLeaders]     = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [lbPeriod, setLbPeriod]   = useState("monthly");

  useEffect(() => {
    axios.get(`${API}/student-quiz/leaderboard`)
      .then((r) => setLeaders(r.data.leaderboard || []))
      .catch(() => {})
      .finally(() => setLbLoading(false));
  }, []);

  const top5      = leaders.slice(0, 5);
  const maxScore  = leaders[0]?.totalScore || 1;
  const myEntry   = isStudent ? leaders.find((l) => l._id === user?._id) : null;
  const myRank    = myEntry ? leaders.indexOf(myEntry) + 1 : null;
  const myAvg     = myEntry && myEntry.attempts > 0
    ? Math.round((myEntry.totalScore / myEntry.attempts))
    : 0;

  return (
    <div className="home-page">
      <Navigation />

      {/* ── Hero Slider ── */}
      <ImageSlider images={sliderImages} />

      {/* ── Student Life / Clubs ── */}
      <section className="campus-life-section">
        <div className="campus-life-header">
          <span className="campus-life-kicker">Student Life</span>
          <h2>Discover Communities That Shape Campus Life</h2>
          <p>
            Explore student clubs and university communities that help you compete,
            connect, create, and grow beyond the classroom.
          </p>
        </div>
        <ClubGrid clubs={clubData} />
      </section>

      {/* ── Features ── */}
      <section className="home-features-section">
        <div className="home-section-header">
          <span className="home-kicker">Quick Access</span>
          <h2>Everything You Need, In One Place</h2>
          <p>Navigate the most important parts of Uni Hub instantly.</p>
        </div>
        <div className="features">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-card__icon-wrap">
                <span className="feature-card__icon">{f.icon}</span>
              </div>
              <div className="feature-card__body">
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
                <Link to={f.link || "#"}>
                  <button className="feature-btn">{f.btn}</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Leaderboard ── */}
      <section className="home-lb-section">
        <div className="home-lb-inner">
          {/* Section header */}
          <div className="home-lb-header">
            <div>
              <span className="home-kicker home-kicker--light">Rankings</span>
              <h2 className="home-lb-title">🏆 Student Leaderboard</h2>
              <p className="home-lb-sub">Top performing students in Uni Hub this month</p>
            </div>
            <div className="home-lb-period-tabs">
              <button
                className={lbPeriod === "weekly"  ? "active" : ""}
                onClick={() => setLbPeriod("weekly")}
              >Weekly</button>
              <button
                className={lbPeriod === "monthly" ? "active" : ""}
                onClick={() => setLbPeriod("monthly")}
              >Monthly</button>
            </div>
          </div>

          <div className="home-lb-panels">
            {/* LEFT — Top 5 list */}
            <div className="home-lb-left">
              <div className="home-lb-list-title">Top Performers</div>
              {lbLoading && <div className="home-lb-empty">Loading…</div>}
              {!lbLoading && top5.length === 0 && (
                <div className="home-lb-empty">No quiz attempts yet. Be the first! 🎯</div>
              )}
              {!lbLoading && top5.map((s, idx) => {
                const meta   = RANK_META[idx];
                const barPct = Math.round((s.totalScore / maxScore) * 100);
                const isMe   = isStudent && s._id === user?._id;
                return (
                  <div key={s._id} className={`home-lb-row ${meta ? meta.cls : ""} ${isMe ? "home-lb-row--me" : ""}`}>
                    <div className="home-lb-row-rank">
                      {meta
                        ? <span className="home-lb-medal">{meta.badge}</span>
                        : <span className="home-lb-num">#{idx + 1}</span>
                      }
                    </div>
                    <div className={`home-lb-av ${meta ? meta.avatarCls : ""}`}>
                      {s.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="home-lb-row-info">
                      <div className="home-lb-row-name">
                        {s.name}
                        {isMe && <span className="home-lb-you">You</span>}
                      </div>
                      <div className="home-lb-bar-wrap">
                        <div className="home-lb-bar" style={{ width: `${barPct}%` }} />
                      </div>
                    </div>
                    <div className="home-lb-row-score">
                      <span className="home-lb-pts">{s.totalScore}</span>
                      <span className="home-lb-pts-lbl">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — My rank card or CTA */}
            <div className="home-lb-right">
              {isStudent && myEntry ? (
                <div className="home-lb-my-card">
                  <div className="home-lb-my-avatar">
                    {user.name?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div className="home-lb-my-name">{user.name}</div>
                  <div className="home-lb-my-role">Your Performance</div>

                  <div className="home-lb-my-stats">
                    <div className="home-lb-my-stat">
                      <span className="home-lb-my-val">#{myRank}</span>
                      <span className="home-lb-my-lbl">Rank</span>
                    </div>
                    <div className="home-lb-my-divider" />
                    <div className="home-lb-my-stat">
                      <span className="home-lb-my-val">{myEntry.totalScore}</span>
                      <span className="home-lb-my-lbl">Score</span>
                    </div>
                    <div className="home-lb-my-divider" />
                    <div className="home-lb-my-stat">
                      <span className="home-lb-my-val">{myAvg}</span>
                      <span className="home-lb-my-lbl">Avg/Quiz</span>
                    </div>
                  </div>

                  <div className="home-lb-progress-wrap">
                    <div className="home-lb-progress-label">
                      <span>Your score vs top</span>
                      <span>{Math.round((myEntry.totalScore / maxScore) * 100)}%</span>
                    </div>
                    <div className="home-lb-progress-track">
                      <div
                        className="home-lb-progress-fill"
                        style={{ width: `${Math.round((myEntry.totalScore / maxScore) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="home-lb-streak">🔥 Keep going — you're in the top {myRank <= 3 ? "3" : myRank <= 10 ? "10" : "ranks"}!</div>

                  <Link to={`/studentprofile/${user._id}`} className="home-lb-cta-btn">
                    View Full Leaderboard →
                  </Link>
                </div>
              ) : (
                <div className="home-lb-guest-card">
                  <div className="home-lb-guest-icon">🏆</div>
                  <h3>Join the Rankings</h3>
                  <p>Complete quizzes to earn points and climb the leaderboard. Top students get recognized every month.</p>
                  {!user ? (
                    <Link to="/userRegister" className="home-lb-cta-btn">Get Started →</Link>
                  ) : (
                    <Link to="/resources" className="home-lb-cta-btn">Take a Quiz →</Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Announcements ── */}
      <section className="announcements">
        <div className="home-section-header home-section-header--light">
          <span className="home-kicker home-kicker--light">Updates</span>
          <h2>Latest Announcements</h2>
          <p>Stay up to date with what's happening across Uni Hub.</p>
        </div>
        <div className="announcements-grid">
          {ANNOUNCEMENTS.map((a) => (
            <div key={a.title} className="announcement-card">
              <div className="announcement-card__icon">{a.icon}</div>
              <div className="announcement-card__body">
                <h4>{a.title}</h4>
                <p>{a.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-inner">
          <span className="footer-brand">🎓 Uni Hub</span>
          <p>&copy; 2026 Uni Hub. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
