import { useInView } from '../../hooks/useInView';
import type { ReactNode, CSSProperties } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  threshold?: number;
}

/**
 * ScrollReveal — wraps children and animates them into view
 * on first scroll intersection.
 */
export default function ScrollReveal({
  children,
  className = '',
  style,
  delay = 0,
  direction = 'up',
  threshold = 0.15,
}: RevealProps) {
  const [ref, inView] = useInView(threshold);

  const translateMap: Record<string, string> = {
    up: 'translateY(32px)',
    down: 'translateY(-32px)',
    left: 'translateX(-32px)',
    right: 'translateX(32px)',
    none: 'none',
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'none' : translateMap[direction],
        transition: `opacity 600ms cubic-bezier(0.4,0,0.2,1) ${delay}ms, transform 600ms cubic-bezier(0.4,0,0.2,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
