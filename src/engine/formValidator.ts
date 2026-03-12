import type { NormalizedLandmark } from '../hooks/usePose';
import { calculateAngle } from './biomechanics/angleCalculator';

export type FormStatus = 'GOOD' | 'BAD';

/**
 * validatePushupForm
 *
 * Uses shoulder–hip–knee alignment on the left side of the body
 * to estimate body straightness during a push-up.
 *
 * Landmarks:
 * 11 = left shoulder
 * 23 = left hip
 * 25 = left knee
 *
 * If hipAngle < 150° → BAD
 * If hipAngle ≥ 150° → GOOD
 */
export function validatePushupForm(landmarks: NormalizedLandmark[] | undefined | null): FormStatus {
  if (!landmarks || landmarks.length < 26) return 'BAD';

  const shoulder = landmarks[11];
  const hip = landmarks[23];
  const knee = landmarks[25];

  if (!shoulder || !hip || !knee) return 'BAD';

  const hipAngle = calculateAngle(shoulder, hip, knee);
  if (!Number.isFinite(hipAngle)) return 'BAD';

  return hipAngle >= 150 ? 'GOOD' : 'BAD';
}

