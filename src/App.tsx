import { useState } from 'react';
import CameraFeed from './components/Camera/Camera';
import WorkoutSummary from './components/WorkoutSummary';
import { startWorkout, endWorkout, type WorkoutSession } from './engine/workoutTracker';
import { speak } from './engine/voiceCoach';
import ExerciseSelector from './components/ExerciseSelector';
import type { ExerciseType } from './types/exercise';
import './App.css';

function App() {
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

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>AI Vision Trainer</h1>
        <p className="status">
          {cameraReady ? (
            <span className="status-ready">✅ Camera Ready</span>
          ) : (
            <span className="status-loading">⏳ Initializing Camera...</span>
          )}
        </p>
      </header>

      <main className="app-main">
        {session ? (
          <WorkoutSummary session={session} />
        ) : (
          <div className="camera-container">
            <ExerciseSelector value={exercise} onChange={setExercise} />
            <CameraFeed onStreamReady={handleStreamReady} exercise={exercise} />
            {cameraReady && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleEndWorkout}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '999px',
                    border: 'none',
                    background:
                      'linear-gradient(135deg, #f97373 0%, #fb923c 50%, #facc15 100%)',
                    color: '#020617',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.03em',
                  }}
                >
                  End Workout
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Smart AI Vision Trainer</p>
      </footer>
    </div>
  );
}

export default App;
