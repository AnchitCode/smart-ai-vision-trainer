import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import './Settings.css';

export default function Settings() {
  const { theme } = useTheme();

  return (
    <div className="placeholder-page">
      <div className="placeholder-card glass-card anim-fade-in-up">
        <span className="placeholder-icon">⚙️</span>
        <h2 className="placeholder-title">Settings</h2>
        <p className="placeholder-text">
          More settings are coming soon. For now, you can toggle the app theme.
        </p>

        {/* ── Theme setting preview ── */}
        <div className="settings-row">
          <div className="settings-row-label">
            <span className="settings-row-icon">🎨</span>
            <div>
              <p className="settings-row-title">Appearance</p>
              <p className="settings-row-desc">
                Currently using <strong>{theme === 'dark' ? 'Dark' : 'Light'}</strong> mode
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>

        <div className="placeholder-badge">More Coming Soon</div>
      </div>
    </div>
  );
}
