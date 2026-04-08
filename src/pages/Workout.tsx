import { useState, useCallback } from 'react';
import CameraFeed from '../components/Camera/CameraFeed';
import WorkoutSummary from '../components/WorkoutSummary';
import { startWorkout, endWorkout, type WorkoutSession } from '../engine/workoutTracker';
import { speak } from '../engine/voiceCoach';
import ExerciseSelector from '../components/ExerciseSelector';
import type { ExerciseType } from '../types/exercise';
import CountdownOverlay from '../components/CountdownOverlay';
import WorkoutTimer from '../components/WorkoutTimer';
import { saveWorkoutSession } from '../services/workoutService';
import { useAuth } from '../context/AuthContext';
import './Workout.css';

// ─── State machine ─────────────────────────────────────────────────────────────
type WorkoutState =
  | 'idle'
  | 'requesting_camera'
  | 'loading_model'
  | 'countdown'
  | 'active_workout'
  | 'paused'
  | 'completed'
  | 'error';

// ─── Status label map ──────────────────────────────────────────────────────────
const STATUS_LABELS: Partial<Record<WorkoutState, string>> = {
  requesting_camera: 'Connecting camera...',
  loading_model:     'Loading AI model...',
  countdown:         'Get ready!',
};

// ─── State groups (typed correctly to avoid TS .includes() error) ──────────────
// FIX: Declaring arrays as WorkoutState[] so TypeScript accepts
// workflowState (a WorkoutState) as a valid argument to .includes().
// Without the cast, TS infers string[] and rejects the narrower type.
const INACTIVE_STATES: WorkoutState[] = ['idle', 'completed', 'error'];
const TERMINAL_STATES: WorkoutState[] = ['completed', 'error'];
const TIMER_STATES:    WorkoutState[] = ['active_workout', 'paused'];

export default function Workout() {
  const [workflowState, setWorkflowState] = useState<WorkoutState>('idle');
  const [session, setSession]             = useState<WorkoutSession | null>(null);
  const [exercise, setExercise]           = useState<ExerciseType>('PUSHUP');
  const [isSaving, setIsSaving]           = useState(false);
  const [errorMessage, setErrorMessage]   = useState<string | null>(null);
  const { user } = useAuth();

  // ─── Callbacks ────────────────────────────────────────────────────────────────
  const handleStartWorkflow = useCallback(() => {
    setSession(null);
    setErrorMessage(null);
    setWorkflowState('requesting_camera');
  }, []);

  const handleStreamReady = useCallback(() => {
    setWorkflowState((prev) => prev === 'requesting_camera' ? 'loading_model' : prev);
  }, []);

  const handleModelLoaded = useCallback(() => {
    setWorkflowState((prev) => prev === 'loading_model' ? 'countdown' : prev);
  }, []);

  const handleModelError = useCallback((message: string) => {
    setErrorMessage(message);
    setWorkflowState('error');
  }, []);

  const handleCountdownComplete = useCallback(() => {
    startWorkout();
    speak('Workout started!');
    setWorkflowState('active_workout');
  }, []);

  const handlePause  = useCallback(() => setWorkflowState('paused'), []);
  const handleResume = useCallback(() => setWorkflowState('active_workout'), []);

  const handleEndWorkout = useCallback(async () => {
    const finished = endWorkout();
    setSession(finished);
    speak('Workout complete. Great job!');
    setWorkflowState('completed');

    if (user && finished.totalReps > 0) {
      setIsSaving(true);
      try {
        await saveWorkoutSession(finished, user);
      } catch (err) {
        console.error('[Workout] Save failed:', err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [user]);

  const handleNewWorkout = useCallback(() => {
    setSession(null);
    setErrorMessage(null);
    setWorkflowState('idle');
  }, []);

  // ─── Derived flags ────────────────────────────────────────────────────────────
  const isCameraActive = !INACTIVE_STATES.includes(workflowState);
  const isTimerRunning = workflowState === 'active_workout';
  const showTimer      = TIMER_STATES.includes(workflowState);
  const showControls   = TIMER_STATES.includes(workflowState);
  const statusLabel    = STATUS_LABELS[workflowState] ?? null;

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="workout-page">

      {/* ── Header ── */}
      <div className="workout-header">
        <h1 className="workout-title">
          {workflowState === 'completed' ? '📋 Workout Summary' : '🏋️ Active Workout'}
        </h1>

        {statusLabel && (
          <div className="workout-status">
            <span className="status-dot" />
            <span>{statusLabel}</span>
          </div>
        )}
      </div>

      {/* ── Countdown overlay ── */}
      {workflowState === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}

      {/* ── Error state ── */}
      {workflowState === 'error' && (
        <div className="workout-error-box anim-fade-in-up">
          <span className="error-icon">⚠️</span>
          <p className="error-message">
            {errorMessage ?? 'Something went wrong. Please try again.'}
          </p>
          <button type="button" className="btn-primary" onClick={handleNewWorkout}>
            Try Again
          </button>
        </div>
      )}

      {/* ── Completed: Summary ── */}
      {workflowState === 'completed' && session && (
        <div className="workout-summary-wrapper anim-fade-in-up">
          <WorkoutSummary session={session} />
          {isSaving && (
            <div className="saving-indicator anim-pulse-glow">
              Saving to your profile...
            </div>
          )}
          <div className="workout-actions">
            <button type="button" className="btn-primary" onClick={handleNewWorkout}>
              Start New Workout
            </button>
          </div>
        </div>
      )}

      {/* ── Active flow: idle → camera → workout ── */}
      {!TERMINAL_STATES.includes(workflowState) && (
        <div className="workout-active anim-fade-in">

          {/* Exercise selector (idle only) */}
          {workflowState === 'idle' && (
            <div className="workout-setup-box anim-fade-in-up">
              <h2 className="setup-heading">Choose Your Exercise</h2>
              <ExerciseSelector value={exercise} onChange={setExercise} />
              <button
                className="btn-primary btn-start-camera"
                onClick={handleStartWorkflow}
              >
                <span>Start Camera</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>
          )}

          {/* Camera feed */}
          {isCameraActive && (
            <div className="workout-camera-wrapper anim-fade-in">
              {showTimer && (
                <div className="workout-timer-overlay">
                  <WorkoutTimer
                    isRunning={isTimerRunning}
                    onPause={handlePause}
                    onResume={handleResume}
                  />
                </div>
              )}
              <CameraFeed
                exercise={exercise}
                onStreamReady={handleStreamReady}
                onModelLoaded={handleModelLoaded}
                onModelError={handleModelError}
              />
            </div>
          )}

          {/* End workout button */}
          {showControls && (
            <div className="workout-controls anim-fade-in-up">
              <button
                type="button"
                className="btn-end-workout"
                onClick={handleEndWorkout}
              >
                <span className="btn-icon">⏹</span> End Workout
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
