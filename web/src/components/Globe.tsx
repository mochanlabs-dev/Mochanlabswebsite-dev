"use client";

import createGlobe from "cobe";
import { useEffect, useRef } from "react";
import { globeMarkers } from "@/content/site";
import { prefersReducedMotion } from "@/lib/gsap";

// Rotation that puts India (≈79°E) facing the viewer.
const INDIA_PHI = Math.PI - ((79 * Math.PI) / 180 - Math.PI / 2);

/** Dotted WebGL globe that slowly turns and can be dragged. */
export default function Globe({ className = "", theme = "dark" }: { className?: string; theme?: "dark" | "light" }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let width = canvas.offsetWidth;
    let phi = INDIA_PHI;
    let drag: number | null = null;
    let dragOffset = 0;
    let dragVelocity = 0;
    const spin = prefersReducedMotion() ? 0 : 0.0025;

    // cobe sizes the drawing buffer in device pixels: width × dpr.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const onResize = () => (width = canvas.offsetWidth);
    window.addEventListener("resize", onResize);

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: width * dpr,
      phi,
      theta: 0.28,
      mapSamples: 22000,
      markerColor: [0.17, 0.35, 1],
      // Low diffuse lights the sphere evenly so the whole globe reads, not
      // just a sunlit crescent.
      ...(theme === "light"
        ? {
            dark: 0,
            diffuse: 1.1,
            mapBrightness: 2.2,
            mapBaseBrightness: 0,
            baseColor: [0.86, 0.87, 0.9] as [number, number, number],
            glowColor: [0.93, 0.94, 0.98] as [number, number, number],
          }
        : {
            dark: 1,
            diffuse: 0.6,
            mapBrightness: 9,
            mapBaseBrightness: 0.04,
            baseColor: [0.32, 0.32, 0.36] as [number, number, number],
            glowColor: [0.2, 0.22, 0.32] as [number, number, number],
          }),
      markers: globeMarkers,
      onRender: (state) => {
        if (drag === null) {
          phi += spin + dragVelocity;
          dragVelocity *= 0.94;
        }
        state.phi = phi + dragOffset;
        state.width = width * dpr;
        state.height = width * dpr;
      },
    });

    const down = (e: PointerEvent) => {
      drag = e.clientX;
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (drag === null) return;
      const delta = (e.clientX - drag) / 220;
      dragVelocity = delta - dragOffset > 0 ? 0.004 : -0.004;
      dragOffset = delta;
    };
    const up = () => {
      if (drag === null) return;
      phi += dragOffset;
      dragOffset = 0;
      drag = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);

    requestAnimationFrame(() => (canvas.style.opacity = "1"));

    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Globe centred on India"
      role="img"
      className={`aspect-square cursor-grab touch-pan-y opacity-0 transition-opacity duration-[1500ms] ${className}`}
    />
  );
}
