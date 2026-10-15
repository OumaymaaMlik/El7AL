import React, { useEffect, useRef } from 'react';

const CELL = 22; // grid step in px
const SIZE = 14; // drawn square in px (the rest is the gap that makes it look like pixels)
const FPS = 14;

/** Greens of the brand, drawn as faint squares; the lime ones are rarer. */
const LIGHT = ['13,92,58', '13,92,58', '22,163,74', '163,230,53'];
const DARK = ['163,230,53', '34,197,94', '34,197,94', '13,92,58'];

/**
 * A quiet pixel field behind the page: a grid of small squares that slowly light up and fade in soft
 * waves, strongest at the top and fading out toward the bottom. Very low contrast, no interaction, paused
 * when the tab is hidden, and a still picture for visitors who prefer reduced motion.
 */
export const PixelBackground: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let cols = 0;
    let rows = 0;
    let phase: Float32Array;
    let tone: Uint8Array;
    let raf = 0;
    let last = 0;

    const build = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      cols = Math.ceil(w / CELL) + 1;
      rows = Math.ceil(h / CELL) + 1;
      phase = new Float32Array(cols * rows);
      tone = new Uint8Array(cols * rows);
      for (let i = 0; i < phase.length; i++) {
        phase[i] = Math.random() * Math.PI * 2;
        tone[i] = Math.floor(Math.random() * 4);
      }
    };

    const draw = (t: number) => {
      const dark = document.documentElement.classList.contains('dark');
      const palette = dark ? DARK : LIGHT;
      // Dark mode needs fewer, dimmer pixels to stay calm.
      const max = dark ? 0.22 : 0.2;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let y = 0; y < rows; y++) {
        const fade = 1 - y / rows; // brighter at the top
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          // Two slow diagonal waves plus each cell's own flicker.
          const wave = Math.sin(t * 0.0004 + (x + y) * 0.22) * 0.5 + 0.5;
          const own = Math.sin(t * 0.0009 + phase[i]) * 0.5 + 0.5;
          const v = wave * own;
          if (v < 0.28) continue;
          const alpha = (v - 0.28) * 1.4 * max * (0.25 + 0.75 * fade);
          ctx.fillStyle = `rgba(${palette[tone[i]]},${alpha.toFixed(3)})`;
          ctx.fillRect(x * CELL, y * CELL, SIZE, SIZE);
        }
      }
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden || now - last < 1000 / FPS) return;
      last = now;
      draw(now);
    };

    build();
    draw(60000);
    if (!reduce) raf = requestAnimationFrame(frame);

    const onResize = () => {
      build();
      draw(performance.now());
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
};
