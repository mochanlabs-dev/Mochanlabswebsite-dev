"use client";

import { useRef } from "react";
import { hero, whyUs } from "@/content/site";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { attachInk } from "@/lib/ink";
import { onReady } from "@/lib/ready";
import DotField from "./DotField";
import Globe from "./Globe";
import LiveClock from "./LiveClock";
import { RollButton, Tag } from "./ui";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const inkCanvas = useRef<HTMLCanvasElement>(null);
  const inkFallback = useRef<HTMLDivElement>(null);
  const whiteCanvas = useRef<HTMLCanvasElement>(null);
  const whiteFallback = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      const reduced = prefersReducedMotion();

      // --- Entrance (after the intro loader) ---------------------------------
      const title = section.querySelector<HTMLElement>("[data-hero-title]")!;
      const split = SplitText.create(title, { type: "lines", mask: "lines", linesClass: "split-line" });
      // Resolve elements now: the entrance runs later, outside this context,
      // where scoped selector strings no longer resolve.
      const fades = gsap.utils.toArray<HTMLElement>("[data-hero-fade]");
      const globe = section.querySelector<HTMLElement>("[data-hero-globe]")!;
      gsap.set(split.lines, { yPercent: 110 });
      gsap.set(fades, { autoAlpha: 0, y: 16 });
      gsap.set(globe, { autoAlpha: 0, scale: 0.85 });

      const counters = gsap.utils.toArray<HTMLElement>("[data-count-to]");
      const off = onReady(() => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.to(globe, { autoAlpha: 1, scale: 1, duration: 2.2 }, 0)
          .to(split.lines, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.15)
          .to(fades, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08 }, 0.55);
        counters.forEach((el) => {
          const obj = { v: 0 };
          tl.to(
            obj,
            {
              v: Number(el.dataset.countTo),
              duration: 1.8,
              ease: "power3.out",
              onUpdate: () => {
                el.textContent = String(Math.round(obj.v));
              },
            },
            0.8,
          );
        });
      });

      // --- Pinned sequence ---------------------------------------------------
      //  0.03–0.22  black ink floods up over the white hero
      //  0.21–0.27  the statement appears on the black
      //  0.27–0.47  its words light up one by one
      //  0.55–0.80  white ink floods back
      //  0.69–1.00  About slides up over the hero (it is pulled up by one
      //             screen height and has no background, see About.tsx): its
      //             dark text is hidden on the black and revealed by the flood
      const blackInk = attachInk(inkCanvas.current!, inkFallback.current!, [0.04, 0.04, 0.04], !reduced);
      const whiteInk = attachInk(whiteCanvas.current!, whiteFallback.current!, [1, 1, 1], !reduced);
      const statement = section.querySelector<HTMLElement>("[data-statement]")!;
      const statementSplit = SplitText.create(statement.querySelector("p")!, { type: "words" });
      const words = gsap.fromTo(
        statementSplit.words,
        { opacity: 0.14 },
        { opacity: 1, stagger: 0.1, ease: "none", paused: true },
      );
      const range = gsap.utils.mapRange;
      const update = (p: number) => {
        blackInk.set(range(0.03, 0.22, 0, 1, p));
        gsap.set(statement, { autoAlpha: gsap.utils.clamp(0, 1, range(0.21, 0.27, 0, 1, p)) });
        words.progress(gsap.utils.clamp(0, 1, range(0.27, 0.47, 0, 1, p)));
        whiteInk.set(range(0.55, 0.8, 0, 1, p));
      };
      update(0);

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: true,
            onUpdate: (self) => update(self.progress),
            onLeave: () => update(1),
            onLeaveBack: () => update(0),
          },
        })
        // Hero content drifts up while the black ink rises, then holds.
        .to("[data-hero-content]", { yPercent: -18, ease: "none", duration: 0.22 }, 0)
        .to("[data-hero-globe-wrap]", { yPercent: -10, scale: 0.92, ease: "none", duration: 0.22 }, 0)
        .to({}, { duration: 0.78 });

      ScrollTrigger.refresh();

      return () => {
        off();
        split.revert();
        statementSplit.revert();
        blackInk.destroy();
        whiteInk.destroy();
      };
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="home"
      className="relative isolate h-svh min-h-[640px] overflow-hidden bg-paper text-ink"
    >
      <DotField className="absolute inset-0 h-full w-full" tone="dark" />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-[1400px] grid-rows-[1fr_auto] items-center gap-4 px-5 pt-20 pb-8 sm:px-8 lg:grid-cols-12 lg:grid-rows-1 lg:gap-8 lg:pt-16 lg:pb-10">
        {/* Globe */}
        <div data-hero-globe-wrap className="flex justify-center lg:order-2 lg:col-span-6 lg:justify-end">
          <div data-hero-globe className="relative w-[min(70vw,36vh)] lg:w-[min(46vw,74vh)]">
            <Globe className="w-full" theme="light" />
            <p
              data-hero-fade
              className="tag absolute top-[8%] right-[-4%] flex items-center gap-2 rounded-full border border-ink/10 bg-paper/80 px-3 py-1.5 text-[0.6rem] whitespace-nowrap text-ink/70 backdrop-blur lg:top-[12%] lg:right-[2%]"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              Online · India · <LiveClock /> IST
            </p>
          </div>
        </div>

        {/* Copy */}
        <div
          data-hero-content
          className="flex flex-col items-center self-end text-center lg:order-1 lg:col-span-6 lg:items-start lg:self-center lg:text-left"
        >
          <div data-hero-fade>
            <Tag className="mb-5 text-ink/55">{hero.badge}</Tag>
          </div>
          <h1 data-hero-title className="display text-[clamp(2.3rem,min(5.4vw,9vh),5.75rem)]">
            {hero.titleLead}
            <br />
            <span className="text-accent">{`${hero.titleAccent}.`}</span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-[48ch] text-[0.95rem] leading-relaxed text-ink/60 sm:text-base">
            {hero.body}
          </p>
          <div data-hero-fade className="mt-7">
            <RollButton href="#contact">{hero.cta}</RollButton>
          </div>

          {/* Stat strip */}
          <ul
            data-hero-fade
            className="mt-10 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-ink/10 pt-5 font-mono text-[0.68rem] tracking-[0.16em] text-ink/55 uppercase lg:justify-start"
          >
            {hero.stats.map((s, i) => (
              <li key={s.label} className="flex items-center gap-5">
                {i > 0 && <span aria-hidden className="hidden text-ink/25 sm:inline">·</span>}
                <span>
                  <span className="text-ink">
                    <span data-count-to={s.value}>{s.value}</span>
                    {s.suffix}
                  </span>{" "}
                  {s.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Black ink (WebGL, with a plain wipe as fallback) */}
      <canvas ref={inkCanvas} aria-hidden className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
      <div
        ref={inkFallback}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 origin-bottom scale-y-0 bg-ink"
      />

      {/* Statement, shown on the black between the two wipes. Its line is the
          "Why Choose Us" intro, given the stage here. */}
      <div data-statement className="invisible absolute inset-0 z-30 flex items-center text-paper opacity-0">
        <div className="mx-auto w-full max-w-[1400px] px-5 sm:px-8">
          <p className="display max-w-6xl text-[clamp(2.1rem,5.6vw,5.5rem)]">{whyUs.intro}</p>
        </div>
      </div>

      {/* White ink floods back over everything */}
      <canvas ref={whiteCanvas} aria-hidden className="pointer-events-none absolute inset-0 z-40 h-full w-full" />
      <div
        ref={whiteFallback}
        aria-hidden
        className="pointer-events-none absolute inset-0 z-40 origin-bottom scale-y-0 bg-paper"
      />
    </section>
  );
}
