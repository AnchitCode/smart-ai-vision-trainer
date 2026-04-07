/**
 * curlCounter.ts
 *
 * Counts bicep curl repetitions using a two-phase state machine.
 *
 * Joint:  Shoulder – Elbow – Wrist  (MediaPipe landmarks 11, 13, 15)
 * Angle:  Elbow angle in degrees
 *
 * Phase diagram:
 *
 *   DOWN ──(angle < UP_THRESHOLD)───►  UP  (+1 rep)
 *   UP   ──(angle > DOWN_THRESHOLD)──►  DOWN
 *
 * Note: Rep is counted at the TOP of the curl (fully contracted),
 * not on the way down. This matches standard rep-counting convention.
 *
 * Hysteresis:
 *   UP_THRESHOLD (45°) and DOWN_THRESHOLD (160°) create a 115° dead-zone —
 *   intentionally large because the elbow travels the full range of motion
 *   during a curl.
 */

// ─── Thresholds ────────────────────────────────────────────────────────────────
/** Elbow must curl to at least this angle to register as "fully contracted". */
const UP_THRESHOLD   = 45;  // degrees — full bicep contraction

/** Elbow must extend to at least this angle to register as "arm lowered". */
const DOWN_THRESHOLD = 160; // degrees — near full extension

// ─── State machine phases ──────────────────────────────────────────────────────
type CurlPhase = 'DOWN' | 'UP';

// ─── Closure-based state ───────────────────────────────────────────────────────
function createCurlCounter() {
  let phase: CurlPhase = 'DOWN';
  let reps = 0;

  function count(elbowAngle: number): number {
    if (!Number.isFinite(elbowAngle)) return reps;

    // Transition DOWN → UP: user has fully curled — rep complete
    if (phase === 'DOWN' && elbowAngle < UP_THRESHOLD) {
      reps += 1;
      phase = 'UP';
    }

    // Transition UP → DOWN: user has lowered the weight back down
    if (phase === 'UP' && elbowAngle > DOWN_THRESHOLD) {
      phase = 'DOWN';
    }

    return reps;
  }

  function reset(): void {
    phase = 'DOWN';
    reps  = 0;
  }

  function getPhase(): CurlPhase {
    return phase;
  }

  return { count, reset, getPhase };
}

// ─── Singleton instance ────────────────────────────────────────────────────────
const _counter = createCurlCounter();

export function countCurl(elbowAngle: number): number {
  return _counter.count(elbowAngle);
}

export function resetCurlCounter(): void {
  _counter.reset();
}

/** Expose current phase for HUD cues — "Curl up!" / "Lower slowly" */
export function getCurlPhase(): CurlPhase {
  return _counter.getPhase();
}