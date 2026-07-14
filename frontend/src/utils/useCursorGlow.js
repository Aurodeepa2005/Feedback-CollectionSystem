/**
 * useCursorGlow.js
 * ────────────────
 * Tracks the mouse position and moves a decorative glow element.
 * Returns a ref to attach to the glow div.
 */
import { useEffect, useRef } from "react";

const useCursorGlow = () => {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    let rafId;
    const onMove = (e) => {
      rafId = requestAnimationFrame(() => {
        el.style.left = `${e.clientX}px`;
        el.style.top  = `${e.clientY}px`;
      });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return glowRef;
};

export default useCursorGlow;
