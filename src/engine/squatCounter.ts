type SquatState = 'UP' | 'DOWN';

let state: SquatState = 'UP';
let reps = 0;

// kneeAngle in degrees at the knee joint (hip–knee–ankle)
export function countSquat(kneeAngle: number): number {
  if (!Number.isFinite(kneeAngle)) return reps;

  if (kneeAngle < 90 && state === 'UP') {
    state = 'DOWN';
  }

  if (kneeAngle > 160 && state === 'DOWN') {
    reps += 1;
    state = 'UP';
  }

  return reps;
}

export function resetSquatCounter() {
  state = 'UP';
  reps = 0;
}

