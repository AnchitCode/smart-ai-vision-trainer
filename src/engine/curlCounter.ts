type CurlState = 'DOWN' | 'UP';

let state: CurlState = 'DOWN';
let reps = 0;

// elbowAngle in degrees at the elbow (shoulder–elbow–wrist)
export function countCurl(elbowAngle: number): number {
  if (!Number.isFinite(elbowAngle)) return reps;

  // DOWN when elbowAngle > 160
  if (elbowAngle > 160 && state === 'UP') {
    state = 'DOWN';
  }

  // UP when elbowAngle < 45 and previous was DOWN
  if (elbowAngle < 45 && state === 'DOWN') {
    reps += 1;
    state = 'UP';
  }

  return reps;
}

export function resetCurlCounter() {
  state = 'DOWN';
  reps = 0;
}

