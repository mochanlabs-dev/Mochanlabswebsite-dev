"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const label =
  "Mochan Labs builds websites, mobile apps, ERP and CRM systems. We fix what slows your team down, run AI bots that answer customers around the clock, connect your tools so work moves on its own, and build AI employees. Let's build yours.";

// The ~36 s brand film (rendered from /video/brand.html in the repo): a 16:9
// cut on larger screens and a 9:10 cut on phones. Only the visible one loads
// (preload="none", and a hidden video never intersects). Muted loop that
// plays while on screen; with reduced motion it also shows controls.
export default function BrandFilm({ className = "" }: { className?: string }) {
  const wide = useRef<HTMLVideoElement>(null);
  const tall = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videos = [wide.current!, tall.current!];
    // A muted looping film still plays when the system asks for less motion
    // (it is the main content of the page), but it gets controls so it can be
    // paused.
    if (prefersReducedMotion()) videos.forEach((v) => (v.controls = true));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach(({ target, isIntersecting }) => {
          const video = target as HTMLVideoElement;
          if (isIntersecting) {
            video.preload = "auto";
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }),
      { threshold: 0.25 },
    );
    videos.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  const common = { muted: true, loop: true, playsInline: true, preload: "none" as const, "aria-label": label };

  return (
    <div className={`overflow-hidden rounded-lg border border-ink/10 bg-paper ${className}`}>
      <video
        ref={wide}
        {...common}
        className="hidden aspect-video h-auto w-full md:block"
        src="/video/brand.mp4"
        poster="/video/brand-poster.jpg"
        width={1920}
        height={1080}
      />
      <video
        ref={tall}
        {...common}
        className="block aspect-[9/10] h-auto w-full md:hidden"
        src="/video/brand-portrait.mp4"
        poster="/video/brand-portrait-poster.jpg"
        width={1080}
        height={1200}
      />
    </div>
  );
}
