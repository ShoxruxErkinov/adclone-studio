'use client';
import { useEffect, useRef, useState } from 'react';

export function VisionGlassCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const pos = useRef({
    x: -100,
    y: -100,
    targetX: -100,
    targetY: -100,
    vx: 0,
    vy: 0,
    scaleX: 1,
    scaleY: 1,
    angle: 0,
    isHovering: false,
    isMouseDown: false,
    hoverWidth: 32,
    hoverHeight: 32,
    magneticX: 0,
    magneticY: 0,
    hasMagnetic: false,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on desktop/devices with a mouse
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setMounted(true);

    const p = pos.current;
    p.targetX = window.innerWidth / 2;
    p.targetY = window.innerHeight / 2;
    p.x = p.targetX;
    p.y = p.targetY;

    const onMouseMove = (e: MouseEvent) => {
      p.targetX = e.clientX;
      p.targetY = e.clientY;

      // Magnetic hover detection on interactive targets
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'button, a, input, textarea, select, [role="button"], .fast-test-chip, .specimen-card, .metric-card'
      ) as HTMLElement | null;

      if (interactive) {
        p.isHovering = true;
        const rect = interactive.getBoundingClientRect();
        // Subtle magnetic pull towards element center
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distX = centerX - e.clientX;
        const distY = centerY - e.clientY;
        p.magneticX = distX * 0.22;
        p.magneticY = distY * 0.22;
        p.hasMagnetic = true;
        p.hoverWidth = Math.min(64, Math.max(38, rect.width * 0.45));
        p.hoverHeight = Math.min(48, Math.max(38, rect.height * 0.6));
      } else {
        p.isHovering = false;
        p.hasMagnetic = false;
        p.magneticX = 0;
        p.magneticY = 0;
      }
    };

    const onMouseDown = () => {
      p.isMouseDown = true;
    };

    const onMouseUp = () => {
      p.isMouseDown = false;
    };

    const onMouseLeave = () => {
      p.targetX = -100;
      p.targetY = -100;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    let animId: number;
    let prevX = p.x;
    let prevY = p.y;

    const tick = () => {
      if (cursorRef.current) {
        // Smooth lerp with magnetic pull
        const destX = p.targetX + (p.hasMagnetic ? p.magneticX : 0);
        const destY = p.targetY + (p.hasMagnetic ? p.magneticY : 0);

        p.x += (destX - p.x) * 0.16;
        p.y += (destY - p.y) * 0.16;

        // Velocity & Squash-stretch calculation
        const vx = p.x - prevX;
        const vy = p.y - prevY;
        prevX = p.x;
        prevY = p.y;

        const speed = Math.sqrt(vx * vx + vy * vy);
        const stretch = Math.min(0.28, speed * 0.012);
        const angle = Math.atan2(vy, vx) * (180 / Math.PI);

        let sX = 1 + stretch;
        let sY = 1 - stretch * 0.55;

        if (p.isMouseDown) {
          sX *= 0.75;
          sY *= 0.75;
        } else if (p.isHovering) {
          sX *= 1.45;
          sY *= 1.45;
        }

        // Apply smooth transform to glass bubble
        cursorRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%) rotate(${angle}deg) scale(${sX}, ${sY})`;

        // Dot inside stays sharp at cursor point
        if (dotRef.current) {
          dotRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
          dotRef.current.style.opacity = p.isHovering ? '0.2' : '0.85';
        }

        // Ambient glow
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Ambient soft glow follower */}
      <div
        ref={glowRef}
        className="vision-cursor-ambient-glow"
        style={{ left: 0, top: 0 }}
        aria-hidden="true"
      />

      {/* Sleek Apple Vision Pro Glass Bubble */}
      <div
        ref={cursorRef}
        className="vision-glass-cursor"
        style={{ left: 0, top: 0 }}
        aria-hidden="true"
      >
        <div className="vision-glass-specular-edge" />
        <div className="vision-glass-specular-glare" />
      </div>

      {/* Tiny sharp center point dot */}
      <div
        ref={dotRef}
        className="vision-cursor-center-dot"
        style={{ left: 0, top: 0 }}
        aria-hidden="true"
      />
    </>
  );
}
