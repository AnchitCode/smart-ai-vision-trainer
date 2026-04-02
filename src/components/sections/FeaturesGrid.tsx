import ScrollReveal from '../ui/ScrollReveal';
import './FeaturesGrid.css';

const FEATURES = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="8" r="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M8 28c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="16" y1="12" x2="16" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <line x1="10" y1="16" x2="22" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.3"/>
      </svg>
    ),
    title: 'AI Pose Detection',
    description: 'MediaPipe-powered 33-landmark detection running at 30+ FPS entirely in your browser.',
    tag: 'Core Engine',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="6" width="24" height="20" rx="3" stroke="currentColor" strokeWidth="2"/>
        <path d="M12 16l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Rep Counting',
    description: 'Automatic rep detection using joint angle analysis. No manual counting needed.',
    tag: 'Tracking',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="6" stroke="currentColor" strokeWidth="2"/>
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4"/>
      </svg>
    ),
    title: 'Form Correction',
    description: 'Instant visual and audio feedback when your form deviates from the ideal range.',
    tag: 'Analysis',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M6 22c2-4 4-8 6-2s4-12 6-4 4-6 6-2 2 4 2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="16" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    title: 'Voice Coaching',
    description: 'Speech synthesis provides hands-free coaching cues as you exercise.',
    tag: 'AI Coach',
  },
];

export default function FeaturesGrid() {
  return (
    <section className="features" id="features">
      <ScrollReveal className="features-header" direction="up">
        <span className="section-label">Features</span>
        <h2 className="section-heading">
          Built for <span className="text-neon">Precision</span>
        </h2>
        <p className="section-description features-description">
          Every component is engineered for real-time performance and
          accuracy. Here's what powers your training sessions.
        </p>
      </ScrollReveal>

      <div className="features-grid">
        {FEATURES.map((feature, i) => (
          <ScrollReveal key={feature.title} delay={i * 100} direction="up">
            <div className="feature-card">
              <div className="feature-card-glow" aria-hidden="true" />
              <div className="feature-icon">{feature.icon}</div>
              <div className="feature-tag">{feature.tag}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-desc">{feature.description}</p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
