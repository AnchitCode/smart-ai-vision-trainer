import { Link } from 'react-router-dom';
import ScrollReveal from '../ui/ScrollReveal';
import './FinalCTA.css';

export default function FinalCTA() {
  return (
    <section className="final-cta" id="final-cta">
      {/* Background glow */}
      <div className="final-cta-bg" aria-hidden="true">
        <div className="final-cta-orb final-cta-orb--1" />
        <div className="final-cta-orb final-cta-orb--2" />
      </div>

      <ScrollReveal className="final-cta-content" direction="up">
        <span className="section-label">Get Started</span>

        <h2 className="final-cta-heading">
          Ready to Train
          <br />
          <span className="hero-heading-neon">Smarter?</span>
        </h2>

        <p className="final-cta-subtext">
          Free to sign up. No downloads. Just open your browser and start
          training with AI-powered precision.
        </p>

        <Link to="/auth" className="final-cta-button">
          <span>Create Free Account</span>
          <span className="final-cta-arrow">→</span>
        </Link>
      </ScrollReveal>
    </section>
  );
}
