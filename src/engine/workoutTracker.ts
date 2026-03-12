import type { FormStatus } from './formValidator';
import type { ExerciseType } from '../types/exercise';

export type WorkoutSession = {
  totalReps: number;
  goodReps: number;
  badReps: number;
  startTime: number | null;
  endTime: number | null;
  repsByExercise: Record<ExerciseType, number>;
};

let session: WorkoutSession = {
  totalReps: 0,
  goodReps: 0,
  badReps: 0,
  startTime: null,
  endTime: null,
  repsByExercise: {
    PUSHUP: 0,
    SQUAT: 0,
    CURL: 0,
    JUMPING_JACK: 0,
  },
};

export function startWorkout() {
  const now = Date.now();
  session = {
    totalReps: 0,
    goodReps: 0,
    badReps: 0,
    startTime: now,
    endTime: null,
    repsByExercise: {
      PUSHUP: 0,
      SQUAT: 0,
      CURL: 0,
      JUMPING_JACK: 0,
    },
  };
}

export function recordRep(exercise: ExerciseType, formStatus: FormStatus) {
  if (session.startTime == null) {
    // Autostart if not started explicitly
    startWorkout();
  }

  session.totalReps += 1;
  session.repsByExercise[exercise] += 1;
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

