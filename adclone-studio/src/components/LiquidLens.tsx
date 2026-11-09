'use client';
import { useEffect, useRef, useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';

interface LiquidLensProps {
  active: boolean;
  onToggle?: (nextState: boolean) => void;
}

export function LiquidLens({ active, onToggle }: LiquidLensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ currentX: 0, currentY: 0, targetX: 0, targetY: 0, vx: 0, vy: 0 });
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
        pos.currentX += (pos.targetX - pos.currentX) * 0.11;
        pos.currentY += (pos.targetY - pos.currentY) * 0.11;

        // Velocity for jelly / liquid wobble deformation
        const vx = pos.currentX - prevX;
        const vy = pos.currentY - prevY;
        prevX = pos.currentX;
        prevY = pos.currentY;

        const speed = Math.sqrt(vx * vx + vy * vy);
        const stretch = Math.min(0.22, speed * 0.007);
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);

        const scaleX = 1 + stretch;
        const scaleY = 1 - stretch * 0.7;

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
      className="liquid-lens-wrapper pointer-events-none fixed z-50 transition-opacity duration-300"
      style={{ left: 0, top: 0, willChange: 'transform' }}
    >
      <div className="relative h-44 w-44 md:h-52 md:w-52 rounded-full p-2.5 backdrop-blur-[10px] bg-sky-950/20 shadow-[0_0_60px_rgba(0,244,254,0.45),inset_0_0_35px_rgba(255,255,255,0.45)] border border-white/30">
        {/* Rotating Chromatic Dispersion Rim */}
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-400/40 via-purple-500/25 to-blue-500/40 animate-spin"
          style={{ animationDuration: '14s' }}
        />

        {/* Specular Glare Highlights */}
        <div className="absolute top-3.5 left-6 h-7 w-16 -rotate-35 rounded-full bg-gradient-to-b from-white/95 to-transparent blur-[1px]" />
        <div className="absolute bottom-5 right-7 h-4 w-9 rotate-25 rounded-full bg-cyan-300/60 blur-[2px]" />

        {/* Inner Vitreous Core with Magnification Metrics */}
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-radial from-cyan-400/10 via-blue-900/20 to-slate-950/40 backdrop-contrast-150 backdrop-brightness-125 text-center p-3">
          <span className="material-symbols-outlined text-cyan-300 text-2xl drop-shadow-[0_0_10px_#00f4fe] animate-pulse">
            <Sparkles size={22} className="text-cyan-300" />
          </span>
          <span className="font-mono text-[11px] font-extrabold tracking-widest text-cyan-200 mt-1 drop-shadow-sm">
            LENS 2.4X
          </span>
          <span className="font-mono text-[9px] text-cyan-300/80 tracking-wider">
            λ 488nm CAUSTIC
          </span>
        </div>
      </div>
    </div>
  );
}
