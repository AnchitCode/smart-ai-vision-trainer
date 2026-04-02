import { useState, useEffect } from 'react';
import ScrollReveal from '../ui/ScrollReveal';
import './LiveDemo.css';

/**
 * LiveDemo — Fake animated HUD showing a simulated workout interface.
 */
export default function LiveDemo() {
  const [reps, setReps] = useState(0);
  const [timer, setTimer] = useState(0);
  const [formStatus, setFormStatus] = useState<'good' | 'fix'>('good');

  // Simulate rep counter
  useEffect(() => {
    const interval = setInterval(() => {
      setReps((prev) => (prev >= 12 ? 0 : prev + 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Simulate timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate form feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setFormStatus((prev) => (prev === 'good' ? 'fix' : 'good'));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <section className="demo" id="live-demo">
      <div className="demo-inner">
        {/* ── Left: HUD simulator ── */}
        <ScrollReveal direction="left" className="demo-hud-wrapper">
          <div className="demo-hud">
            {/* Top bar */}
            <div className="hud-topbar">
              <span className="hud-badge hud-badge--live">
                <span className="hud-live-dot" />
                LIVE
              </span>
              <span className="hud-timer">{formatTime(timer)}</span>
            </div>

            {/* Fake camera view */}
            <div className="hud-viewport">
              <div className="hud-viewport-grid" />
              <div className="hud-crosshair" />

              {/* Overlay metrics */}
              <div className="hud-overlay-metric hud-overlay-metric--reps">
                <span className="hud-metric-label">REPS</span>
                <span className="hud-metric-value">{reps}</span>
              </div>

              <div className="hud-overlay-metric hud-overlay-metric--form">
                <span className="hud-metric-label">FORM</span>
                <span className={`hud-metric-value hud-form--${formStatus}`}>
                  {formStatus === 'good' ? '✓ Good' : '⚠ Fix Posture'}
                </span>
              </div>

              {/* Scan line */}
              <div className="hud-scanline" />
            </div>

            {/* Bottom stats */}
            <div className="hud-bottombar">
              <div className="hud-stat-item">
                <span className="hud-stat-label">Exercise</span>
                <span className="hud-stat-val">Push-ups</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-label">Set</span>
                <span className="hud-stat-val">2 / 3</span>
              </div>
              <div className="hud-stat-item">
                <span className="hud-stat-label">Accuracy</span>
                <span className="hud-stat-val hud-stat-val--accent">94%</span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Right: Text ── */}
        <ScrollReveal direction="right" delay={200} className="demo-text">
          <span className="section-label">Live AI Demo</span>
          <h2 className="section-heading">
            See It In <span className="text-neon">Action</span>
          </h2>
          <p className="section-description">
            Our AI engine processes your camera feed in real-time, detecting 33
            body landmarks with sub-50ms latency. Watch the rep counter tick,
            get instant form feedback, and track your sets — all running locally
            in your browser.
          </p>

          <ul className="demo-features-list">
            <li className="demo-feature-item">
              <span className="demo-feature-icon">🎯</span>
              <div>
                <strong>Real-time Tracking</strong>
                <p>33 body landmarks detected every frame</p>
              </div>
            </li>
            <li className="demo-feature-item">
              <span className="demo-feature-icon">⚡</span>
              <div>
                <strong>Instant Feedback</strong>
                <p>Form correction as you move</p>
              </div>
            </li>
            <li className="demo-feature-item">
              <span className="demo-feature-icon">🔒</span>
              <div>
                <strong>100% Private</strong>
                <p>Nothing leaves your device</p>
              </div>
            </li>
          </ul>
        </ScrollReveal>
      </div>
    </section>
  );
}
