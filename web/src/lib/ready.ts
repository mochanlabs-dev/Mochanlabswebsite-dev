"use client";

import type Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Smooth-scrolls to a selector or offset, via Lenis when it is active. */
export function scrollToTarget(target: string | number) {
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: -72, duration: 1.2 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}
