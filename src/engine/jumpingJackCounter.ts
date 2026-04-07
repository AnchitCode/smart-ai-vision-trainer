/**
 * jumpingJackCounter.ts
 *
 * Counts jumping jack repetitions using a two-phase state machine.
 *
 * Input: a boolean — true when arms are up AND feet are wide (computed in usePose.ts)
 *
 * Phase diagram:
 *
 *   CLOSED ──(isOpen = true)───►  OPEN
 *   OPEN   ──(isOpen = false)──►  CLOSED  (+1 rep)
 *
 * Note: Rep is counted when returning to CLOSED (arms down, feet together),
 * which matches how jumping jacks are universally counted.
 */

// ─── State machine phases ──────────────────────────────────────────────────────
type JackPhase = 'CLOSED' | 'OPEN';

// ─── Closure-based state ───────────────────────────────────────────────────────
function createJumpingJackCounter() {
  let phase: JackPhase = 'CLOSED';
  let reps = 0;

  function count(isOpen: boolean): number {
    // Transition CLOSED → OPEN: user has jumped out
    if (isOpen && phase === 'CLOSED') {
      phase = 'OPEN';
    }

    // Transition OPEN → CLOSED: user has returned — rep complete
    if (!isOpen && phase === 'OPEN') {
      reps += 1;
      phase = 'CLOSED';
    }

    return reps;
  }

  function reset(): void {
    phase = 'CLOSED';
    reps  = 0;
  }

  function getPhase(): JackPhase {
    return phase;
  }

  return { count, reset, getPhase };
}

// ─── Singleton instance ────────────────────────────────────────────────────────
const _counter = createJumpingJackCounter();

export function countJumpingJack(isOpen: boolean): number {
  return _counter.count(isOpen);
}

export function resetJumpingJackCounter(): void {
  _counter.reset();
}

/** Expose current phase for HUD cues — "Jump out!" / "Back together!" */
export function getJackPhase(): JackPhase {
  return _counter.getPhase();
}