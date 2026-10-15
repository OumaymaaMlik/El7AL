/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { RadarArt } from './RadarArt';
import { buildFlowScene, FLOW_SECONDS, flowStep, poseFlowScene } from './stage3d/flowScene';
import { buildLogoScene, poseLogoScene } from './stage3d/logoScene';
import { buildStairsScene, poseStairsScene, StairsState } from './stage3d/stairsScene';

interface Stage3DProps {
  /** `flow`: the request told as a scene. `stairs`: the sign-up as a staircase (driven by `stairs`). */
  variant: 'flow' | 'stairs' | 'logo';
  /** The four captions shown one after the other (none for the logo). */
  captions?: string[];
  /** Accessible description of the scene. */
  label: string;
  stairs?: StairsState;
  className?: string;
  /** Told whenever the active caption changes (so a list beside the scene can follow it). */
  onStep?: (step: number) => void;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * A small 3D scene with faceless green mannequins. three.js is loaded on demand (it is large), the radar
 * shows meanwhile and stays if WebGL is unavailable. The scene is decorative: captions carry the meaning.
 */
export const Stage3D: React.FC<Stage3DProps> = ({ variant, captions = [], label, stairs, className = '', onStep }) => {
  const holder = useRef<HTMLDivElement>(null);
  const stairsRef = useRef<StairsState>(stairs ?? { level: 0, done: false, pro: false });
  stairsRef.current = stairs ?? stairsRef.current;
  const [ready, setReady] = useState(false);
  const [idx, setIdx] = useState(0);
  const reduce = useRef(prefersReducedMotion());
  useEffect(() => {
    onStep?.(idx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx]);

  useEffect(() => {
    let raf = 0;
    let disposed = false;
    let renderer: any;
    let observer: ResizeObserver | undefined;
    const box = holder.current;
    if (!box) return;

    (async () => {
      let T: any;
      try {
        T = await import('three');
      } catch {
        return;
      }
      if (disposed) return;
      try {
        renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      box.appendChild(renderer.domElement);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      setReady(true);

      const flow = variant === 'flow' ? buildFlowScene(T) : null;
      const stair = variant === 'stairs' ? buildStairsScene(T) : null;
      const logo = variant === 'logo' ? buildLogoScene(T) : null;
      const o: any = flow ?? stair ?? logo;
      const cam = o.cam;

      const size = () => {
        const w = box.clientWidth || 300;
        const h = box.clientHeight || 300;
        renderer.setSize(w, h, false);
        cam.aspect = w / h;
        if (variant === 'flow') cam.position.z = w / h < 0.9 ? 8.6 : 7.4;
        else if (variant === 'logo') cam.position.z = w / h < 0.9 ? 9 : 7.2;
        else cam.position.z = w / h < 0.9 ? 10.4 : 9.2;
        cam.updateProjectionMatrix();
      };
      size();
      if (window.ResizeObserver) {
        observer = new ResizeObserver(size);
        observer.observe(box);
      }

      let mx = 0;
      let my = 0;
      const onMove = (e: PointerEvent) => {
        const b = box.getBoundingClientRect();
        mx = (e.clientX - b.left) / b.width - 0.5;
        my = (e.clientY - b.top) / b.height - 0.5;
      };
      box.addEventListener('pointermove', onMove);

      const start = performance.now();
      let prev = start;
      let cx = 0;
      let cy = 0;
      let lastIdx = -1;
      const frame = (now: number) => {
        if (disposed) return;
        const dt = Math.min(0.1, (now - prev) / 1000);
        prev = now;
        let step = 0;
        if (variant === 'flow') {
          const t = reduce.current ? 10.8 : ((now - start) / 1000) % FLOW_SECONDS;
          poseFlowScene(o, t);
          step = flowStep(t);
          cx += (mx * 1.1 - cx) * 0.05;
          cy += (my * 0.5 - cy) * 0.05;
          cam.position.x = cx;
          cam.position.y = 1.6 - cy;
          cam.lookAt(0, 1.15, 0);
        } else if (variant === 'logo') {
          poseLogoScene(o, (now - start) / 1000, reduce.current);
          cx += (mx * 0.8 - cx) * 0.05;
          cy += (my * 0.4 - cy) * 0.05;
          cam.position.x = cx;
          cam.position.y = 0.5 - cy;
          cam.lookAt(0, 0.2, 0);
        } else {
          const t = reduce.current ? 99 : (now - start) / 1000;
          const st = stairsRef.current;
          poseStairsScene(o, t, dt, st);
          step = st.done ? 3 : Math.min(3, st.level);
          cx += (mx * 1.2 + (reduce.current ? 0 : Math.sin(t * 0.25) * 0.5) - cx) * 0.05;
          cy += (my * 0.5 - cy) * 0.05;
          cam.position.x = cx;
          cam.position.y = 2.8 - cy;
          cam.lookAt(0, 2.3, 0);
        }
        renderer.render(o.scene, cam);
        if (step !== lastIdx) {
          lastIdx = step;
          setIdx(step);
        }
        // Reduced motion: one still frame is enough, but stairs must follow the form, so keep drawing it.
        if (!reduce.current || variant === 'stairs') raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
      (box as any)._cleanup = () => box.removeEventListener('pointermove', onMove);
    })();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer?.disconnect();
      (box as any)._cleanup?.();
      if (renderer) {
        renderer.dispose?.();
        renderer.forceContextLoss?.();
        renderer.domElement?.remove();
      }
    };
  }, [variant]);

  const step = Math.max(0, Math.min(idx, captions.length - 1));
  return (
    <div
      role="img"
      aria-label={label}
      className={`relative overflow-hidden rounded-[14px] bg-[radial-gradient(120%_90%_at_50%_100%,#0f7447_0%,#0d5c3a_55%,#0a4a2f_100%)] ${className}`}
    >
      {!ready && (
        <div className="absolute inset-0 grid place-items-center opacity-90">
          <RadarArt className="max-w-[240px]" />
        </div>
      )}
      <div ref={holder} className="absolute inset-0" aria-hidden="true" />
      {captions.length > 0 && (
        <>
          <ol
            className="absolute inset-x-[18px] bottom-11 h-11 pointer-events-none list-none m-0 p-0"
            aria-live="polite"
          >
            {captions.map((c, i) => (
              <li
                key={c}
                aria-hidden={i !== step}
                className={`absolute start-0 bottom-0 inline-flex items-center rounded-full bg-brand-accent text-brand-on-accent font-bold text-[15px] px-[18px] py-[11px] whitespace-nowrap transition-all duration-300 ${
                  i === step ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                {c}
              </li>
            ))}
          </ol>
          <div className="absolute inset-x-[18px] bottom-5 flex gap-1.5" aria-hidden="true">
            {captions.map((c, i) => (
              <i
                key={c}
                className={`flex-1 h-[5px] rounded-full transition-colors ${i <= step ? 'bg-brand-accent' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
