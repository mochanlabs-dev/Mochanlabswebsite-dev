"use client";

import { useRef } from "react";
import { process } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { Tag } from "./ui";

const PAPER = "#ffffff";
const INK = "#0a0a0a";

// Pinned horizontal walk through the process steps. Step titles type in as
// they slide into view, oversized ghost numbers sit behind them, and the whole
// section fades from white to black on the way out into the dark sections
// that follow. On small screens the steps stack vertically instead.
export default function Process() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      if (prefersReducedMotion()) return;

      const mm = gsap.matchMedia();

      // Colours are set directly from scroll progress rather than tweened:
      // the section is pinned, and the pin's inline-style caching corrupts
      // tweened custom properties.
      const bg = gsap.utils.interpolate(PAPER, INK);
      const fg = gsap.utils.interpolate(INK, PAPER);
      const setTheme = (self: ScrollTrigger) => {
        section.style.setProperty("--bg", bg(self.progress));
        section.style.setProperty("--fg", fg(self.progress));
      };

      mm.add("(min-width: 1024px)", () => {
        const trackEl = track.current!;
        const distance = () => trackEl.scrollWidth - window.innerWidth;

        const horizontal = gsap.to(trackEl, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        // Intro panel dims as it slides out. Its right edge rests at 60vw,
        // so dimming starts only once the track actually moves.
        gsap.to("[data-process-intro]", {
          opacity: 0.25,
          ease: "none",
          scrollTrigger: {
            trigger: "[data-process-intro]",
            containerAnimation: horizontal,
            start: "right 58%",
            end: "right 5%",
            scrub: true,
          },
        });

        const splits = gsap.utils.toArray<HTMLElement>("[data-step]").map((step) => {
          const title = step.querySelector<HTMLElement>("[data-step-title]")!;
          // Split into words too so lines can only break between words.
          const split = SplitText.create(title, { type: "words,chars", wordsClass: "word", charsClass: "char" });
          const st = { trigger: step, containerAnimation: horizontal, scrub: true };
          gsap.from(split.chars, {
            opacity: 0,
            stagger: 0.06,
            ease: "none",
            scrollTrigger: { ...st, start: "left 92%", end: "left 45%" },
          });
          gsap.from(step.querySelectorAll("[data-step-body]"), {
            opacity: 0,
            y: 24,
            ease: "none",
            scrollTrigger: { ...st, start: "left 75%", end: "left 40%" },
          });
          gsap.from(step.querySelector("[data-step-num]"), {
            xPercent: 30,
            ease: "none",
            scrollTrigger: { ...st, start: "left right", end: "right left" },
          });
          return split;
        });

        // White → black as the final step slides in. It must complete before
        // the track stops, when the last step's left edge sits near 28vw.
        const steps = gsap.utils.toArray<HTMLElement>("[data-step]");
        ScrollTrigger.create({
          trigger: steps[steps.length - 1],
          containerAnimation: horizontal,
          start: "left 95%",
          end: "left 40%",
          onUpdate: setTheme,
          onRefresh: setTheme,
        });

        return () => splits.forEach((s) => s.revert());
      });

      mm.add("(max-width: 1023px)", () => {
        ScrollTrigger.create({
          trigger: section,
          // Fade only while the last step leaves, so steps stay readable.
          start: "bottom 115%",
          end: "bottom 55%",
          onUpdate: setTheme,
          onRefresh: setTheme,
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="process"
      style={{ ["--bg" as string]: PAPER, ["--fg" as string]: INK }}
      className="relative overflow-hidden bg-[var(--bg)] text-[var(--fg)] lg:h-svh"
    >
      <div ref={track} className="flex flex-col lg:h-full lg:flex-row lg:items-center">
        {/* Intro */}
        <div
          data-process-intro
          className="flex shrink-0 flex-col justify-center px-5 pt-24 pb-12 sm:px-8 lg:w-[60vw] lg:py-0 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))]"
        >
          <Tag index="04" className="mb-8 opacity-60">
            {process.tag}
          </Tag>
          <h2 className="display text-[clamp(2.6rem,7vw,7rem)]">
            {process.titleLead} <span className="text-accent">{`${process.titleAccent}.`}</span>
          </h2>
          <p className="mt-8 max-w-md text-base opacity-60 sm:text-lg">{process.intro}</p>
          <p className="tag mt-10 opacity-70">
            {process.steps.map((s, i) => (
              <span key={s.title}>
                {i > 0 && <span className="opacity-40"> · </span>}
                {s.title}
              </span>
            ))}
          </p>
        </div>

        {/* Steps */}
        {process.steps.map((step, i) => (
          <article
            key={step.title}
            data-step
            className="relative flex shrink-0 flex-col justify-center overflow-hidden px-5 py-16 sm:px-8 lg:h-full lg:w-[62vw] lg:py-0 lg:pr-[8vw] lg:pl-[6vw]"
          >
            <span
              data-step-num
              aria-hidden
              className="display pointer-events-none absolute top-1/2 right-0 -translate-y-1/2 text-[clamp(10rem,30vw,30rem)] leading-none select-none lg:right-[6vw]"
              style={{ color: "color-mix(in srgb, var(--fg) 6%, transparent)" }}
            >
              0{i + 1}
            </span>
            <span className="tag relative mb-6 text-accent">Step 0{i + 1}</span>
            <h3 data-step-title className="step-title display relative text-[clamp(2.6rem,5.6vw,6rem)]">
              {`${step.title}.`}
            </h3>
            <p data-step-body className="relative mt-8 max-w-md text-base leading-relaxed opacity-70 sm:text-lg">
              {step.body}
            </p>
          </article>
        ))}
        <div aria-hidden className="hidden shrink-0 lg:block lg:w-[10vw]" />
      </div>
    </section>
  );
}
