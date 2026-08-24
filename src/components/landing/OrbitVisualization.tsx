import React, { useRef, useEffect } from 'react';
import styles from './OrbitVisualization.module.css';

export interface OrbitVisualizationProps {
  /** Data for each orbital ring */
  interests?: Array<{
    label: string;
    radius: number;
    period: number;
    percent?: number;
    initialAngle?: number;
  }>;
}


export default function OrbitVisualization({
  interests = [
    // Outer orbit
    { label: 'Programming', radius: 300, period: 36, initialAngle: 0, percent: 85 },
    // Middle‑outer orbit
    { label: 'AI', radius: 250, period: 38, initialAngle: Math.PI / 2, percent: 78 },
    // Middle‑inner orbit
    { label: 'Cybersecurity', radius: 200, period: 42, initialAngle: Math.PI, percent: 70 },
    // Inner orbit group – additional topics
    { label: 'Design', radius: 150, period: 44, initialAngle: Math.PI / 4, percent: 65 },
    { label: 'Gaming', radius: 120, period: 46, initialAngle: (3 * Math.PI) / 4, percent: 60 },
    { label: 'Science', radius: 90, period: 48, initialAngle: (5 * Math.PI) / 4, percent: 55 },
    { label: 'Technology', radius: 60, period: 50, initialAngle: (7 * Math.PI) / 4, percent: 50 },
  ],
} : OrbitVisualizationProps) {
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const uniqueRadii = Array.from(new Set(interests.map(it => it.radius))).sort((a, b) => b - a);

  useEffect(() => {
    // Respect reduced‑motion preferences
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    let animationFrame: number;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = (now - start) / 1000; // seconds
      interests.forEach((it, i) => {
        const angularSpeed = (2 * Math.PI) / it.period; // rad/s
        const angle = (it.initialAngle ?? 0) + angularSpeed * elapsed;
        const x = Math.cos(angle) * it.radius;
        const y = Math.sin(angle) * it.radius;
        const el = labelRefs.current[i];
        if (el) {
          el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        }
      });
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [interests]);

  return (
    <div className={styles.orbitSystem}>
      {/* Render concentric rings for visual reference */}
      {uniqueRadii.map((r, i) => (
        <div
          key={`ring-${i}`}
          className={styles.orbitRing}
          style={{
            width: `${r * 2}px`,
            height: `${r * 2}px`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Render the orbital labels */}
      {interests.map((it, idx) => (
        <div
          key={idx}
          ref={el => {
            labelRefs.current[idx] = el;
          }}
          className={styles.orbitItem}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            color: 'rgba(205, 195, 230, 0.72)',
            textShadow: '0 0 10px rgba(150, 100, 255, 0.22)',
            opacity: 0.75,
            fontSize: '0.875rem',
            pointerEvents: 'none',
          } as React.CSSProperties}
        >
          {it.label} <span
            style={{
              marginLeft: '0.25rem',
              fontSize: '0.75rem',
              color: 'rgba(150,100,255,0.6)',
            }}
          >
            {it.percent}%
          </span>
        </div>
      ))}
    </div>
  );
}

