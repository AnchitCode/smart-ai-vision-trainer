import { useState, useEffect } from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import './AICoach.css';

const COACH_MESSAGES = [
  { text: 'Keep your back straight', type: 'correction' as const },
  { text: 'Perfect form!', type: 'praise' as const },
  { text: '3 reps left', type: 'info' as const },
  { text: 'Slow down on the descent', type: 'correction' as const },
  { text: 'Great depth!', type: 'praise' as const },
  { text: 'Set complete', type: 'info' as const },
];

export default function AICoach() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [waveActive, setWaveActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % COACH_MESSAGES.length);
      setWaveActive(true);
      setTimeout(() => setWaveActive(false), 1800);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const current = COACH_MESSAGES[activeIdx];

  return (
    <section className="coach" id="ai-coach">
      <ScrollReveal className="coach-inner" direction="up">
        {/* ── Left: text ── */}
        <div className="coach-text">
          <span className="section-label">AI Coach</span>
          <h2 className="section-heading">
            Your Personal <span className="text-neon">Voice Coach</span>
          </h2>
          <p className="section-description">
            Get real-time audio cues and on-screen guidance while you
            train. Our AI coach monitors your form, counts your reps,
            and speaks encouragement — like having a trainer beside you.
          </p>
        </div>

        {/* ── Right: voice simulator ── */}
        <div className="coach-simulator">
          <div className="coach-card">
            {/* Waveform */}
            <div className="coach-waveform">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className={`coach-bar ${waveActive ? 'coach-bar--active' : ''}`}
                  style={{ animationDelay: `${i * 40}ms` }}
                />
              ))}
            </div>

            {/* Message */}
            <div className="coach-message-wrapper">
              <div
                className={`coach-message coach-message--${current.type}`}
                key={activeIdx}
              >
                <span className="coach-message-icon">
                  {current.type === 'correction' && '⚠'}
                  {current.type === 'praise' && '✓'}
                  {current.type === 'info' && 'ℹ'}
                </span>
                <span className="coach-message-text">{current.text}</span>
              </div>
            </div>

            {/* Status */}
            <div className="coach-status-row">
              <span className="coach-status-dot" />
              <span className="coach-status-label">AI Coach Active</span>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
