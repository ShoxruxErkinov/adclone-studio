'use client';
import { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface LiquidLensProps {
  active: boolean;
  onToggle?: (nextState: boolean) => void;
}

export function LiquidLens({ active }: LiquidLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const pos = posRef.current;
    pos.currentX = window.innerWidth * 0.65;
    pos.currentY = window.innerHeight * 0.45;
    pos.targetX = pos.currentX;
    pos.targetY = pos.currentY;

    const onMouseMove = (e: MouseEvent) => {
      pos.targetX = e.clientX;
      pos.targetY = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let animId: number;
    let prevX = pos.currentX;
    let prevY = pos.currentY;

    const update = () => {
      if (containerRef.current) {
        // Fluid spring interpolation
        pos.currentX += (pos.targetX - pos.currentX) * 0.12;
        pos.currentY += (pos.targetY - pos.currentY) * 0.12;

        // Velocity for jelly / liquid wobble deformation
        const vx = pos.currentX - prevX;
        const vy = pos.currentY - prevY;
        prevX = pos.currentX;
        prevY = pos.currentY;

        const speed = Math.sqrt(vx * vx + vy * vy);
        const stretch = Math.min(0.2, speed * 0.006);
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);

        const scaleX = 1 + stretch;
        const scaleY = 1 - stretch * 0.65;

        containerRef.current.style.transform = `translate3d(${pos.currentX}px, ${pos.currentY}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${scaleX}, ${scaleY})`;
      }
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!mounted || !active) return null;

  return (
    <div
      ref={containerRef}
      className="liquid-lens-container"
      style={{ left: 0, top: 0 }}
      aria-hidden="true"
    >
      <div className="liquid-lens-body">
        {/* Rotating Chromatic Dispersion Rim */}
        <div className="liquid-lens-chromatic-ring" />

        {/* Specular Glare Highlights */}
        <div className="liquid-lens-glare-primary" />
        <div className="liquid-lens-glare-secondary" />

        {/* Inner Vitreous Core */}
        <div className="liquid-lens-core">
          <Sparkles size={20} className="liquid-lens-sparkle" />
          <span className="liquid-lens-label-main">LENS 2.4X</span>
          <span className="liquid-lens-label-sub">λ 488nm CAUSTIC</span>
        </div>
      </div>
    </div>
  );
}
