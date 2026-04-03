import { useState, useCallback } from 'react';
import CameraFeed from '../components/Camera/CameraFeed';
import WorkoutSummary from '../components/WorkoutSummary';
import { startWorkout, endWorkout, type WorkoutSession } from '../engine/workoutTracker';
import { speak } from '../engine/voiceCoach';
import ExerciseSelector from '../components/ExerciseSelector';
import type { ExerciseType } from '../types/exercise';
import CountdownOverlay from '../components/CountdownOverlay';
import WorkoutTimer from '../components/WorkoutTimer';
import './Workout.css';

type WorkoutState =
  | 'idle'
  | 'requesting_camera'
  | 'loading_model'
  | 'countdown'
  | 'active_workout'
  | 'paused';

export default function Workout() {
  const [workflowState, setWorkflowState] = useState<WorkoutState>('idle');
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercise, setExercise] = useState<ExerciseType>('PUSHUP');

  // --- Callbacks ---

  const handleStartWorkflow = () => {
    setSession(null);
    setWorkflowState('requesting_camera');
  };

  const handleStreamReady = useCallback(() => {
    // By definition, when stream is ready, we are now waiting for model
    setWorkflowState((prev) => (prev === 'requesting_camera' ? 'loading_model' : prev));
  }, []);

  const handleModelLoaded = useCallback(() => {
    setWorkflowState((prev) => (prev === 'loading_model' ? 'countdown' : prev));
  }, []);

  const handleCountdownComplete = useCallback(() => {
    startWorkout();
    speak('Workout started!');
    setWorkflowState('active_workout');
  }, []);

  const handlePause = () => setWorkflowState('paused');
  const handleResume = () => setWorkflowState('active_workout');

  const handleEndWorkout = () => {
    const finished = endWorkout();
    setSession(finished);
    speak('Workout complete. Great job!');
    setWorkflowState('idle');
  };

  const handleNewWorkout = () => {
    setSession(null);
    setWorkflowState('idle');
  };

  // --- Render details ---

  const isCameraActive = workflowState !== 'idle';
  const isTimerRunning = workflowState === 'active_workout';
  const showTimer = workflowState === 'active_workout' || workflowState === 'paused';

  return (
    <div className="workout-page">
      {/* ── Header bar ── */}
      <div className="workout-header">
        <h1 className="workout-title">
          {session ? '📋 Workout Summary' : '🏋️ Active Workout'}
        </h1>
        
        {/* Top-right corner status */}
        {!showTimer && isCameraActive && !session ? (
          <div className="workout-status">
            <span className="status-dot" />
            <span>
              {workflowState === 'requesting_camera' && 'Connecting...'}
              {workflowState === 'loading_model' && 'Initializing...'}
              {workflowState === 'countdown' && 'Ready'}
            </span>
          </div>
        ) : null}
      </div>

      {/* ── Overlays ── */}
      {workflowState === 'countdown' && (
        <CountdownOverlay onComplete={handleCountdownComplete} />
      )}

      {/* ── Content ── */}
      {session ? (
        <div className="workout-summary-wrapper anim-fade-in-up">
          <WorkoutSummary session={session} />
          <div className="workout-actions">
            <button
              type="button"
              className="btn-primary"
              onClick={handleNewWorkout}
            >
              Start New Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="workout-active anim-fade-in">
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
              {/* Camera feed handles loading & permission states visually inside */}
              <CameraFeed 
                exercise={exercise}
                onStreamReady={handleStreamReady}
                onModelLoaded={handleModelLoaded}
              />
            </div>
          )}

          {(workflowState === 'active_workout' || workflowState === 'paused') && (
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
