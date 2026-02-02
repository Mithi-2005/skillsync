import React from 'react';
import { useNavigate } from 'react-router-dom';
import './landing.css'; 

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-container">
      <div className="landing-bg-effects">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <nav className="landing-nav">
        <div className="landing-logo">SkillSync</div>
        <div className="nav-actions">
          <button className="btn-login-glass" onClick={() => navigate('/login')}>
            Login
          </button>
        </div>
      </nav>

      <header className="landing-hero">
        <div className="hero-badge">✨ The Apex of Collaboration</div>
        <h1 className="hero-title">
          Forge Teams. <br />
          Ignite Ideas. <br />
          <span>Build The Future.</span>
        </h1>
        <p className="hero-subtitle">
          Stop settling for random groups. SkillSync leverages intelligent matching and real-time hubs to connect you with the elite peers your ambitions demand.
        </p>
        
        <div className="cta-group">
          <button className="btn-primary-rich" onClick={() => navigate('/signup')}>
            Start Your Journey
          </button>
        </div>

        <div className="hero-visual-container">
             <div className="glass-platform-main">
                 <div className="connection-line-glow cl-1"></div>
                 <div className="connection-line-glow cl-2"></div>
             </div>
             <div className="floating-card fc-1">
                 <span>Connect</span>
             </div>
             <div className="floating-card fc-2">
                 <span>Build</span>
             </div>
        </div>
      </header>

      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card-premium">
            <div className="feature-content">
                <div className="feature-icon-box">⚡</div>
                <h3>Quantum Sync Chat</h3>
                <p>Experience zero-latency collaboration with active presence indicators and seamless, secure real-time messaging infrastructure.</p>
            </div>
          </div>
          <div className="feature-card-premium">
            <div className="feature-content">
                <div className="feature-icon-box">🧠</div>
                <h3>Neural Matching</h3>
                <p>Our algorithms analyze skills and project goals to curate the perfect team. Stop searching; start building.</p>
            </div>
          </div>
          <div className="feature-card-premium">
            <div className="feature-content">
                <div className="feature-icon-box">💎</div>
                <h3>Elite Identity</h3>
                <p>Showcase your capabilities with stunning glassmorphic profile cards designed to highlight your expertise across campus.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        © 2025 SkillSync. Architected for Excellence.
      </footer>
    </div>
  );
}

export default LandingPage;