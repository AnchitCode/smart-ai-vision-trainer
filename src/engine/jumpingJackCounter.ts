type JackState = 'CLOSED' | 'OPEN';

let state: JackState = 'CLOSED';
let reps = 0;

// isOpen: true when arms are up and feet are wide
export function countJumpingJack(isOpen: boolean): number {
  if (isOpen && state === 'CLOSED') {
    state = 'OPEN';
    return reps;
  }

  if (!isOpen && state === 'OPEN') {
    reps += 1;
    state = 'CLOSED';
    return reps;
  }

  return reps;
}

export function resetJumpingJackCounter() {
  state = 'CLOSED';
  reps = 0;
}

