'use client';
import { useEffect, useRef, useState } from 'react';

/**
 * Apple Vision Pro-style Liquid Glass Cursor
 * 
 * Zero-lag instant 1:1 tracking for the glass lens ring,
 * with a silky fluid ambient glow trail and dynamic
 * scale transitions on hover & click.
 */
export function VisionGlassCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const state = useRef({
    // Direct mouse coordinates (zero lag)
    mouseX: -100,
    mouseY: -100,
    // Soft follower coordinates for fluid ambient aura
    glowX: -100,
    glowY: -100,
    // Interactive states
    isHovering: false,
    isMouseDown: false,
    isVisible: false,
    scale: 1,
    initialized: false,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Only run on desktop/devices with a precise mouse
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setMounted(true);

    const s = state.current;

    const updateCursorPosition = (clientX: number, clientY: number) => {
      s.mouseX = clientX;
      s.mouseY = clientY;
      s.isVisible = true;

      if (!s.initialized) {
        s.glowX = clientX;
        s.glowY = clientY;
        s.initialized = true;
      }

      // Immediately sync glass ring to prevent ANY perceivable lag
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0) translate(-50%, -50%) scale(${s.scale})`;
        cursorRef.current.style.opacity = '1';
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      // Check interactive hover
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest(
        'button, a, input, textarea, select, [role="button"], .fast-test-chip, .specimen-card, .metric-card, .tab-btn, .project-card, .action-card'
      );
      s.isHovering = !!interactive;

      updateCursorPosition(e.clientX, e.clientY);
    };

    const onMouseDown = () => {
      s.isMouseDown = true;
    };

    const onMouseUp = () => {
      s.isMouseDown = false;
    };

    const onMouseLeave = () => {
      s.isVisible = false;
      if (cursorRef.current) cursorRef.current.style.opacity = '0';
      if (glowRef.current) glowRef.current.style.opacity = '0';
    };

    const onMouseEnter = (e: MouseEvent) => {
      s.isVisible = true;
      updateCursorPosition(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    let animId: number;

    // RAF loop drives fluid ambient aura trail and scale physics
    const tick = () => {
      if (s.initialized && s.isVisible) {
        // Fluid trail for ambient glow (soft 0.35 spring)
        const gdx = s.mouseX - s.glowX;
        const gdy = s.mouseY - s.glowY;
        s.glowX += gdx * 0.35;
        s.glowY += gdy * 0.35;

        // Dynamic scale interpolation
        let targetScale = 1;
        if (s.isMouseDown) {
          targetScale = 0.78;
        } else if (s.isHovering) {
          targetScale = 1.45;
        }
        s.scale += (targetScale - s.scale) * 0.28;

        // Apply updated scale to glass ring
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate3d(${s.mouseX}px, ${s.mouseY}px, 0) translate(-50%, -50%) scale(${s.scale})`;
          if (s.isHovering) {
            cursorRef.current.classList.add('hovering');
          } else {
            cursorRef.current.classList.remove('hovering');
          }
        }

        // Apply fluid trail to ambient glow
        if (glowRef.current) {
          glowRef.current.style.transform = `translate3d(${s.glowX}px, ${s.glowY}px, 0) translate(-50%, -50%)`;
          glowRef.current.style.opacity = s.isHovering ? '0.85' : '0.45';
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
      document.removeEventListener('mouseenter', onMouseEnter);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Soft fluid liquid ambient glow trail */}
      <div
        ref={glowRef}
        className="vision-cursor-ambient-glow"
        style={{ left: 0, top: 0, opacity: 0 }}
        aria-hidden="true"
      />

      {/* Sleek 1:1 zero-lag Apple Vision Pro liquid glass ring */}
      <div
        ref={cursorRef}
        className="vision-glass-cursor"
        style={{ left: 0, top: 0, opacity: 0 }}
        aria-hidden="true"
      >
        <div className="vision-glass-specular-edge" />
        <div className="vision-glass-specular-glare" />
      </div>
    </>
  );
}
