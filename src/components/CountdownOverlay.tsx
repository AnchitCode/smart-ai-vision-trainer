import { useState, useEffect, useCallback } from 'react';
import './CountdownOverlay.css';

interface CountdownOverlayProps {
  /** Called when countdown finishes and fade-out completes */
  onComplete: () => void;
}

/**
 * CountdownOverlay
 *
 * Full-screen 3-2-1-GO overlay with scale + glow animations.
 * Fades out smoothly after "GO!" before triggering onComplete.
 */
export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [value, setValue] = useState(3);
  const [phase, setPhase] = useState<'counting' | 'go' | 'fading'>('counting');

  const finish = useCallback(() => {
    setPhase('fading');
    // Wait for the CSS fade-out transition
    setTimeout(onComplete, 500);
  }, [onComplete]);

  useEffect(() => {
    if (phase !== 'counting' && phase !== 'go') return;

    const timer = setTimeout(() => {
      if (phase === 'go') {
        finish();
        return;
      }

      if (value > 1) {
        setValue((v) => v - 1);
      } else {
        setPhase('go');
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [value, phase, finish]);

  return (
    <div className={`countdown-overlay ${phase === 'fading' ? 'countdown-overlay--fading' : ''}`}>
      {/* Background glow */}
      <div className="countdown-bg-glow" aria-hidden="true" />

      {/* Number or GO */}
      <div className="countdown-center">
        {phase === 'counting' && (
          <span className="countdown-number" key={value}>
            {value}
          </span>
        )}
        {phase === 'go' && (
          <span className="countdown-go" key="go">
            GO!
          </span>
        )}
      </div>

      {/* Subtitle */}
      <p className="countdown-subtitle">
        {phase === 'counting' ? 'Get ready…' : "Let's go!"}
      </p>
    </div>
  );
}
