import React from 'react';
import type { ExerciseType } from '../types/exercise';
import { getExerciseLabel } from '../types/exercise';

type ExerciseSelectorProps = {
  value: ExerciseType;
  onChange: (exercise: ExerciseType) => void;
};

const EXERCISES: ExerciseType[] = ['PUSHUP', 'SQUAT', 'CURL', 'JUMPING_JACK'];

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  value,
  onChange,
}) => {
  return (
    <div style={styles.container} aria-label="Select exercise">
      {EXERCISES.map((ex) => {
        const selected = ex === value;
        return (
          <button
            key={ex}
            type="button"
            onClick={() => onChange(ex)}
            style={{
              ...styles.button,
              ...(selected ? styles.buttonSelected : {}),
            }}
          >
            {getExerciseLabel(ex)}
          </button>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  button: {
    padding: '6px 14px',
    borderRadius: 999,
    border: '1px solid rgba(148,163,255,0.4)',
    background: 'rgba(15,23,42,0.9)',
    color: '#e5e7eb',
    fontSize: 13,
    cursor: 'pointer',
    letterSpacing: '0.03em',
  },
  buttonSelected: {
    background:
      'linear-gradient(135deg, #4ade80 0%, #22c55e 50%, #16a34a 100%)',
    color: '#022c22',
    borderColor: 'transparent',
  },
};

export default ExerciseSelector;

