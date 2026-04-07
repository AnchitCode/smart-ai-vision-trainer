import type { NormalizedLandmark } from '../hooks/usePose';
import { calculateAngle } from './biomechanics/angleCalculator';
import type { ExerciseType } from '../types/exercise';

export type FormStatus = 'GOOD' | 'BAD';

// ─── Thresholds ────────────────────────────────────────────────────────────────
// Centralised here so tuning never requires touching logic code.
const THRESHOLDS = {
  PUSHUP: {
    // Shoulder–Hip–Knee angle. < 150° means hips are sagging or piking.
    minHipAngle: 150,
  },
  SQUAT: {
    // Shoulder–Hip–Knee angle. < 60° means excessive forward lean.
    minHipAngle: 60,
  },
  CURL: {
    // Shoulder–Elbow lateral drift. If elbow x drifts > threshold away
    // from shoulder x, the user is swinging instead of curling.
    maxElbowDrift: 0.08, // normalised units (0–1 screen width)
  },
  JUMPING_JACK: {
    // We check visibility of wrists vs shoulders to confirm full arm extension.
    // If wrists are not sufficiently above shoulders at peak, form is partial.
    // No angle needed — positional check is sufficient.
    minArmRiseRatio: 0.05, // wrist must be at least 5% of frame above shoulder
  },
} as const;

// ─── Per-exercise validators ───────────────────────────────────────────────────

/**
 * Push-up: shoulder–hip–knee alignment on the left side.
 * Detects sagging hips and raised hips (piking).
 */
function validatePushup(lm: NormalizedLandmark[]): FormStatus {
  const shoulder = lm[11];
  const hip      = lm[23];
  const knee     = lm[25];

  if (!shoulder || !hip || !knee) return 'GOOD'; // landmarks not visible — don't penalise
  const angle = calculateAngle(shoulder, hip, knee);
  if (!Number.isFinite(angle)) return 'GOOD';

  return angle >= THRESHOLDS.PUSHUP.minHipAngle ? 'GOOD' : 'BAD';
}

/**
 * Squat: shoulder–hip–knee angle on the left side.
 * Detects excessive forward lean (butt-wink is acceptable).
 */
function validateSquat(lm: NormalizedLandmark[]): FormStatus {
  const shoulder = lm[11];
  const hip      = lm[23];
  const knee     = lm[25];

  if (!shoulder || !hip || !knee) return 'GOOD';
  const angle = calculateAngle(shoulder, hip, knee);
  if (!Number.isFinite(angle)) return 'GOOD';

  return angle >= THRESHOLDS.SQUAT.minHipAngle ? 'GOOD' : 'BAD';
}

/**
 * Curl: checks that the left elbow does not drift laterally away from
 * the shoulder — the primary cheat pattern in bicep curls.
 */
function validateCurl(lm: NormalizedLandmark[]): FormStatus {
  const shoulder = lm[11];
  const elbow    = lm[13];

  if (!shoulder || !elbow) return 'GOOD';

  const drift = Math.abs(elbow.x - shoulder.x);
  return drift <= THRESHOLDS.CURL.maxElbowDrift ? 'GOOD' : 'BAD';
}

/**
 * Jumping Jack: at the top of the movement, wrists must clear shoulder height.
 * Catches partial reps where arms are only raised halfway.
 * Only penalises when arms are supposed to be up (wrist.y < shoulder.y already
 * detected by the counter) — here we validate *quality* of the extension.
 */
function validateJumpingJack(lm: NormalizedLandmark[]): FormStatus {
  const lShoulder = lm[11];
  const lWrist    = lm[15];
  const rShoulder = lm[12];
  const rWrist    = lm[16];

  if (!lShoulder || !lWrist || !rShoulder || !rWrist) return 'GOOD';

  // In MediaPipe, y=0 is top of frame. A lower y value = higher on screen.
  // wrist.y must be at least minArmRiseRatio *above* shoulder.y
  const leftOk  = lShoulder.y - lWrist.y >= THRESHOLDS.JUMPING_JACK.minArmRiseRatio;
  const rightOk = rShoulder.y - rWrist.y >= THRESHOLDS.JUMPING_JACK.minArmRiseRatio;

  // Only flag BAD if arms are clearly not extended on both sides
  return leftOk && rightOk ? 'GOOD' : 'BAD';
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * validateForm
 *
 * Single entry point used by usePose.ts.
 * Routes to the correct per-exercise validator.
 *
 * Returns 'GOOD' when landmarks are missing rather than 'BAD' —
 * we never penalise the user for the camera losing them briefly.
 */
export function validateForm(
  landmarks: NormalizedLandmark[] | undefined | null,
  exercise: ExerciseType,
): FormStatus {
  // Guard: not enough landmarks to validate anything
  if (!landmarks || landmarks.length < 29) return 'GOOD';

  switch (exercise) {
    case 'PUSHUP':       return validatePushup(landmarks);
    case 'SQUAT':        return validateSquat(landmarks);
    case 'CURL':         return validateCurl(landmarks);
    case 'JUMPING_JACK': return validateJumpingJack(landmarks);
    default:             return 'GOOD';
  }
}

/**
 * @deprecated Use validateForm(landmarks, exercise) instead.
 * Kept temporarily to avoid breaking anything still importing this name.
 */
export function validatePushupForm(
  landmarks: NormalizedLandmark[] | undefined | null,
): FormStatus {
  return validateForm(landmarks, 'PUSHUP');
}