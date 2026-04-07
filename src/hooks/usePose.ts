import type { Results } from '@mediapipe/pose';
import { useEffect, useRef, useState, useCallback } from 'react';
import { calculateAngle } from '../engine/biomechanics/angleCalculator';
import { countPushup, resetPushupCounter } from '../engine/pushupCounter';
import { countSquat, resetSquatCounter } from '../engine/squatCounter';
import { countCurl, resetCurlCounter } from '../engine/curlCounter';
import { countJumpingJack, resetJumpingJackCounter } from '../engine/jumpingJackCounter';
import { validateForm, type FormStatus } from '../engine/formValidator';
import { speak } from '../engine/voiceCoach';
import { recordRep } from '../engine/workoutTracker';
import type { ExerciseType } from '../types/exercise';

// ─── Dev-only logger (stripped in production builds) ──────────────────────────
const DEV = import.meta.env.DEV;
const log = (...args: unknown[]) => { if (DEV) console.log(...args); };
const warn = (...args: unknown[]) => { if (DEV) console.warn(...args); };

// ─── Types ─────────────────────────────────────────────────────────────────────
type PoseConstructor = typeof import('@mediapipe/pose').Pose;

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/** All possible loading/error states for the model */
export type ModelState = 'idle' | 'loading' | 'ready' | 'error';

export type UsePoseResult = {
  landmarks: React.RefObject<NormalizedLandmark[]>;
  reps: number;
  formStatus: FormStatus;
  /** Granular model state — use this to drive your loading UI */
  modelState: ModelState;
  /** Human-readable error message when modelState === 'error' */
  modelError: string | null;
};

// ─── Voice message map ─────────────────────────────────────────────────────────
const REP_VOICE_MESSAGES: Record<ExerciseType, string> = {
  PUSHUP: 'Great push-up!',
  SQUAT: 'Nice squat!',
  CURL: 'Good curl!',
  JUMPING_JACK: 'Great jumping jack!',
};

// ─── Angle throttle config ─────────────────────────────────────────────────────
const ANGLE_LOG_INTERVAL_MS = 100;
const ANGLE_LOG_MIN_DELTA = 2;

