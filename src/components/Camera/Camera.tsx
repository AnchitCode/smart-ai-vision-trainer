import React, { useEffect, useRef, useState } from 'react';

interface CameraFeedProps {
  onVideoReady?: (videoElement: HTMLVideoElement) => void;
  className?: string;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ onVideoReady, className }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Request camera permission
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        // Set video stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          onVideoReady?.(videoRef.current);
        }

        setIsLoading(false);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to access camera';
        setError(errorMessage);
        console.error('Camera error:', err);
        setIsLoading(false);
      }
    };

    startCamera();

    // Cleanup: stop all tracks when component unmounts
    return () => {
      if (videoRef.current?.srcObject instanceof MediaStream) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, [onVideoReady]);

  return (
    <div className={`camera-feed-container ${className || ''}`}>
      {error && (
        <div className="camera-error">
          <p>⚠️ Camera Error: {error}</p>
          <p className="error-hint">
            Please ensure you've granted camera permissions and your camera is
            available.
          </p>
        </div>
      )}
      {isLoading && !error && <div className="camera-loading">Loading camera...</div>}
      <video
        ref={videoRef}
        className={`camera-video ${error ? 'hidden' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: 'scaleX(-1)',
        }}
        playsInline
      />
    </div>
  );
};

export default CameraFeed;
