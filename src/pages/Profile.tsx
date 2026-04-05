import { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { processProfileData } from '../utils/profileMath';
import type { WorkoutSessionRaw, ExerciseSetRaw } from '../utils/profileMath';
import './Profile.css';

export default function Profile() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSessionRaw[]>([]);
  const [sets, setSets] = useState<ExerciseSetRaw[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      try {
        const { data: sData, error: sErr } = await supabase
          .from("workout_sessions")
          .select("*")
          .eq("user_id", user.id);
        
        if (sErr) throw sErr;
        const validSessions = (sData || []) as WorkoutSessionRaw[];
        setSessions(validSessions);

        if (validSessions.length > 0) {
          const sessionIds = validSessions.map((s) => s.id);
          const { data: setsData, error: setErr } = await supabase
            .from("exercise_sets")
            .select("*")
            .in("session_id", sessionIds);

          if (setErr) throw setErr;
          setSets((setsData || []) as ExerciseSetRaw[]);
        }
      } catch (err: any) {
        console.error("Failed fetching profile data", err);
        setError(err.message || 'Failed to fetch profile data.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [user]);

  // Rely strictly on processProfileData for the baseline metrics needed
  const stats = useMemo(() => processProfileData(sessions, sets), [sessions, sets]);

  if (isLoading) {
    return (
      <div className="profile-container">
        <div className="profile-loading anim-pulse-glow">Loading Account Details...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-container">
        <div className="profile-error">Error: {error || 'User not authenticated'}</div>
      </div>
    );
  }

  const email = user.email || 'user@example.com';
  const initial = email.charAt(0).toUpperCase();
  const rawName = email.split('@')[0];
  const createdDate = new Date(user.created_at);
  const joinDateFormated = `${createdDate.getDate()} ${createdDate.toLocaleString('default', { month: 'long' })} ${createdDate.getFullYear()}`;

  return (
    <div className="profile-container anim-fade-in-up">
      
      {/* ── Hero Banner ── */}
      <div className="hero-header glass-card">
        <div className="hero-left">
          <span className="identity-badge-top">FITNESS IDENTITY</span>
          <h1 className="hero-title">Profile</h1>
          <p className="hero-subtitle">
            Manage your account details, security settings, and view your overarching fitness summary.
          </p>
        </div>
        <div className="hero-right">
          <span className="auth-label">AUTHENTICATED AS</span>
          <span className="auth-name">{rawName}</span>
          <span className="auth-date">Since {joinDateFormated}</span>
        </div>
      </div>

      {/* ── 2-Column Responsive Grid ── */}
      <div className="profile-grid">
        
        {/* Left Column */}
        <div className="profile-left-col">
          
          {/* Identity Card */}
          <div className="prof-card identity-block">
            <div className="avatar-huge-wrap">
              <div className="avatar-huge-ring"></div>
              <div className="avatar-huge-circle">{initial}</div>
              <div className="status-dot-green"></div>
            </div>
            
            <h2>{rawName}</h2>
            <p className="email-blue">{email}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <span className="acc-status-lbl">ACCOUNT STATUS</span>
              <span className="status-pill">● ACTIVE MEMBER</span>
            </div>

            <div className="divider"></div>
            <span className="joined-text">Joined <strong>{joinDateFormated}</strong></span>
          </div>

          {/* Fitness Summary Card */}
          <div className="prof-card">
            <div className="fit-sum-head">
              <div className="fit-icon">⚡</div>
              <div className="fit-head-text">
                <h3>Fitness Summary</h3>
                <span className="fit-sub">YOUR PROGRESSION</span>
              </div>
            </div>
            
            <div className="info-list">
              <div className="info-row">
                <span className="row-left">🔥 Workout Streak</span>
                <span className="row-right"><strong>{stats.currentStreak || 0}</strong> days</span>
              </div>
              <div className="info-row">
                <span className="row-left">🏆 Sessions Logged</span>
                <span className="row-right"><strong>{stats.totalSessions || 0}</strong> total</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div className="profile-right-col">
          
          {/* Account Details Card */}
          <div className="prof-card">
            <h3 className="card-title-simple"><span>🪪</span> Account Details</h3>
            
            <div className="detail-blocks">
              <div className="detail-block">
                <div className="detail-icon-wrap">👤</div>
                <div className="dt-info">
                  <span className="dt-lbl">FULL NAME</span>
                  <span className="dt-val">{rawName}</span>
                </div>
              </div>

              <div className="detail-block">
                <div className="detail-icon-wrap">✉️</div>
                <div className="dt-info">
                  <span className="dt-lbl">EMAIL ADDRESS</span>
                  <span className="dt-val">{email}</span>
                </div>
              </div>

              <div className="detail-block">
                <div className="detail-icon-wrap">📅</div>
                <div className="dt-info">
                  <span className="dt-lbl">ACCOUNT CREATED</span>
                  <span className="dt-val">{joinDateFormated}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Session Card */}
          <div className="prof-card">
            <h3 className="card-title-simple"><span>🔒</span> Security & Session</h3>
            <p className="security-desc">
              Logging out clears your active local session token. You will need to re-authenticate to safely resume tracking your fitness metrics.
            </p>
            <button className="btn-logout" onClick={() => supabase.auth.signOut()}>
              SECURE LOGOUT ➡️
            </button>
          </div>

        </div>
      </div>
      
    </div>
  );
}
