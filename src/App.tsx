import React, { useState } from 'react';
import CameraFeed from './components/Camera/Camera';
import './App.css';

function App() {
  const [cameraReady, setCameraReady] = useState(false);

  const handleVideoReady = (videoElement: HTMLVideoElement) => {
    setCameraReady(true);
    console.log('✅ Camera feed is ready!', videoElement);
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
        <div className="camera-container">
          <CameraFeed onVideoReady={handleVideoReady} />
        </div>
      </main>

      <footer className="app-footer">
        <p>Camera Feed Test - Confirm working before proceeding</p>
      </footer>
    </div>
  );
}

export default App;
