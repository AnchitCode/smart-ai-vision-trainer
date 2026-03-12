import React from 'react';
import type { FormStatus } from '../../engine/formValidator';
import { getExerciseLabel, type ExerciseType } from '../../types/exercise';

export type HUDProps = {
  exercise: ExerciseType;
  reps: number;
  formStatus: FormStatus;
};

export const HUD: React.FC<HUDProps> = ({ exercise, reps, formStatus }) => {
  const isGood = formStatus === 'GOOD';
  const formColor = isGood ? '#4ade80' : '#f97373';
  const formLabel = isGood ? '✔ Good' : '✖ Bad';
  const exerciseLabel = getExerciseLabel(exercise);

  return (
    <div style={styles.container} aria-live="polite" aria-label="Workout stats">
      <div style={styles.row}>
        <span style={styles.label}>Exercise:</span>
        <span style={styles.value}>{exerciseLabel}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Reps:</span>
        <span style={styles.value}>{reps}</span>
      </div>
      <div style={styles.row}>
        <span style={styles.label}>Form:</span>
        <span style={{ ...styles.value, color: formColor }}>{formLabel}</span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 20,
    left: 20,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    padding: '12px 18px',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '0.02em',
    userSelect: 'none',
    pointerEvents: 'none',
    backdropFilter: 'blur(6px)',
  },
  row: {
    display: 'flex',
    gap: 10,
    alignItems: 'baseline',
  },
  label: {
    opacity: 0.9,
  },
  value: {
    fontVariantNumeric: 'tabular-nums',
  },
};

export default HUD;
