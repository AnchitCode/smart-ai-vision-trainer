import type { Results } from '@mediapipe/pose';
import { useEffect, useRef, useState } from 'react';
import { calculateAngle } from '../engine/biomechanics/angleCalculator';
import { countPushup } from '../engine/pushupCounter';
import { validatePushupForm, type FormStatus } from '../engine/formValidator';
import { speak } from '../engine/voiceCoach';
import { recordRep } from '../engine/workoutTracker';

// At runtime, Vite won't process the Pose class nicely from CJS to ESM 
// when it's excluded from optimizeDeps. By loading it via a dynamic import or window, 
// we bypass the "does not provide an export named 'Pose'" error.
type PoseConstructor = typeof import('@mediapipe/pose').Pose;

// NormalizedLandmark is the shape MediaPipe returns for each body keypoint.
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type UsePoseResult = {
  landmarks: React.RefObject<NormalizedLandmark[]>;
  pushupCount: number;
  formStatus: FormStatus;
};

/**
 * usePose
 *
 * Attaches a MediaPipe Pose model to a <video> element and returns the latest
 * array of 33 body landmarks on every detected frame.
 *
 * Key design decisions
 * ─────────────────────
 * • Landmarks are stored in a ref (no re-render on every frame). A lightweight
 *   counter state triggers the consumer to re-read the ref when new landmarks
 *   arrive – this keeps the detection loop fast.
 * • The RAF loop is guarded by `video.readyState >= 2` (HAVE_CURRENT_DATA) so
 *   we never send a blank frame to the model.
 * • The RAF id is stored in a ref so the cleanup can cancel it precisely,
 *   avoiding CPU leaks when the component unmounts.
 */
export function usePose(videoRef: React.RefObject<HTMLVideoElement | null>): UsePoseResult {
  const landmarksRef = useRef<NormalizedLandmark[]>([]);
  const lastElbowLogRef = useRef<{ t: number; angle: number }>({ t: 0, angle: NaN });
  const [pushupCount, setPushupCount] = useState(0);
  const pushupCountRef = useRef(0);
   const [formStatus, setFormStatus] = useState<FormStatus>('GOOD');
  const lastFormStatusRef = useRef<FormStatus>('GOOD');

  useEffect(() => {
    let destroyed = false;
    let rafId = 0;

    // ── Initialise once ───────────────────────────────────────────────────────
    // We dynamically import the class from the module to dodge Vite's ESM static analysis.
    let poseInstance: any = null;

    import('@mediapipe/pose').then((mp) => {
      // MediaPipe attaches to window.Pose in some build environments, or mp.Pose
      const PoseClass: PoseConstructor = mp.Pose || (window as any).Pose;

      if (!PoseClass) {
        console.error('Failed to load MediaPipe Pose construct.');
        return;
      }

      poseInstance = new PoseClass({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      poseInstance.onResults((results: Results) => {
        if (destroyed) return;
        if (results.poseLandmarks) {
          landmarksRef.current = results.poseLandmarks as NormalizedLandmark[];

          let pendingVoiceMessage: string | null = null;

          // ── Form validation (body straightness via hip angle) ───────────────
          const status = validatePushupForm(landmarksRef.current);
          if (status !== lastFormStatusRef.current) {
            lastFormStatusRef.current = status;
            setFormStatus(status);
            if (status === 'BAD') {
              pendingVoiceMessage = 'Keep your back straight';
            }
          }

          // Biomechanics: right elbow angle (shoulder-elbow-wrist => 11-13-15).
          const shoulder = landmarksRef.current[11];
          const elbow = landmarksRef.current[13];
          const wrist = landmarksRef.current[15];

          if (shoulder && elbow && wrist) {
            const elbowAngle = calculateAngle(shoulder, elbow, wrist);
            if (Number.isFinite(elbowAngle)) {
              const reps = countPushup(elbowAngle);
              if (reps > pushupCountRef.current) {
                pushupCountRef.current = reps;
                setPushupCount(reps);
                console.log(`Push-up reps: ${reps}`);

                // Record workout rep with current form status
                recordRep(lastFormStatusRef.current);

                // Voice priority:
                // 1) Form correction (already set pendingVoiceMessage if BAD)
                // 2) Rep encouragement
                // 3) Every-5-reps motivation
                if (!pendingVoiceMessage) {
                  if (reps % 5 === 0) {
                    pendingVoiceMessage = `You have completed ${reps} push ups. Keep going`;
                  } else {
                    pendingVoiceMessage = 'Great rep';
                  }
                }
              }

              // Logging every frame can tank FPS in devtools; throttle a bit.
              const now = performance.now();
              const prev = lastElbowLogRef.current;
              if (now - prev.t > 100 || Math.abs(elbowAngle - prev.angle) > 2) {
                lastElbowLogRef.current = { t: now, angle: elbowAngle };
                console.log(`Elbow Angle: ${Math.round(elbowAngle)}`);
              }
            }
          }

          if (pendingVoiceMessage) {
            speak(pendingVoiceMessage);
          }
        } else {
          landmarksRef.current = [];
        }
      });
    });

    // ── Detection loop ────────────────────────────────────────────────────────
    async function detect() {
      if (destroyed) return;

      const video = videoRef.current;

      // Wait until the video element has actual pixel data before sending.
      if (video && video.readyState >= 2 && !video.paused && poseInstance) {
        try {
          await poseInstance.send({ image: video });
        } catch {
          // Silently ignore mid-stream errors (e.g. component unmounted during
          // an async send). The destroyed flag will stop the next iteration.
        }
      }

      if (!destroyed) {
        rafId = requestAnimationFrame(detect);
      }
    }

    // ── Wait for the video to be ready before starting the loop ──────────────
    const video = videoRef.current;
    if (!video) return;

    const startDetection = () => {
      if (!destroyed) {
        rafId = requestAnimationFrame(detect);
      }
    };

    // If video is already loaded, start immediately; otherwise wait.
    if (video.readyState >= 2) {
      startDetection();
    } else {
      video.addEventListener('loadeddata', startDetection, { once: true });
    }

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadeddata', startDetection);
      if (poseInstance) {
        poseInstance.close();
      }
    };
  // videoRef.current is intentionally omitted – ref identity is stable.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Return the ref directly. Consumers should read .current inside their
  // own RAF loop or useEffect rather than using this as reactive state.
  return { landmarks: landmarksRef, pushupCount, formStatus };
}
