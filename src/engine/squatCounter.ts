/**
 * squatCounter.ts
 *
 * Counts squat repetitions using a two-phase state machine.
 *
 * Joint:  Hip – Knee – Ankle  (MediaPipe landmarks 23, 25, 27)
 * Angle:  Knee angle in degrees
 *
 * Phase diagram:
 *
 *   UP  ──(angle < DOWN_THRESHOLD)──►  DOWN
 *   DOWN ──(angle > UP_THRESHOLD)───►  UP  (+1 rep)
 *
 * Hysteresis:
 *   DOWN_THRESHOLD (90°) and UP_THRESHOLD (160°) are intentionally
 *   asymmetric. The 70° dead-zone between them prevents phantom
 *   counting when the user pauses mid-rep or the pose estimate jitters.
 */

// ─── Thresholds ────────────────────────────────────────────────────────────────
/** Knee must bend to at least this angle to register as "at depth". */
const DOWN_THRESHOLD = 90;   // degrees — parallel squat depth

/** Knee must straighten to at least this angle to register as "standing". */
const UP_THRESHOLD   = 160;  // degrees — near full extension

// ─── State machine phases ──────────────────────────────────────────────────────
type SquatPhase = 'UP' | 'DOWN';

// ─── Closure-based state ───────────────────────────────────────────────────────
// FIX: State is encapsulated in a closure rather than bare module-level variables.
// This prevents React Strict Mode double-mount from sharing stale state between
// renders, and makes the counter self-contained and testable.
function createSquatCounter() {
  let phase: SquatPhase = 'UP';
  let reps  = 0;

  function count(kneeAngle: number): number {
    if (!Number.isFinite(kneeAngle)) return reps;

    // Transition UP → DOWN: user has reached squat depth
    if (phase === 'UP' && kneeAngle < DOWN_THRESHOLD) {
      phase = 'DOWN';
    }

    // Transition DOWN → UP: user has returned to standing — rep complete
    if (phase === 'DOWN' && kneeAngle > UP_THRESHOLD) {
      reps += 1;
      phase = 'UP';
    }

    return reps;
  }

  function reset(): void {
    phase = 'UP';
    reps  = 0;
  }

  function getPhase(): SquatPhase {
    return phase;
  }

  return { count, reset, getPhase };
}

// ─── Singleton instance ────────────────────────────────────────────────────────
// Exported as named functions to keep the call-site API identical to before —
// no changes needed in usePose.ts or anywhere else that imports this module.
const _counter = createSquatCounter();

export function countSquat(kneeAngle: number): number {
  return _counter.count(kneeAngle);
}

export function resetSquatCounter(): void {
  _counter.reset();
}

/** Useful for debugging overlays — exposes current phase without exposing state directly. */
export function getSquatPhase(): SquatPhase {
  return _counter.getPhase();
}