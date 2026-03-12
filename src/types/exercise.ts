export type ExerciseType = 'PUSHUP' | 'SQUAT' | 'CURL' | 'JUMPING_JACK';

export function getExerciseLabel(exercise: ExerciseType): string {
  switch (exercise) {
    case 'PUSHUP':
      return 'Push-ups';
    case 'SQUAT':
      return 'Squats';
    case 'CURL':
      return 'Bicep Curls';
    case 'JUMPING_JACK':
      return 'Jumping Jacks';
    default:
      return exercise;
  }
}

