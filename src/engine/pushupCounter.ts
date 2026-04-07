/**
 * pushupCounter.ts
 *
 * Counts push-up repetitions using a two-phase state machine.
 *
 * Joint:  Shoulder – Elbow – Wrist  (MediaPipe landmarks 11, 13, 15)
 * Angle:  Elbow angle in degrees
 *
 * Phase diagram:
 *
 *   UP  ──(angle < DOWN_THRESHOLD)──►  DOWN
 *   DOWN ──(angle > UP_THRESHOLD)───►  UP  (+1 rep)
 *
 * Hysteresis:
 *   DOWN_THRESHOLD (110°) and UP_THRESHOLD (140°) create a 30° dead-zone
 *   that prevents jitter near the transition boundaries from causing
 *   phantom reps.
 */

// ─── Thresholds ────────────────────────────────────────────────────────────────
/** Elbow must bend to at least this angle to register as "at depth". */
const DOWN_THRESHOLD = 110; // degrees — chest near floor

/** Elbow must extend to at least this angle to register as "arms extended". */
const UP_THRESHOLD   = 140; // degrees — near full lockout

// ─── State machine phases ──────────────────────────────────────────────────────
type PushupPhase = 'UP' | 'DOWN';

// ─── Closure-based state ───────────────────────────────────────────────────────
function createPushupCounter() {
  let phase: PushupPhase = 'UP';
  let reps = 0;

  function count(elbowAngle: number): number {
    if (!Number.isFinite(elbowAngle)) return reps;

    // Transition UP → DOWN: user has lowered to depth
    if (phase === 'UP' && elbowAngle < DOWN_THRESHOLD) {
      phase = 'DOWN';
    }

    // Transition DOWN → UP: user has pushed back up — rep complete
    if (phase === 'DOWN' && elbowAngle > UP_THRESHOLD) {
      reps += 1;
      phase = 'UP';
    }

    return reps;
  }

  function reset(): void {
    phase = 'UP';
    reps  = 0;
  }

  function getPhase(): PushupPhase {
    return phase;
  }

  return { count, reset, getPhase };
}

// ─── Singleton instance ────────────────────────────────────────────────────────
const _counter = createPushupCounter();

export function countPushup(elbowAngle: number): number {
  return _counter.count(elbowAngle);
}

export function resetPushupCounter(): void {
  _counter.reset();
}

/** Expose current phase for HUD cues — "Go down!" / "Push up!" */
export function getPushupPhase(): PushupPhase {
  return _counter.getPhase();
}