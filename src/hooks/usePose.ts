import { Pose, Results } from '@mediapipe/pose';
import { useEffect, useRef, useCallback } from 'react';

interface UsePoseOptions {
  modelComplexity?: 0 | 1;
  smoothLandmarks?: boolean;
  enableSegmentation?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  onResults?: (results: Results) => void;
}

export function usePose(
  videoRef: React.RefObject<HTMLVideoElement>,
  options: UsePoseOptions = {}
) {
  const poseRef = useRef<Pose | null>(null);

  const {
    modelComplexity = 1,
    smoothLandmarks = true,
    enableSegmentation = false,
    minDetectionConfidence = 0.5,
    minTrackingConfidence = 0.5,
    onResults,
  } = options;

  // Initialize pose model
  useEffect(() => {
    if (!videoRef.current) return;

    try {
      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity,
        smoothLandmarks,
        enableSegmentation,
        minDetectionConfidence,
        minTrackingConfidence,
      });

      // Handle pose results
      pose.onResults((results: Results) => {
        console.log('📍 Pose Landmarks:', results.poseLandmarks);
        
        // Call user's callback if provided
        if (onResults) {
          onResults(results);
        }
      });

      poseRef.current = pose;

      console.log('✅ Pose model initialized');

      // Start pose detection
      const sendToMediaPipe = async () => {
        if (!videoRef.current || !poseRef.current) return;

        try {
          await poseRef.current.send({ image: videoRef.current });
          requestAnimationFrame(sendToMediaPipe);
        } catch (error) {
          console.error('Pose detection error:', error);
        }
      };

      // Wait for video to be ready
      const video = videoRef.current;
      if (video.readyState === 4) {
        // Video is already ready
        sendToMediaPipe();
      } else {
        // Wait for video to be ready
        video.addEventListener('canplay', () => {
          sendToMediaPipe();
        }, { once: true });
      }
    } catch (error) {
      console.error('Failed to initialize pose model:', error);
    }

    // Cleanup
    return () => {
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, [videoRef, modelComplexity, smoothLandmarks, enableSegmentation, minDetectionConfidence, minTrackingConfidence, onResults]);

  return poseRef;
}
