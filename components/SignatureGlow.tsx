"use client";
import React from "react";

export default function SignatureGlow() {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mql.matches) return;

    const handler = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;
      el.style.setProperty('--glow-x', `${x}px`);
      el.style.setProperty('--glow-y', `${y}px`);
    };
    window.addEventListener('pointermove', handler);
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[-1]"
      style={{
        background: `radial-gradient(600px 400px at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--primary)/0.18), transparent 60%)`,
        transition: 'background-position 150ms var(--transition-smooth)',
      }}
    />
  );
}
