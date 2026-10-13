"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const SPACING = 26;
const RADIUS = 170; // cursor influence radius (px)
const ACCENT = [43, 89, 255];

/**
 * Background dot grid that responds to the cursor: dots within reach grow,
 * brighten and ease away from the pointer; the nearest take on the accent.
 * Pointer events are read from the parent so content above stays clickable.
 */
export default function DotField({
  className = "",
  tone = "light",
}: {
  className?: string;
  /** Dot colour: "light" dots for dark backgrounds, "dark" dots for light ones. */
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const parent = canvas.parentElement!;
    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const base = tone === "dark" ? [10, 10, 10] : [255, 255, 255];
    const baseAlpha = tone === "dark" ? 0.1 : 0.08;

    let w = 0;
    let h = 0;
    let xs: Float32Array, ys: Float32Array, glow: Float32Array;
    let raf = 0;
    let visible = true;
    const mouse = { x: -1e4, y: -1e4 };

    const layout = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const ox = (w - (cols - 1) * SPACING) / 2;
      const oy = (h - (rows - 1) * SPACING) / 2;
      xs = new Float32Array(cols * rows);
      ys = new Float32Array(cols * rows);
      glow = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          xs[r * cols + c] = ox + c * SPACING;
          ys[r * cols + c] = oy + r * SPACING;
        }
      draw();
    };

    // Returns true while any dot is still easing.
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      let moving = false;
      for (let i = 0; i < xs.length; i++) {
        const dx = xs[i] - mouse.x;
        const dy = ys[i] - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = dist < RADIUS ? Math.pow(1 - dist / RADIUS, 2) : 0;
        glow[i] += (target - glow[i]) * 0.14;
        if (Math.abs(target - glow[i]) > 0.002) moving = true;

        const g = glow[i];
        const push = g * 7;
        const x = xs[i] + (dist > 0 ? (dx / dist) * push : 0);
        const y = ys[i] + (dist > 0 ? (dy / dist) * push : 0);
        const size = 1 + g * 1.6;
        // Blend base colour → accent for the dots closest to the cursor.
        const t = Math.max(0, g - 0.45) / 0.55;
        const r = Math.round(base[0] + (ACCENT[0] - base[0]) * t);
        const gg = Math.round(base[1] + (ACCENT[1] - base[1]) * t);
        const b = Math.round(base[2] + (ACCENT[2] - base[2]) * t);
        ctx.fillStyle = `rgba(${r},${gg},${b},${baseAlpha + g * 0.75})`;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      }
      return moving;
    };

    const loop = () => {
      const moving = draw();
      raf = moving && visible ? requestAnimationFrame(loop) : 0;
    };
    const kick = () => {
      if (!raf && !reduced) raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      kick();
    };
    const onLeave = () => {
      mouse.x = mouse.y = -1e4;
      kick();
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas);

    parent.addEventListener("pointermove", onMove);
    parent.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", layout);
    layout();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", layout);
    };
  }, [tone]);

  return <canvas ref={ref} aria-hidden className={`pointer-events-none ${className}`} />;
}
