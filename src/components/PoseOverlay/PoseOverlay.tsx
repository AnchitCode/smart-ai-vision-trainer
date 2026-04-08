import React, { useEffect, useRef } from 'react';
import type { NormalizedLandmark } from '../../hooks/usePose';

// ─── Skeleton connections ──────────────────────────────────────────────────────
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

const VISIBILITY_THRESHOLD = 0.5;
const DOT_RADIUS            = 5;
const LINE_WIDTH            = 2;
const DOT_BORDER_WIDTH      = 2;

// ─── Theme color reader ────────────────────────────────────────────────────────
// Canvas 2D API cannot consume CSS variables — ctx.strokeStyle won't resolve
// var(--color-neon-cyan). Read computed values once at mount and cache them.
function readCSSVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface PoseOverlayProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  landmarksRef: React.RefObject<NormalizedLandmark[]>;
}

// ─── Component ────────────────────────────────────────────────────────────────

const PoseOverlay: React.FC<PoseOverlayProps> = ({ videoRef, landmarksRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // FIX: Cast to non-null after the guard — TypeScript loses null-narrowing
    // inside nested function closures, so the cast is necessary and safe here.
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | null;
    if (!ctx) return;

    // From this point ctx is guaranteed non-null. Cast once so the closure
    // doesn't re-trigger the TS18047 error on every ctx usage inside draw().
    const safeCtx = ctx as CanvasRenderingContext2D;

    // Read theme tokens once — canvas API can't use CSS vars directly
    const colorLine = readCSSVar('--color-neon-cyan',    '#00e5ff');
    const colorDot  = readCSSVar('--color-neon-blue',    '#00b4ff');
    const colorRing = readCSSVar('--color-text-primary',  '#f0f2ff');

    // Semi-transparent skeleton line color
    const colorLineFaded = colorLine.startsWith('#') && colorLine.length === 7
      ? colorLine + 'b3'
      : 'rgba(0, 229, 255, 0.70)';

    let rafId = 0;

    function draw() {
      rafId = requestAnimationFrame(draw);

      const video = videoRef.current;
      if (!video) return;

      // Keep canvas resolution in sync with the live video stream
      const vw = video.videoWidth  || canvas!.offsetWidth;
      const vh = video.videoHeight || canvas!.offsetHeight;
      if (canvas!.width  !== vw) canvas!.width  = vw;
      if (canvas!.height !== vh) canvas!.height = vh;

      safeCtx.clearRect(0, 0, canvas!.width, canvas!.height);

      const landmarks = landmarksRef.current ?? [];
      if (landmarks.length === 0) return;

      const W = canvas!.width;
      const H = canvas!.height;

      // ── Skeleton lines ──────────────────────────────────────────────────────
      safeCtx.strokeStyle = colorLineFaded;
      safeCtx.lineWidth   = LINE_WIDTH;
      safeCtx.lineCap     = 'round';

      for (const [a, b] of POSE_CONNECTIONS) {
        const lmA = landmarks[a];
        const lmB = landmarks[b];
        if (!lmA || !lmB) continue;
        if ((lmA.visibility ?? 1) < VISIBILITY_THRESHOLD) continue;
        if ((lmB.visibility ?? 1) < VISIBILITY_THRESHOLD) continue;

        // Mirror X to match CSS scaleX(-1) on the video element
        safeCtx.beginPath();
        safeCtx.moveTo((1 - lmA.x) * W, lmA.y * H);
        safeCtx.lineTo((1 - lmB.x) * W, lmB.y * H);
        safeCtx.stroke();
      }

      // ── Joint dots ──────────────────────────────────────────────────────────
      for (const landmark of landmarks) {
        if ((landmark.visibility ?? 1) < VISIBILITY_THRESHOLD) continue;

        const x = (1 - landmark.x) * W;
        const y = landmark.y * H;

        // Filled dot
        safeCtx.beginPath();
        safeCtx.arc(x, y, DOT_RADIUS, 0, 2 * Math.PI);
        safeCtx.fillStyle = colorDot;
        safeCtx.fill();

        // Ring border for contrast
        safeCtx.strokeStyle = colorRing;
        safeCtx.lineWidth   = DOT_BORDER_WIDTH;
        safeCtx.stroke();
      }
    }

    rafId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafId);

  // videoRef and landmarksRef are stable refs — safe to omit from deps
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
};

export default PoseOverlay;
