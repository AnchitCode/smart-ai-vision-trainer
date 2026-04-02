import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" id="hero">
      {/* ── Animated background layers ── */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-glow hero-glow--1" />
        <div className="hero-glow hero-glow--2" />
        <div className="hero-glow hero-glow--3" />
        <div className="hero-grid" />
      </div>

      {/* ── Pose detection node overlay ── */}
      <div className="hero-nodes" aria-hidden="true">
        <svg className="hero-nodes-svg" viewBox="0 0 400 500" fill="none">
          {/* Head */}
          <circle cx="200" cy="60" r="6" className="node node--head" />
          {/* Shoulders */}
          <circle cx="140" cy="130" r="5" className="node" />
          <circle cx="260" cy="130" r="5" className="node" />
          {/* Elbows */}
          <circle cx="90" cy="200" r="4.5" className="node" />
          <circle cx="310" cy="200" r="4.5" className="node" />
          {/* Wrists */}
          <circle cx="60" cy="270" r="4" className="node" />
          <circle cx="340" cy="270" r="4" className="node" />
          {/* Hips */}
          <circle cx="160" cy="260" r="5" className="node" />
          <circle cx="240" cy="260" r="5" className="node" />
          {/* Knees */}
          <circle cx="150" cy="360" r="4.5" className="node" />
          <circle cx="250" cy="360" r="4.5" className="node" />
          {/* Ankles */}
          <circle cx="140" cy="450" r="4" className="node" />
          <circle cx="260" cy="450" r="4" className="node" />

          {/* Connections */}
          <line x1="200" y1="60" x2="140" y2="130" className="bone" />
          <line x1="200" y1="60" x2="260" y2="130" className="bone" />
          <line x1="140" y1="130" x2="260" y2="130" className="bone" />
          <line x1="140" y1="130" x2="90" y2="200" className="bone" />
          <line x1="260" y1="130" x2="310" y2="200" className="bone" />
          <line x1="90" y1="200" x2="60" y2="270" className="bone" />
          <line x1="310" y1="200" x2="340" y2="270" className="bone" />
          <line x1="140" y1="130" x2="160" y2="260" className="bone" />
          <line x1="260" y1="130" x2="240" y2="260" className="bone" />
          <line x1="160" y1="260" x2="240" y2="260" className="bone" />
          <line x1="160" y1="260" x2="150" y2="360" className="bone" />
          <line x1="240" y1="260" x2="250" y2="360" className="bone" />
          <line x1="150" y1="360" x2="140" y2="450" className="bone" />
          <line x1="250" y1="360" x2="260" y2="450" className="bone" />
        </svg>
      </div>

      {/* ── Content ── */}
      <div className="hero-content">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>AI-Powered Fitness</span>
        </div>

        <h1 className="hero-heading">
          Train With
          <br />
          <span className="hero-heading-neon">AI Precision</span>
        </h1>

        <p className="hero-subtext">
          Real-time pose detection. Smart rep counting.
          <br />
          Perfect your form.
        </p>

        <div className="hero-cta-group">
          <Link to="/workout" className="hero-cta-primary">
            Start Training
            <span className="hero-cta-arrow">→</span>
          </Link>
        </div>

        {/* ── Stat pills ── */}
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-value">33</span>
            <span className="hero-stat-label">FPS Detection</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">&lt;50ms</span>
            <span className="hero-stat-label">Latency</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-value">100%</span>
            <span className="hero-stat-label">Client-side</span>
          </div>
        </div>
      </div>
    </section>
  );
}
