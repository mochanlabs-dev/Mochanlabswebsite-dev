"use client";

import { useRef } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { markReady } from "@/lib/ready";

const SEEN_KEY = "ml-intro";

// Intro: the logo's hexagon traces itself while a counter runs 000 → 100,
// then the panel lifts away. Shown once per browser session.
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      const skip =
        document.documentElement.classList.contains("intro-seen") || prefersReducedMotion();

      if (skip) {
        el.style.display = "none";
        markReady();
        return;
      }

      if ("scrollRestoration" in history) history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      window.__lenis?.stop();

      const num = el.querySelector<HTMLElement>("[data-count]")!;
      const counter = { v: 0 };

      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          el.style.display = "none";
          try {
            sessionStorage.setItem(SEEN_KEY, "1");
          } catch {}
        },
      });

      tl.to(el.querySelectorAll("[data-trace]"), { strokeDashoffset: 0, duration: 1.6, stagger: 0.15 }, 0)
        .to(
          counter,
          {
            v: 100,
            duration: 1.8,
            onUpdate: () => {
              num.textContent = String(Math.round(counter.v)).padStart(3, "0");
            },
          },
          0,
        )
        .to(el.querySelector("[data-fill]"), { scaleX: 1, duration: 1.8 }, 0)
        .to(el.querySelector("[data-inner]"), { opacity: 0, y: -24, duration: 0.5, ease: "power2.in" }, "+=0.15")
        .add(() => {
          window.__lenis?.start();
          markReady();
        })
        .to(el, { yPercent: -100, duration: 1, ease: "expo.inOut" }, "-=0.1");
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      data-loader
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center border-b-2 border-accent bg-ink text-paper"
    >
      <div data-inner className="flex flex-col items-center gap-8">
        <svg viewBox="0 0 100 112" className="h-24 w-24" fill="none" strokeLinejoin="round">
          <path
            data-trace
            d="M50 4 94 30v52L50 108 6 82V30Z"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={1.5}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <path
            data-trace
            d="M50 16 84 36v40L50 96 16 76V36Z"
            pathLength={1}
            stroke="var(--color-accent)"
            strokeWidth={1.5}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
          <path
            data-trace
            d="M32 72V42l18 20 18-20v30"
            pathLength={1}
            stroke="currentColor"
            strokeWidth={3}
            strokeDasharray="1"
            strokeDashoffset="1"
          />
        </svg>
        <div className="flex w-56 flex-col gap-3 font-mono text-xs tracking-[0.2em] uppercase">
          <div className="flex justify-between text-paper/60">
            <span>Mochan Labs</span>
            <span data-count className="text-paper tabular-nums">
              000
            </span>
          </div>
          <div className="h-px w-full bg-paper/15">
            <div data-fill className="h-px origin-left scale-x-0 bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}
