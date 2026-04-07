import React, { useEffect, useRef } from 'react';
import type { FormStatus } from '../../engine/formValidator';
import { getExerciseLabel, type ExerciseType } from '../../types/exercise';
import './HUD.css';

export type HUDProps = {
  exercise: ExerciseType;
  reps: number;
  formStatus: FormStatus;
  /** Current phase from the exercise counter — drives coaching cues */
  phase?: 'UP' | 'DOWN' | 'OPEN' | 'CLOSED';
};

// ─── Phase → coaching cue ──────────────────────────────────────────────────────
const PHASE_CUES: Record<ExerciseType, { UP?: string; DOWN?: string; OPEN?: string; CLOSED?: string }> = {
  PUSHUP:       { UP: 'Go down!',    DOWN: 'Push up!'     },
  SQUAT:        { UP: 'Squat down!', DOWN: 'Stand up!'    },
  CURL:         { DOWN: 'Curl up!',  UP: 'Lower slowly'   },
  JUMPING_JACK: { CLOSED: 'Jump out!', OPEN: 'Back together!' },
};

export const HUD: React.FC<HUDProps> = ({ exercise, reps, formStatus, phase }) => {
  const isGood       = formStatus === 'GOOD';
  const exerciseLabel = getExerciseLabel(exercise);

  // ── Rep pulse animation ──────────────────────────────────────────────────────
  // FIX: Rep count change triggers a CSS animation via a key flip on the span.
  // Previously the number just snapped — no visual feedback on completion.
  const repSpanRef  = useRef<HTMLSpanElement>(null);
  const prevRepsRef = useRef(reps);

  useEffect(() => {
    if (reps > prevRepsRef.current && repSpanRef.current) {
      // Remove and re-add class to restart the animation
      repSpanRef.current.classList.remove('hud__rep-pulse');
      void repSpanRef.current.offsetWidth; // force reflow
      repSpanRef.current.classList.add('hud__rep-pulse');
    }
    prevRepsRef.current = reps;
  }, [reps]);

  // ── Resolve coaching cue ─────────────────────────────────────────────────────
  const cue = phase ? PHASE_CUES[exercise]?.[phase] : undefined;

  return (
    <div className="hud" aria-live="polite" aria-label="Workout stats">

      {/* Exercise label */}
      <div className="hud__row">
        <span className="hud__label">Exercise</span>
        <span className="hud__value hud__exercise">{exerciseLabel}</span>
      </div>

      {/* Rep count with pulse animation */}
      <div className="hud__row hud__row--reps">
        <span className="hud__label">Reps</span>
        <span className="hud__value hud__reps" ref={repSpanRef}>
          {reps}
        </span>
      </div>

      {/* Form status */}
      <div className="hud__row">
        <span className="hud__label">Form</span>
        <span className={`hud__value hud__form hud__form--${isGood ? 'good' : 'bad'}`}>
          {isGood ? '✔ Good' : '✖ Fix form'}
        </span>
      </div>

      {/* Phase coaching cue — only shown when a phase is provided */}
      {cue && (
        <div className="hud__cue" aria-live="assertive">
          {cue}
        </div>
      )}

    </div>
  );
};

export default HUD;
