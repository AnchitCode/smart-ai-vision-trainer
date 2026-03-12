import React from 'react';
import type { FormStatus } from '../../engine/formValidator';

export type HUDProps = {
  pushupCount: number;
  formStatus: FormStatus;
};

export const HUD: React.FC<HUDProps> = ({ pushupCount, formStatus }) => {
  const isGood = formStatus === 'GOOD';
  const formColor = isGood ? '#4ade80' : '#f97373';
  const formLabel = isGood ? '✔ Good' : '✖ Bad';

  return (
    <div style={styles.container} aria-live="polite" aria-label="Workout stats">
      <div style={styles.row}>
        <span style={styles.label}>Push-ups:</span>
        <span style={styles.value}>{pushupCount}</span>
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
