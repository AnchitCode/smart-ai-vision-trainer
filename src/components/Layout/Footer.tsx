import { NavLink } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* ── Brand ── */}
        <div className="footer-brand">
          <span className="footer-brand-text">AI Vision Trainer</span>
          <p className="footer-tagline">
            Real-time AI-powered fitness coaching in your browser.
          </p>
        </div>

        {/* ── Quick links ── */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Navigate</h4>
          <ul className="footer-links">
            <li><NavLink to="/" className="footer-link">Home</NavLink></li>
            <li><NavLink to="/workout" className="footer-link">Workout</NavLink></li>
            <li><NavLink to="/history" className="footer-link">History</NavLink></li>
            <li><NavLink to="/settings" className="footer-link">Settings</NavLink></li>
          </ul>
        </div>

        {/* ── Features ── */}
        <div className="footer-links-group">
          <h4 className="footer-heading">Features</h4>
          <ul className="footer-links">
            <li><span className="footer-link footer-link--static">Pose Detection</span></li>
            <li><span className="footer-link footer-link--static">Rep Counting</span></li>
            <li><span className="footer-link footer-link--static">Form Analysis</span></li>
            <li><span className="footer-link footer-link--static">Voice Coach</span></li>
          </ul>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="footer-bottom">
        <p>© {year} Smart AI Vision Trainer. All rights reserved.</p>
      </div>
    </footer>
  );
}
