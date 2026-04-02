import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from '../ThemeToggle';
import './Navbar.css';

/* ── Nav items ────────────────────────────────────────────── */
const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/workout', label: 'Workout', icon: '🏋️' },
  { to: '/history', label: 'History', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen((prev) => !prev);
  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="navbar-inner">
        {/* ── Logo / Brand ── */}
        <NavLink to="/" className="navbar-brand" onClick={closeMobile}>
          <span className="navbar-logo-icon" aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="#6c8eff" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
              <circle cx="16" cy="16" r="14" stroke="url(#logo-grad)" strokeWidth="2.5" fill="none" />
              <circle cx="16" cy="10" r="3" fill="url(#logo-grad)" />
              <path d="M10 26 C10 20 22 20 22 26" stroke="url(#logo-grad)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              <line x1="16" y1="14" x2="16" y2="22" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
              <line x1="11" y1="18" x2="21" y2="18" stroke="url(#logo-grad)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
          <span className="navbar-logo-text">AI Vision Trainer</span>
        </NavLink>

        {/* ── Desktop nav links ── */}
        <ul className="navbar-links">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `navbar-link ${isActive ? 'navbar-link--active' : ''}`
                }
              >
                <span className="navbar-link-icon" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* ── Right section (theme toggle + mobile hamburger) ── */}
        <div className="navbar-actions">
          <ThemeToggle />

          {/* Mobile hamburger */}
          <button
            type="button"
            className={`navbar-hamburger ${mobileOpen ? 'navbar-hamburger--open' : ''}`}
            onClick={toggleMobile}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`navbar-mobile-drawer ${mobileOpen ? 'navbar-mobile-drawer--open' : ''}`}
        aria-hidden={!mobileOpen}
      >
        <ul className="navbar-mobile-links">
          {NAV_ITEMS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `navbar-mobile-link ${isActive ? 'navbar-mobile-link--active' : ''}`
                }
                onClick={closeMobile}
              >
                <span className="navbar-link-icon" aria-hidden="true">{icon}</span>
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      {/* ── Mobile backdrop ── */}
      {mobileOpen && (
        <div className="navbar-backdrop" onClick={closeMobile} aria-hidden="true" />
      )}
    </nav>
  );
}
