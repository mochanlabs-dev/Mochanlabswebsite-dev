"use client";

import type Lenis from "lenis";

// The intro loader signals "ready" when it finishes so the hero can start its
// entrance. If the loader is skipped, it signals immediately.

const READY_EVENT = "ml:ready";

declare global {
  interface Window {
    __mlReady?: boolean;
    __lenis?: Lenis;
  }
}

export function markReady() {
  window.__mlReady = true;
  window.dispatchEvent(new Event(READY_EVENT));
}

export function onReady(cb: () => void): () => void {
  if (window.__mlReady) {
    cb();
    return () => {};
  }
  window.addEventListener(READY_EVENT, cb, { once: true });
  return () => window.removeEventListener(READY_EVENT, cb);
}

export function scrollToTarget(target: string | number) {
  if (window.__lenis) {
    window.__lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: "smooth" });
  } else {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth" });
  }
}
