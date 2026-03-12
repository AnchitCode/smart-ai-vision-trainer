import React, { useEffect, useRef, useState } from 'react';
import { usePose } from '../../hooks/usePose';
import PoseOverlay from '../PoseOverlay/PoseOverlay';
import HUD from '../HUD/HUD';

// ─── Types ────────────────────────────────────────────────────────────────────

type PermissionState = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable';

interface CameraFeedProps {
  /** Mirror the video horizontally (default: true) */
  mirrored?: boolean;
  /** Called once the stream has started successfully */
  onStreamReady?: (stream: MediaStream) => void;
  /** Called whenever an error occurs */
  onError?: (error: Error) => void;
  /** Additional CSS class names for the wrapper */
  className?: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function resolveErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
        return 'Camera access was denied. Please allow camera permissions in your browser settings and refresh.';
      case 'NotFoundError':
        return 'No camera device was found on this device.';
      case 'NotReadableError':
        return 'Camera is already in use by another application.';
      case 'OverconstrainedError':
        return 'The requested camera constraints could not be satisfied.';
      case 'SecurityError':
        return 'Camera access is blocked due to a security restriction (requires HTTPS).';
      default:
        return `Camera error: ${err.message}`;
    }
  }
  if (err instanceof Error) return err.message;
  return 'An unknown camera error occurred.';
}

// ─── Component ────────────────────────────────────────────────────────────────

const CameraFeed: React.FC<CameraFeedProps> = ({
  mirrored = true,
  onStreamReady,
  onError,
  className = '',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // ── Pose detection ──────────────────────────────────────────────────────────
  // usePose returns a stable ref; PoseOverlay reads it on every animation frame.
  const { landmarks: landmarksRef, pushupCount, formStatus } = usePose(videoRef);

  // ── Start camera stream ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const startStream = async () => {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setPermissionState('unavailable');
        const msg = 'Camera API is not available. Please use a modern browser over HTTPS.';
        setErrorMessage(msg);
        onError?.(new Error(msg));
        return;
      }

      setPermissionState('requesting');

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setPermissionState('granted');
        onStreamReady?.(stream);
      } catch (err) {
        if (cancelled) return;
        const msg = resolveErrorMessage(err);
        setErrorMessage(msg);
        setPermissionState('denied');
        onError?.(err instanceof Error ? err : new Error(msg));
      }
    };

    startStream();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Retry ───────────────────────────────────────────────────────────────────
  const handleRetry = () => {
    window.location.reload();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={`camera-feed-wrapper ${className}`} style={styles.wrapper}>

      {/* Video element — always in the DOM so the ref is stable */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        aria-label="Live camera feed"
        style={{
          ...styles.video,
          transform: mirrored ? 'scaleX(-1)' : 'none',
          display: permissionState === 'granted' ? 'block' : 'none',
        }}
      />

      {/* Pose landmark overlay — sits on top of the video */}
      {permissionState === 'granted' && (
        <PoseOverlay videoRef={videoRef} landmarksRef={landmarksRef} />
      )}

      {/* HUD overlay — sits on top of video/canvas */}
      {permissionState === 'granted' && (
        <HUD pushupCount={pushupCount} formStatus={formStatus} />
      )}

      {/* Loading / requesting state */}
      {(permissionState === 'idle' || permissionState === 'requesting') && (
        <div style={styles.overlay} aria-live="polite">
          <div style={styles.spinner} />
          <p style={styles.overlayText}>Requesting camera access…</p>
        </div>
      )}

      {/* Error / denied / unavailable state */}
      {(permissionState === 'denied' || permissionState === 'unavailable') && (
        <div style={styles.overlay} role="alert">
          <svg style={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx={12} cy={12} r={10} />
            <line x1={12} y1={8} x2={12} y2={12} />
            <line x1={12} y1={16} x2={12.01} y2={16} />
          </svg>
          <p style={styles.errorText}>{errorMessage}</p>
          {permissionState === 'denied' && (
            <button onClick={handleRetry} style={styles.retryButton}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Inline styles ────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    background: '#0d0d0d',
    overflow: 'hidden',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    color: '#e0e0e0',
    background: 'rgba(13,13,13,0.85)',
    backdropFilter: 'blur(6px)',
    padding: '24px',
    textAlign: 'center',
  },
  overlayText: {
    margin: 0,
    fontSize: '14px',
    color: '#a0a0a0',
    letterSpacing: '0.02em',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(255,255,255,0.12)',
    borderTop: '3px solid #6c8eff',
    borderRadius: '50%',
    animation: 'camera-feed-spin 0.9s linear infinite',
  },
  errorIcon: {
    width: '48px',
    height: '48px',
    color: '#ff6b6b',
    flexShrink: 0,
  },
  errorText: {
    margin: 0,
    fontSize: '14px',
    color: '#ff9f9f',
    maxWidth: '320px',
    lineHeight: 1.5,
  },
  retryButton: {
    marginTop: '4px',
    padding: '8px 24px',
    background: 'linear-gradient(135deg, #6c8eff 0%, #a78bfa 100%)',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'opacity 0.2s',
  },
};

// Inject keyframe for the spinner (once, lazily)
if (typeof document !== 'undefined') {
  const id = 'camera-feed-keyframes';
  if (!document.getElementById(id)) {
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `@keyframes camera-feed-spin { to { transform: rotate(360deg); } }`;
    document.head.appendChild(style);
  }
}

export default CameraFeed;
