import React, { useEffect, useRef } from 'react';
import type { NormalizedLandmark } from '../../hooks/usePose';

/**
 * Mediapipe connects 33 pose landmark indices in pairs.
 * Only the most visually useful ones are drawn here.
 */
const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // Left arm
  [11, 13], [13, 15],
  // Right arm
  [12, 14], [14, 16],
  // Left leg
  [23, 25], [25, 27], [27, 29], [27, 31],
  // Right leg
  [24, 26], [26, 28], [28, 30], [28, 32],
];

interface PoseOverlayProps {
  /** Ref to the <video> element – used to size the canvas correctly. */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Stable ref whose .current holds the latest landmark array. */
  landmarksRef: React.RefObject<NormalizedLandmark[]>;
}

/**
 * PoseOverlay
 *
 * Draws the 33 MediaPipe body keypoints (and connecting lines) on a <canvas>
 * that is absolutely positioned over the video element.
 *
 * The overlay runs its own requestAnimationFrame loop so it always draws at
 * the video frame rate rather than being bottlenecked by React re-renders.
 */
const PoseOverlay: React.FC<PoseOverlayProps> = ({ videoRef, landmarksRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);

      const video = videoRef.current;
      const ctx = canvas!.getContext('2d');
      if (!ctx || !video) return;

      // Keep the canvas resolution in sync with the live video stream.
      const vw = video.videoWidth || canvas!.offsetWidth;
      const vh = video.videoHeight || canvas!.offsetHeight;
      if (canvas!.width !== vw) canvas!.width = vw;
      if (canvas!.height !== vh) canvas!.height = vh;

      ctx.clearRect(0, 0, canvas!.width, canvas!.height);

      const landmarks = landmarksRef.current ?? [];
      if (landmarks.length === 0) return;

      const W = canvas!.width;
      const H = canvas!.height;

      // ── Draw skeleton lines ─────────────────────────────────────────────────
      ctx.strokeStyle = 'rgba(100, 200, 255, 0.7)';
      ctx.lineWidth = 2;

      for (const [a, b] of POSE_CONNECTIONS) {
        const lmA = landmarks[a];
        const lmB = landmarks[b];
        if (!lmA || !lmB) continue;
        if ((lmA.visibility ?? 1) < 0.5 || (lmB.visibility ?? 1) < 0.5) continue;

        // Mirror X to match the flipped video feed.
        const ax = (1 - lmA.x) * W;
        const ay = lmA.y * H;
        const bx = (1 - lmB.x) * W;
        const by = lmB.y * H;

        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();
      }

      // ── Draw joint dots ─────────────────────────────────────────────────────
      for (const landmark of landmarks) {
        if ((landmark.visibility ?? 1) < 0.5) continue;

        const x = (1 - landmark.x) * W;
        const y = landmark.y * H;

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = '#FF6B6B';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);
  // videoRef and landmarksRef both have stable identity.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // Let clicks fall through to the video
      }}
    />
  );
};

export default PoseOverlay;
