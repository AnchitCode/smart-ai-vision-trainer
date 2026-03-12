import React from 'react';
import type { WorkoutSession } from '../engine/workoutTracker';

type WorkoutSummaryProps = {
  session: WorkoutSession;
};

function formatDuration(startTime: number | null, endTime: number | null): string {
  if (!startTime || !endTime || endTime < startTime) return '0s';
  const totalSeconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ session }) => {
  const { totalReps, goodReps, badReps, startTime, endTime } = session;
  const accuracy =
    totalReps > 0 ? Math.round((goodReps / totalReps) * 100) : 0;
  const durationLabel = formatDuration(startTime, endTime);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Workout Summary</h2>
      <div style={styles.card}>
        <div style={styles.row}>
          <span style={styles.label}>Total Reps</span>
          <span style={styles.value}>{totalReps}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Good Form</span>
          <span style={{ ...styles.value, color: '#4ade80' }}>{goodReps}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Bad Form</span>
          <span style={{ ...styles.value, color: '#f97373' }}>{badReps}</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Accuracy</span>
          <span style={styles.value}>{accuracy}%</span>
        </div>
        <div style={styles.row}>
          <span style={styles.label}>Duration</span>
          <span style={styles.value}>{durationLabel}</span>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '100%',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#f9fafb',
    background:
      'radial-gradient(circle at top, rgba(148,163,255,0.35), transparent 55%), #020617',
  },
  title: {
    marginBottom: '24px',
    fontSize: '28px',
    fontWeight: 700,
    letterSpacing: '0.03em',
  },
  card: {
    minWidth: '260px',
    maxWidth: '360px',
    padding: '20px 24px',
    borderRadius: '16px',
    background: 'rgba(15,23,42,0.95)',
    boxShadow: '0 18px 45px rgba(15,23,42,0.8)',
    border: '1px solid rgba(148,163,255,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '16px',
  },
  label: {
    opacity: 0.8,
  },
  value: {
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
  },
};

export default WorkoutSummary;

