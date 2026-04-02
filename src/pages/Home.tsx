import { Link } from 'react-router-dom';
import './Home.css';

/**
 * Home — Placeholder landing page.
 * Will be fully designed in Part 3 with hero, features, etc.
 */
export default function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <div className="home-hero-glow" aria-hidden="true" />

        <h1 className="home-heading anim-fade-in-up">
          Your AI-Powered
          <br />
          <span className="text-gradient">Fitness Coach</span>
        </h1>

        <p className="home-description anim-fade-in-up" style={{ animationDelay: '100ms' }}>
          Real-time pose detection, rep counting, and form analysis—all running
          locally in your browser. No downloads, no accounts, no limits.
        </p>

        <div className="home-cta-group anim-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Link to="/workout" className="home-cta-primary">
            Start Workout →
          </Link>
        </div>

        {/* ── Feature pills ── */}
        <div className="home-pills anim-fade-in-up" style={{ animationDelay: '300ms' }}>
          <span className="home-pill">🧠 AI Pose Detection</span>
          <span className="home-pill">🔢 Rep Counting</span>
          <span className="home-pill">✅ Form Validation</span>
          <span className="home-pill">🗣️ Voice Coach</span>
        </div>
      </section>
    </div>
  );
}
