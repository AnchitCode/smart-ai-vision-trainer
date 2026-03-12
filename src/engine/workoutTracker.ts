import type { FormStatus } from './formValidator';

export type WorkoutSession = {
  totalReps: number;
  goodReps: number;
  badReps: number;
  startTime: number | null;
  endTime: number | null;
};

let session: WorkoutSession = {
  totalReps: 0,
  goodReps: 0,
  badReps: 0,
  startTime: null,
  endTime: null,
};

export function startWorkout() {
  const now = Date.now();
  session = {
    totalReps: 0,
    goodReps: 0,
    badReps: 0,
    startTime: now,
    endTime: null,
  };
}

export function recordRep(formStatus: FormStatus) {
  if (session.startTime == null) {
    // Autostart if not started explicitly
    startWorkout();
  }

  session.totalReps += 1;
  if (formStatus === 'GOOD') {
    session.goodReps += 1;
  } else {
    session.badReps += 1;
  }
}

export function endWorkout(): WorkoutSession {
  if (session.startTime == null) {
    // Nothing ever started; ensure times are consistent
    const now = Date.now();
    session.startTime = now;
    session.endTime = now;
  } else if (session.endTime == null) {
    session.endTime = Date.now();
  }

  return { ...session };
}

export function getSession(): WorkoutSession {
  return { ...session };
}

