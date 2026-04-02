import { useState } from 'react';
import CameraFeed from '../components/Camera/Camera';
import WorkoutSummary from '../components/WorkoutSummary';
import { startWorkout, endWorkout, type WorkoutSession } from '../engine/workoutTracker';
import { speak } from '../engine/voiceCoach';
import ExerciseSelector from '../components/ExerciseSelector';
import type { ExerciseType } from '../types/exercise';
import './Workout.css';

export default function Workout() {
  const [cameraReady, setCameraReady] = useState(false);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exercise, setExercise] = useState<ExerciseType>('PUSHUP');

  const handleStreamReady = (_stream: MediaStream) => {
    setCameraReady(true);
    console.log('✅ Camera stream is ready!');
    startWorkout();
  };

  const handleEndWorkout = () => {
    const finished = endWorkout();
    setSession(finished);
    speak('Workout complete. Great job!');
  };

  const handleNewWorkout = () => {
    setSession(null);
    setCameraReady(false);
  };

  return (
    <div className="workout-page">
      {/* ── Header bar ── */}
      <div className="workout-header">
        <h1 className="workout-title">
          {session ? '📋 Workout Summary' : '🏋️ Active Workout'}
        </h1>
        {cameraReady && !session && (
          <div className="workout-status">
            <span className="status-dot" />
            <span>Camera Ready</span>
          </div>
        )}
      </div>

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
          <ExerciseSelector value={exercise} onChange={setExercise} />
          <div className="workout-camera-wrapper">
            <CameraFeed onStreamReady={handleStreamReady} exercise={exercise} />
          </div>
          {cameraReady && (
            <div className="workout-controls anim-fade-in-up">
              <button
                type="button"
                className="btn-end-workout"
                onClick={handleEndWorkout}
              >
                End Workout
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
