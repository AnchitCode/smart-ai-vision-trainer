type PushupState = 'UP' | 'DOWN';

let state: PushupState = 'UP';
let reps = 0;

export function countPushup(elbowAngle: number): number {
  if (!Number.isFinite(elbowAngle)) return reps;

  // UP → DOWN
  if (elbowAngle < 110 && state === 'UP') {
    state = 'DOWN';
  }

  // DOWN → UP → rep++
  if (elbowAngle > 140 && state === 'DOWN') {
    reps += 1;
    state = 'UP';
  }

  return reps;
}

export function resetPushupCounter() {
  state = 'UP';
  reps = 0;
}