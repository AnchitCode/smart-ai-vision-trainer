import React, { useEffect, useRef, useState, useCallback } from 'react';
import { usePose } from '../../hooks/usePose';
import PoseOverlay from '../PoseOverlay/PoseOverlay';
import HUD from '../HUD/HUD';
import type { ExerciseType } from '../../types/exercise';
import './CameraFeed.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface CameraFeedProps {
  exercise: ExerciseType;
  mirrored?: boolean;
  className?: string;
  onStreamReady?: () => void;
  onModelLoaded?: () => void;
  onModelError?: (message: string) => void;
  onError?: (error: Error) => void;
}

// ─── Error message resolver ───────────────────────────────────────────────────

function resolveErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
        return 'Camera access was denied. Allow camera permissions in your browser settings and refresh.';
      case 'NotFoundError':
        return 'No camera was found on this device.';
      case 'NotReadableError':
        return 'Camera is already in use by another application.';
      case 'OverconstrainedError':
        return 'The requested camera settings could not be satisfied.';
      case 'SecurityError':
        return 'Camera access is blocked. This app requires HTTPS.';
      default:
        return `Camera error: ${err.message}`;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unknown camera error occurred.';
}

// ─── Component ────────────────────────────────────────────────────────────────

const CameraFeed: React.FC<CameraFeedProps> = ({
  exercise,
  mirrored = true,
  className = '',
  onStreamReady,
  onModelLoaded,
  onModelError,
  onError,
}) => {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [errorMessage, setErrorMessage]       = useState<string>('');

  // ── Pose detection ──────────────────────────────────────────────────────────
  const { landmarks: landmarksRef, reps, formStatus, modelState, modelError } = usePose(videoRef, exercise);

  // ── Bridge modelState → parent callbacks ────────────────────────────────────
  useEffect(() => {
    if (modelState === 'ready')  onModelLoaded?.();
    if (modelState === 'error' && modelError) onModelError?.(modelError);
  }, [modelState, modelError, onModelLoaded, onModelError]);

  // ── Start camera stream ─────────────────────────────────────────────────────
  // FIX: Extracted into useCallback so handleRetry can call it directly
  // instead of reloading the whole page.
  const startStream = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'Camera API unavailable. Use a modern browser over HTTPS.';
      setErrorMessage(msg);
      setPermissionState('unavailable');
      onError?.(new Error(msg));
      return;
    }

    setPermissionState('requesting');
    setErrorMessage('');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setPermissionState('granted');
      onStreamReady?.();
    } catch (err) {
      const msg = resolveErrorMessage(err);
      setErrorMessage(msg);
      setPermissionState('denied');
      onError?.(err instanceof Error ? err : new Error(msg));
    }
  }, [onStreamReady, onError]);

  useEffect(() => {
    startStream();

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ───────────────────────────────────────────────────────────
  const isGranted       = permissionState === 'granted';
  const isLoading       = permissionState === 'idle' || permissionState === 'requesting';
  const isError         = permissionState === 'denied' || permissionState === 'unavailable' || modelState === 'error';
  const isModelLoading  = isGranted && (modelState === 'idle' || modelState === 'loading');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`camera-feed ${className}`}>

      {/* Video — always in DOM so videoRef stays stable for usePose */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live camera feed"
        className={`camera-feed__video ${mirrored ? 'camera-feed__video--mirrored' : ''} ${isGranted ? '' : 'camera-feed__video--hidden'}`}
      />

      {/* Pose overlay */}
      {isGranted && (
        <PoseOverlay videoRef={videoRef} landmarksRef={landmarksRef} />
      )}

      {/* HUD */}
      {isGranted && modelState === 'ready' && (
        <HUD exercise={exercise} reps={reps} formStatus={formStatus} />
      )}

      {/* Requesting camera */}
      {isLoading && (
        <div className="camera-feed__overlay" aria-live="polite">
          <svg className="camera-feed__icon camera-feed__icon--pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx={12} cy={13} r={4} />
          </svg>
          <p className="camera-feed__overlay-text">Allow camera access to start</p>
          <span className="camera-feed__hint-dot" />
        </div>
      )}

      {/* AI model loading — camera is on, model warming up */}
      {isModelLoading && (
        <div className="camera-feed__overlay camera-feed__overlay--shimmer" aria-live="polite">
          <div className="camera-feed__spinner" />
          <p className="camera-feed__overlay-text">Initializing AI model...</p>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="camera-feed__overlay" role="alert">
          <svg className="camera-feed__icon camera-feed__icon--error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx={12} cy={12} r={10} />
            <line x1={12} y1={8} x2={12} y2={12} />
            <line x1={12} y1={16} x2={12.01} y2={16} />
          </svg>
          <p className="camera-feed__error-text">
            {modelState === 'error' ? modelError : errorMessage}
          </p>
          {/* FIX: Retry re-attempts getUserMedia instead of reloading the page */}
          <button className="camera-feed__retry-btn" onClick={startStream}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraFeed;
