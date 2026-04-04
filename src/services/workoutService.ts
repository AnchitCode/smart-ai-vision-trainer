import { supabase } from '../lib/supabase';
import type { WorkoutSession } from '../engine/workoutTracker';

export async function saveWorkoutSession(session: WorkoutSession) {
  // 1. Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('User not authenticated');

  // 2. Calculate duration times
  const start = session.startTime ?? Date.now();
  const end = session.endTime ?? Date.now();

  // 3. Insert Workout Session
  const { data: insertedSession, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id: user.id,
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      total_reps: session.totalReps,
      good_reps: session.goodReps,
      bad_reps: session.badReps,
    })
    .select('id')
    .single();

  if (sessionError || !insertedSession) {
    throw new Error(`Failed to save session: ${sessionError?.message}`);
  }

  // 4. Insert breakdown into exercise_sets
  // Assuming session.repsByExercise holds aggregated reps for exercises done in this session
  const setsToInsert = Object.entries(session.repsByExercise)
    .filter(([_, reps]) => reps > 0)
    .map(([exerciseType, reps]) => ({
      session_id: insertedSession.id,
      user_id: user.id,
      exercise_type: exerciseType,
      reps: reps,
    }));

  if (setsToInsert.length > 0) {
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .insert(setsToInsert);

    if (setsError) {
      console.error('Failed to save exercise sets:', setsError);
      // We don't throw here because the main session was saved, but we log the error
    }
  }

  return insertedSession.id;
}
