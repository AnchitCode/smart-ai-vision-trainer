import { useState, useEffect, useRef, useCallback } from 'react';
import './WorkoutTimer.css';

interface WorkoutTimerProps {
  /** Is the timer currently running? */
  isRunning: boolean;
  /** Called when user clicks pause */
  onPause: () => void;
  /** Called when user clicks resume */
  onResume: () => void;
}

/**
 * WorkoutTimer
 *
 * HUD-style stopwatch overlay. Only ticks when `isRunning` is true.
 * Displays MM:SS in monospace with neon glow. 
 */
export default function WorkoutTimer({ isRunning, onPause, onResume }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);
  const accumulatedRef = useRef(0);
  const rafRef = useRef<number>(0);

  const tick = useCallback(() => {
    if (startRef.current !== null) {
      const now = performance.now();
      setElapsed(accumulatedRef.current + (now - startRef.current));
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    if (isRunning) {
      startRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      // Pause — accumulate elapsed time
      if (startRef.current !== null) {
        accumulatedRef.current += performance.now() - startRef.current;
        startRef.current = null;
      }
      cancelAnimationFrame(rafRef.current);
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [isRunning, tick]);

  const totalSeconds = Math.floor(elapsed / 1000);
  const mm = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const ss = String(totalSeconds % 60).padStart(2, '0');

  return (
    <div className="workout-timer">
      <div className="timer-display">
        <span className="timer-value">{mm}:{ss}</span>
      </div>

      <button
        type="button"
        className="timer-toggle"
        onClick={isRunning ? onPause : onResume}
        aria-label={isRunning ? 'Pause timer' : 'Resume timer'}
      >
        {isRunning ? (
          /* Pause icon */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          /* Play icon */
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2l10 6-10 6V2z" />
          </svg>
        )}
      </button>
    </div>
  );
}
