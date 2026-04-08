import { supabase } from '../lib/supabase';
import type { WorkoutSession } from '../engine/workoutTracker';
import type { User } from '@supabase/supabase-js';

// ─── Return type ───────────────────────────────────────────────────────────────
// FIX: Explicit return type so callers know exactly what they get.
// `setsPartialFailure` lets the UI warn the user without blocking the summary.
export interface SaveWorkoutResult {
  sessionId: string;
  /** True if the session saved but the exercise breakdown insert failed. */
  setsPartialFailure: boolean;
}

// ─── Service ───────────────────────────────────────────────────────────────────

/**
 * saveWorkoutSession
 *
 * Persists a completed workout to Supabase in two steps:
 *   1. Insert a row into `workout_sessions` → get back its UUID
 *   2. Insert per-exercise breakdown rows into `exercise_sets`
 *
 * FIX: Accepts `user` as a parameter instead of re-fetching it here.
 * The caller (Workout.tsx) already holds a valid User from useAuth() and
 * guards this call behind `if (user)` — re-fetching is a redundant network
 * round-trip.
 */
export async function saveWorkoutSession(
  session: WorkoutSession,
  user: User,
): Promise<SaveWorkoutResult> {

  // ── Timestamps ──────────────────────────────────────────────────────────────
  // Fallback to now only as a last resort — upstream should always set these.
  const start = session.startTime ?? Date.now();
  const end   = session.endTime   ?? Date.now();

  // ── 1. Insert workout session ───────────────────────────────────────────────
  const { data: insertedSession, error: sessionError } = await supabase
    .from('workout_sessions')
    .insert({
      user_id:    user.id,
      start_time: new Date(start).toISOString(),
      end_time:   new Date(end).toISOString(),
      total_reps: session.totalReps,
      good_reps:  session.goodReps,
      bad_reps:   session.badReps,
    })
    .select('id')
    .single();

  if (sessionError || !insertedSession) {
    throw new Error(`Failed to save session: ${sessionError?.message ?? 'Unknown error'}`);
  }

  // ── 2. Insert exercise breakdown ────────────────────────────────────────────
  const setsToInsert = Object.entries(session.repsByExercise)
    .filter(([, reps]) => reps > 0)
    .map(([exerciseType, reps]) => ({
      session_id:    insertedSession.id,
      user_id:       user.id,
      exercise_type: exerciseType,
      reps,
    }));

  let setsPartialFailure = false;

  if (setsToInsert.length > 0) {
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .insert(setsToInsert);

    if (setsError) {
      // FIX: Don't throw — the session row is already committed and the user's
      // rep count is safe. But surface the failure so the caller can warn the
      // user rather than silently dropping their exercise breakdown.
      console.error('[workoutService] Exercise sets insert failed:', setsError);
      setsPartialFailure = true;
    }
  }

  return {
    sessionId: insertedSession.id,
    setsPartialFailure,
  };
}