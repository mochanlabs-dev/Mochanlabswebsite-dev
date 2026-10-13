"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

type P = { x: number; y: number; ox: number; oy: number; vx: number; vy: number; r: number; a: number };

/**
 * Dust field covering its parent. A dense cloud gathers behind the element
 * marked `data-particles-anchor`; a sparse layer spreads over the rest. The
 * cursor parts the dust anywhere in the parent. While a form field inside the
 * parent has focus, the dust calms and dims so it doesn't compete with typing.
 * Only animates while visible.
 */
export default function Particles({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;
    let visible = false;
    let calm = 0; // 0 = lively, 1 = calmed (form focused); eased per frame
    let calmTarget = 0;
    const mouse = { x: -1e4, y: -1e4 };

    const seed = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cloud centre: right of the anchor (the headline block).
      const anchor = parent.querySelector<HTMLElement>("[data-particles-anchor]");
      const pr = parent.getBoundingClientRect();
      const ar = anchor?.getBoundingClientRect();
      const cx = w * 0.64;
      const cy = ar ? ar.top - pr.top + ar.height * 0.5 : h * 0.25;
      const ch = ar ? ar.height * 0.42 : h * 0.2;

      const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;
      const make = (x: number, y: number, a: number): P => ({
        x, y, ox: x, oy: y, vx: 0, vy: 0, r: Math.random() * 1.1 + 0.3, a,
      });

      const cloud = Math.round(Math.min(1100, w * 0.9));
      const ambient = Math.round(Math.min(900, (w * h) / 2600));
      particles = [
        ...Array.from({ length: cloud }, () => make(cx + g() * w * 0.3, cy + g() * ch, Math.random() * 0.7 + 0.15)),
        ...Array.from({ length: ambient }, () => make(Math.random() * w, Math.random() * h, Math.random() * 0.22 + 0.05)),
      ];
    };

    const frame = (t: number) => {
      calm += (calmTarget - calm) * 0.06;
      const force = 1.6 * (1 - calm * 0.75);
      const dim = 1 - calm * 0.55;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#ffffff";
      for (const p of particles) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const f = ((16000 - d2) / 16000) * force;
          const d = Math.sqrt(d2 + 1);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        // Slow drift + spring back home.
        const drift = Math.sin(t / 2400 + p.oy * 0.02) * 0.12 * (1 - calm);
        p.vx += (p.ox - p.x) * 0.012 + drift;
        p.vy += (p.oy - p.y) * 0.012;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;
        ctx.globalAlpha = p.a * dim;
        ctx.fillRect(p.x, p.y, p.r, p.r);
      }
      ctx.globalAlpha = 1;
      raf = visible && !reduced ? requestAnimationFrame(frame) : 0;
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
    };
    const isField = (el: EventTarget | null) => el instanceof HTMLElement && el.matches("input, textarea, select");
    const onFocusIn = (e: FocusEvent) => {
      if (isField(e.target)) calmTarget = 1;
    };
    const onFocusOut = (e: FocusEvent) => {
      if (!isField(e.relatedTarget) || !parent.contains(e.relatedTarget as Node)) calmTarget = 0;
    };

    // Re-seed when the parent's size changes (layout shifts, resizes).
    const ro = new ResizeObserver(() => {
      seed();
      if (!raf) frame(0);
    });
    ro.observe(parent);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    parent.addEventListener("focusin", onFocusIn);
    parent.addEventListener("focusout", onFocusOut);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      parent.removeEventListener("focusin", onFocusIn);
      parent.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
