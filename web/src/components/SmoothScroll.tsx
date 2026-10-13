"use client";

import Lenis from "lenis";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";

// Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
// Uses useGSAP (a layout effect) so it is set up before the loader and the
// section animations, which also run in layout effects.
export default function SmoothScroll() {
  // Re-measure every ScrollTrigger whenever the page height changes (fonts
  // loading, text splitting, expanding rows), so pinned sections stay aligned.
  useGSAP(() => {
    let lastHeight = document.body.scrollHeight;
    let timer: ReturnType<typeof setTimeout>;
    const ro = new ResizeObserver(() => {
      const h = document.body.scrollHeight;
      if (h === lastHeight) return;
      lastHeight = h;
      clearTimeout(timer);
      timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => {
      ro.disconnect();
      clearTimeout(timer);
    };
  });

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.1, anchors: true });
    window.__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      window.__lenis = undefined;
    };
  });

  return null;
}
