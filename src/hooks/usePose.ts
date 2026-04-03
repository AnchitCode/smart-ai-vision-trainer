import type { Results } from '@mediapipe/pose';
import { useEffect, useRef, useState } from 'react';
import { calculateAngle } from '../engine/biomechanics/angleCalculator';
import { countPushup, resetPushupCounter } from '../engine/pushupCounter';
import { countSquat, resetSquatCounter } from '../engine/squatCounter';
import { countCurl, resetCurlCounter } from '../engine/curlCounter';
import {
  countJumpingJack,
  resetJumpingJackCounter,
} from '../engine/jumpingJackCounter';
import { validatePushupForm, type FormStatus } from '../engine/formValidator';
import { speak } from '../engine/voiceCoach';
import { recordRep } from '../engine/workoutTracker';
import type { ExerciseType } from '../types/exercise';

type PoseConstructor = typeof import('@mediapipe/pose').Pose;

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export type UsePoseResult = {
  landmarks: React.RefObject<NormalizedLandmark[]>;
  reps: number;
  formStatus: FormStatus;
  isModelLoaded: boolean;
};

export function usePose(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  exercise: ExerciseType,
): UsePoseResult {

  const landmarksRef = useRef<NormalizedLandmark[]>([]);

  const [reps, setReps] = useState(0);
  const repsRef = useRef(0);

  const [formStatus, setFormStatus] = useState<FormStatus>('GOOD');
  const lastFormStatusRef = useRef<FormStatus>('GOOD');

  const exerciseRef = useRef<ExerciseType>(exercise);

  const lastAngleLogRef = useRef<{ t: number; angle: number }>({ t: 0, angle: NaN });

  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // keep exercise ref updated
  useEffect(() => {
    exerciseRef.current = exercise;

    repsRef.current = 0;
    setReps(0);

    resetPushupCounter();
    resetSquatCounter();
    resetCurlCounter();
    resetJumpingJackCounter();

  }, [exercise]);

  useEffect(() => {

    let destroyed = false;
    let rafId = 0;
    let poseInstance: any = null;

    import('@mediapipe/pose').then((mp) => {

      const PoseClass: PoseConstructor = mp.Pose || (window as any).Pose;

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
        
        setIsModelLoaded(true);

        if (!results.poseLandmarks) {
          landmarksRef.current = [];
          return;
        }

        landmarksRef.current = results.poseLandmarks as NormalizedLandmark[];

        const currentExercise = exerciseRef.current;

        let pendingVoice: string | null = null;

        if (currentExercise === 'PUSHUP') {
          const status = validatePushupForm(landmarksRef.current);

          if (status !== lastFormStatusRef.current) {
            lastFormStatusRef.current = status;
            setFormStatus(status);

            if (status === 'BAD') {
              pendingVoice = 'Keep your back straight';
            }
          }
        }

        const shoulder = landmarksRef.current[11];
        const elbow = landmarksRef.current[13];
        const wrist = landmarksRef.current[15];

        const hip = landmarksRef.current[23];
        const knee = landmarksRef.current[25];
        const ankle = landmarksRef.current[27];

        let angleForLogging: number | null = null;
        let newReps = repsRef.current;

        switch (currentExercise) {

          case 'PUSHUP':
          case 'CURL':

            if (shoulder && elbow && wrist) {

              const elbowAngle = calculateAngle(shoulder, elbow, wrist);
              angleForLogging = elbowAngle;

              if (Number.isFinite(elbowAngle)) {

                newReps =
                  currentExercise === 'PUSHUP'
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

            const rightShoulder = landmarksRef.current[12];
            const rightWrist = landmarksRef.current[16];
            const rightAnkle = landmarksRef.current[28];

            if (shoulder && wrist && ankle && rightShoulder && rightWrist && rightAnkle) {

              const armsUp = wrist.y < shoulder.y && rightWrist.y < rightShoulder.y;
              const feetDistance = Math.abs(ankle.x - rightAnkle.x);
              const feetWide = feetDistance > 0.25;

              newReps = countJumpingJack(armsUp && feetWide);

            }

            break;
        }

        if (newReps > repsRef.current) {

          repsRef.current = newReps;
          setReps(newReps);

          console.log(`${currentExercise} reps: ${newReps}`);

          recordRep(currentExercise, lastFormStatusRef.current);

          if (!pendingVoice) {

            const repMessage =
              currentExercise === 'PUSHUP'
                ? 'Great push-up!'
                : currentExercise === 'SQUAT'
                ? 'Nice squat!'
                : currentExercise === 'CURL'
                ? 'Good curl!'
                : 'Great jumping jack!';

            pendingVoice = repMessage;
          }
        }

        if (angleForLogging != null && Number.isFinite(angleForLogging)) {

          const now = performance.now();
          const prev = lastAngleLogRef.current;

          if (now - prev.t > 100 || Math.abs(angleForLogging - prev.angle) > 2) {

            lastAngleLogRef.current = { t: now, angle: angleForLogging };
            console.log(`Primary angle: ${Math.round(angleForLogging)}`);

          }
        }

        if (pendingVoice) speak(pendingVoice);

      });

    });

    async function detect() {

      if (destroyed) return;

      const video = videoRef.current;

      if (video && video.readyState >= 2 && !video.paused && poseInstance) {

        try {
          await poseInstance.send({ image: video });
        } catch {}

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

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      video.removeEventListener('loadeddata', start);
      if (poseInstance) poseInstance.close();
    };

  }, []);

  return { landmarks: landmarksRef, reps, formStatus, isModelLoaded };
}