// ─────────────────────────────────────────────────────────────────────────────
// usePose
// Responsibilities:
//   1. Load MediaPipe Pose WASM model (useMediaPipeLoader)
//   2. Run the per-frame detection loop
//   3. Route landmarks to the correct exercise counter
//   4. Trigger voice feedback
// ─────────────────────────────────────────────────────────────────────────────
export function usePose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  exercise: ExerciseType,
): UsePoseResult {

  // ── Landmark data lives in a ref — never triggers a re-render ──────────────
  const landmarksRef = useRef<NormalizedLandmark[]>([]);

  // ── Rep count: ref for synchronous reads inside RAF, state for React UI ────
  const [reps, setReps] = useState(0);
  const repsRef = useRef(0);

  // ── Form status ────────────────────────────────────────────────────────────
  const [formStatus, setFormStatus] = useState<FormStatus>('GOOD');
  const lastFormStatusRef = useRef<FormStatus>('GOOD');

  // ── Granular model state (replaces simple isModelLoaded boolean) ───────────
  const [modelState, setModelState] = useState<ModelState>('idle');
  const [modelError, setModelError] = useState<string | null>(null);

  // ── Keep exercise ref in sync so the RAF loop always reads current value ───
  const exerciseRef = useRef<ExerciseType>(exercise);

  // ── Throttle angle logging ─────────────────────────────────────────────────
  const lastAngleLogRef = useRef<{ t: number; angle: number }>({ t: 0, angle: NaN });

  // ── Stable ref to the pose instance so cleanup can always reach it ─────────
  const poseInstanceRef = useRef<any>(null);

  // ─── Effect 1: Reset counters when exercise changes ───────────────────────
  useEffect(() => {
    exerciseRef.current = exercise;
    repsRef.current = 0;
    setReps(0);
    setFormStatus('GOOD');
    lastFormStatusRef.current = 'GOOD';

    resetPushupCounter();
    resetSquatCounter();
    resetCurlCounter();
    resetJumpingJackCounter();
  }, [exercise]);

  // ─── Per-frame results handler (stable reference via useCallback) ──────────
  const handleResults = useCallback((results: Results) => {
    if (!results.poseLandmarks) {
      landmarksRef.current = [];
      return;
    }

    landmarksRef.current = results.poseLandmarks as NormalizedLandmark[];
    const lm = landmarksRef.current;
    const currentExercise = exerciseRef.current;

    let pendingVoice: string | null = null;

    // ── Form validation — now supports all exercises via formValidator ────────
    // formValidator.ts should export validateForm(landmarks, exercise): FormStatus
    // This removes the hard-coded PUSHUP-only check.
    const status = validateForm(lm, currentExercise);
    if (status !== lastFormStatusRef.current) {
      lastFormStatusRef.current = status;
      setFormStatus(status);
      if (status === 'BAD') {
        const formMessages: Record<ExerciseType, string> = {
          PUSHUP: 'Keep your back straight',
          SQUAT: 'Keep your chest up',
          CURL: 'Control the movement',
          JUMPING_JACK: 'Fully extend your arms',
        };
        pendingVoice = formMessages[currentExercise];
      }
    }

    // ── Landmark shortcuts ────────────────────────────────────────────────────
    const shoulder    = lm[11];
    const elbow       = lm[13];
    const wrist       = lm[15];
    const hip         = lm[23];
    const knee        = lm[25];
    const ankle       = lm[27];
    const rShoulder   = lm[12];
    const rWrist      = lm[16];
    const rAnkle      = lm[28];

    let angleForLogging: number | null = null;
    let newReps = repsRef.current;

    // ── Exercise routing ──────────────────────────────────────────────────────
    switch (currentExercise) {

      case 'PUSHUP':
      case 'CURL':
        if (shoulder && elbow && wrist) {
          const elbowAngle = calculateAngle(shoulder, elbow, wrist);
          angleForLogging = elbowAngle;
          if (Number.isFinite(elbowAngle)) {
            newReps = currentExercise === 'PUSHUP'
              ? countPushup(elbowAngle)
              : countCurl(elbowAngle);
          }
        }
        break;

      case 'SQUAT':
        if (hip && knee && ankle) {
          const kneeAngle = calculateAngle(hip, knee, ankle);
          angleForLogging = kneeAngle;
          if (Number.isFinite(kneeAngle)) {
            newReps = countSquat(kneeAngle);
          }
        }
        break;

      case 'JUMPING_JACK':
        if (shoulder && wrist && ankle && rShoulder && rWrist && rAnkle) {
          const armsUp      = wrist.y < shoulder.y && rWrist.y < rShoulder.y;
          const feetWide    = Math.abs(ankle.x - rAnkle.x) > 0.25;
          newReps = countJumpingJack(armsUp && feetWide);
        }
        break;
    }

    // ── Rep registered ────────────────────────────────────────────────────────
    if (newReps > repsRef.current) {
      repsRef.current = newReps;
      setReps(newReps);
      log(`[usePose] ${currentExercise} reps:`, newReps);
      recordRep(currentExercise, lastFormStatusRef.current);
      if (!pendingVoice) {
        pendingVoice = REP_VOICE_MESSAGES[currentExercise];
      }
    }

    // ── Throttled angle logging (DEV only) ────────────────────────────────────
    if (DEV && angleForLogging != null && Number.isFinite(angleForLogging)) {
      const now  = performance.now();
      const prev = lastAngleLogRef.current;
      if (now - prev.t > ANGLE_LOG_INTERVAL_MS || Math.abs(angleForLogging - prev.angle) > ANGLE_LOG_MIN_DELTA) {
        lastAngleLogRef.current = { t: now, angle: angleForLogging };
        log(`[usePose] Primary angle: ${Math.round(angleForLogging)}°`);
      }
    }

    if (pendingVoice) speak(pendingVoice);
  }, []);

  // ─── Effect 2: Model initialization & RAF detection loop ──────────────────
  useEffect(() => {
    let destroyed = false;
    let rafId = 0;

    setModelState('loading');
    setModelError(null);

    // ── Load MediaPipe ────────────────────────────────────────────────────────
    import('@mediapipe/pose')
      .then((mp) => {
        if (destroyed) return;

        const PoseClass: PoseConstructor = mp.Pose ?? (window as any).Pose;

        const pose = new PoseClass({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: Results) => {
          // FIX: Model is ready the moment it can return results — set once.
          // This is more reliable than hooking into the constructor promise.
          if (modelState !== 'ready') {
            setModelState('ready');
          }
          handleResults(results);
        });

        poseInstanceRef.current = pose;

        // ── RAF detection loop ──────────────────────────────────────────────
        async function detect() {
          if (destroyed) return;

          const video = videoRef.current;
          if (video && video.readyState >= 2 && !video.paused && poseInstanceRef.current) {
            try {
              await poseInstanceRef.current.send({ image: video });
            } catch (err) {
              // FIX: Never silently swallow errors — log in dev, surface in prod
              warn('[usePose] poseInstance.send() failed:', err);

              // If we get repeated failures, surface as error state
              if (!destroyed) {
                setModelState('error');
                setModelError('Pose detection failed. Please refresh and try again.');
                destroyed = true; // Stop the loop on fatal error
                return;
              }
            }
          }

          if (!destroyed) rafId = requestAnimationFrame(detect);
        }

        const video = videoRef.current;
        if (!video) return;

        const start = () => {
          if (!destroyed) rafId = requestAnimationFrame(detect);
        };

        if (video.readyState >= 2) start();
        else video.addEventListener('loadeddata', start, { once: true });
      })
      .catch((err) => {
        // FIX: Handle model load failure gracefully
        if (!destroyed) {
          warn('[usePose] Failed to load MediaPipe:', err);
          setModelState('error');
          setModelError('Failed to load AI model. Check your connection and refresh.');
        }
      });

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);

      const video = videoRef.current;
      if (video) video.removeEventListener('loadeddata', () => {});

      if (poseInstanceRef.current) {
        poseInstanceRef.current.close();
        poseInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — model loads once per mount

  return {
    landmarks: landmarksRef,
    reps,
    formStatus,
    modelState,
    modelError,
  };
}