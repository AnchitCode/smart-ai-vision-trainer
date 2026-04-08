import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './History.css';

type ExerciseSet = {
  id: string;
  exercise_type: string;
  reps: number;
};

type WorkoutSession = {
  id: string;
  start_time: string;
  end_time: string;
  total_reps: number;
  good_reps: number;
  bad_reps: number;
  exercise_sets: ExerciseSet[];
};

export default function History() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('workout_sessions')
          .select(`
            *,
            exercise_sets (
              id,
              exercise_type,
              reps
            )
          `)
          .order('start_time', { ascending: false });
        
        if (error) throw error;
        setSessions(data as WorkoutSession[]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch history.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchHistory();
  }, [user]);

  if (isLoading) {
    return (
      <div className="history-page">
        <div className="history-loading anim-pulse-glow">Fetching your progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-page">
        <div className="history-error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="history-page anim-fade-in-up">
      <div className="history-header">
        <h1 className="history-title">Your Progress</h1>
        <p className="history-subtitle">Track your workout history over time.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="history-empty glass-card">
          <span className="empty-icon">🌱</span>
          <p>You haven't completed any workouts yet.</p>
          <Link to="/workout" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '1rem' }}>Start Training</Link>
        </div>
      ) : (
        <div className="history-list">
          {sessions.map((session) => {
            const start = new Date(session.start_time);
            const end = new Date(session.end_time);
            const durationMins = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
            const accuracy = session.total_reps > 0 
              ? Math.round((session.good_reps / session.total_reps) * 100) 
              : 0;

            const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
            
            return (
              <div key={session.id} className="history-card glass-card hover-lift">
                <div className="history-card-header">
                  <div className="history-date">
                    <span className="date-main">{dateStr}</span>
                    <span className="date-time">{start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <div className="history-meta">
                    <span className="meta-pill duration">⏱ {durationMins} min</span>
                    <span className={`meta-pill accuracy ${accuracy >= 80 ? 'good' : 'fair'}`}>
                      🎯 {accuracy}% Form
                    </span>
                  </div>
                </div>

                <div className="history-card-body">
                  <div className="stat-block total">
                    <span className="stat-value">{session.total_reps}</span>
                    <span className="stat-label">Total Reps</span>
                  </div>
                  
                  <div className="exercise-breakdown">
                    {session.exercise_sets.map(set => (
                      <div key={set.id} className="exercise-row">
                        <span className="ex-type">{set.exercise_type}</span>
                        <span className="ex-reps">{set.reps} reps</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
