"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#12bd8a", "#ffb020", "#7b6cff", "#1f9fd1", "#f1456a", "#2bd6a3"];

/**
 * A celebratory burst fired from the center of its positioned parent. Re-fires
 * whenever `fire` changes (bump a counter). Honors reduced-motion by no-op.
 * Particles are WAAPI-animated, so positions/transforms are inline by nature.
 */
export function Confetti({ fire }: { fire: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!fire || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timers: number[] = [];
    const count = 46;
    for (let i = 0; i < count; i++) {
      const bit = document.createElement("i");
      const size = 6 + Math.random() * 7;
      const round = Math.random() > 0.5;
      Object.assign(bit.style, {
        position: "absolute",
        left: "50%",
        top: "38%",
        width: `${size}px`,
        height: `${round ? size : size * 0.5}px`,
        background: COLORS[i % COLORS.length],
        borderRadius: round ? "999px" : "2px",
        pointerEvents: "none",
        zIndex: "8",
      });
      host.appendChild(bit);

      const angle = Math.random() * Math.PI - Math.PI / 2 + (Math.random() - 0.5);
      const dist = 80 + Math.random() * 200;
      const dx = Math.cos(angle) * dist * (Math.random() > 0.5 ? 1 : -1);
      const dy = Math.sin(angle) * dist - 120 - Math.random() * 80;
      const rot = (Math.random() - 0.5) * 720;
      bit.animate(
        [
          { transform: "translate(-50%,-50%) rotate(0deg)", opacity: 1 },
          {
            transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + 260}px)) rotate(${rot}deg)`,
            opacity: 0,
          },
        ],
        { duration: 900 + Math.random() * 700, easing: "cubic-bezier(.2,.7,.4,1)", fill: "forwards" },
      );
      timers.push(window.setTimeout(() => bit.remove(), 1700));
    }

    return () => {
      timers.forEach(clearTimeout);
      host.replaceChildren();
    };
  }, [fire]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[8] overflow-visible"
    />
  );
}
