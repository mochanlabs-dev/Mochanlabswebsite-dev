"use client";

import { useRef, useState, type ReactNode } from "react";
import { whyUs } from "@/content/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import CircuitLines from "./CircuitLines";
import { Label } from "./ui";

// Card colours for the phone stack.
const tones = [
  "bg-accent text-card",
  "bg-accent-soft text-ink",
  "bg-card text-ink border border-ink/10",
  "bg-accent-deep text-card",
  "bg-accent-soft text-ink",
  "bg-accent text-card",
];

const stroke = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;

// One outline icon per item, in whyUs.items order.
const icons: ReactNode[] = [
  // Expert team
  <g key="team" {...stroke}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <circle cx="16.5" cy="9" r="2.5" />
    <path d="M15.5 14.2A4.5 4.5 0 0 1 21 18.5" />
  </g>,
  // Cost effective (rupee)
  <g key="rupee" {...stroke}>
    <path d="M7 5h10M7 9h10M7 5c5 0 6 2.5 6 4s-1.5 4-6 4l7 6" />
  </g>,
  // Fast delivery (bolt)
  <g key="bolt" {...stroke}>
    <path d="M13 3 5 14h6l-1 7 8-11h-6l1-7Z" />
  </g>,
  // Ongoing support (loop)
  <g key="loop" {...stroke}>
    <path d="M8 8.5c-2.5-2.5-6-1-6 3.5s3.5 6 6 3.5L16 8.5c2.5-2.5 6-1 6 3.5s-3.5 6-6 3.5L8 8.5Z" />
  </g>,
  // Scalable solutions (expand)
  <g key="expand" {...stroke}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </g>,
  // Trusted partner (shield)
  <g key="shield" {...stroke}>
    <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6L12 3Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </g>,
];

const chip = "rounded-md bg-card px-2.5 py-1 text-xs font-medium text-ink/70 shadow-sm";
const tick = (
  <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden>
    <path d="M2 7.5l3.2 3L12 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A small illustrative picture for each reason, in whyUs.items order.
const visuals: ReactNode[] = [
  // Expert team
  <div key="team" className="space-y-5">
    <div className="flex -space-x-3">
      {["A", "R", "S", "K", "M"].map((l, i) => (
        <span key={l} className={`grid size-12 place-items-center rounded-full border-2 border-accent-soft text-sm font-semibold ${i % 2 ? "bg-card text-accent" : "bg-accent text-card"}`}>
          {l}
        </span>
      ))}
    </div>
    <div className="flex flex-wrap gap-2">
      {["Web", "Mobile", "Cloud", "AI", "Security", "ERP & CRM"].map((t) => (
        <span key={t} className={chip}>
          {t}
        </span>
      ))}
    </div>
  </div>,
  // Cost effective
  <div key="cost" className="space-y-3">
    {[
      ["Agency retainers", "92%", "bg-ink/15"],
      ["In-house team", "78%", "bg-ink/15"],
      ["Mochan Labs", "46%", "bg-accent"],
    ].map(([n, w, c]) => (
      <div key={n}>
        <p className="mb-1.5 text-xs font-medium text-ink/60">{n}</p>
        <div className="h-3 rounded-full bg-card">
          <div className={`h-full rounded-full ${c}`} style={{ width: w }} />
        </div>
      </div>
    ))}
    <p className="pt-1 text-xs text-ink/50">Illustrative: cost for the same scope of work</p>
  </div>,
  // Fast delivery
  <div key="fast" className="space-y-4">
    <div className="relative flex justify-between">
      <span aria-hidden className="absolute top-3 right-3 left-3 h-0.5 bg-accent/25" />
      <span aria-hidden className="absolute top-3 left-3 h-0.5 w-[62%] bg-accent" />
      {["Plan", "Build", "Review", "Launch"].map((t, i) => (
        <div key={t} className="relative flex flex-col items-center gap-2">
          <span className={`grid size-6 place-items-center rounded-full ${i < 3 ? "bg-accent text-card" : "border-2 border-accent bg-card"}`}>{i < 3 && tick}</span>
          <span className="text-xs font-medium text-ink/70">{t}</span>
        </div>
      ))}
    </div>
    <p className="rounded-lg bg-card px-3 py-2 text-sm text-ink/70">Regular updates at every step, so nothing is a surprise.</p>
  </div>,
  // Ongoing support
  <div key="support" className="space-y-3">
    <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <span className="size-2 rounded-full bg-accent" /> All systems running
      </span>
      <span className="text-ink/50">24/7</span>
    </div>
    {["Update shipped", "Backup completed", "Support ticket closed"].map((t) => (
      <div key={t} className="flex items-center gap-3 px-1 text-sm text-ink/70">
        <span className="grid size-5 place-items-center rounded-full bg-accent text-card">{tick}</span>
        {t}
      </div>
    ))}
  </div>,
  // Scalable solutions
  <div key="scale" className="flex h-36 items-end gap-3">
    {[18, 28, 40, 56, 78, 100].map((h, i) => (
      <div key={h} className={`flex-1 rounded-t-md ${i === 5 ? "bg-accent" : "bg-accent/30"}`} style={{ height: `${h}%` }} />
    ))}
  </div>,
  // Trusted partner
  <div key="trust" className="space-y-3">
    {["NDA signed before we start", "Clear scope and timeline", "You own the code", "Open, regular updates"].map((t) => (
      <div key={t} className="flex items-center gap-3 rounded-lg bg-card px-4 py-3 text-sm">
        <span className="grid size-5 place-items-center rounded-full bg-accent text-card">{tick}</span>
        {t}
      </div>
    ))}
  </div>,
];

// Desktop: a list of reasons on the left; the chosen one opens on the right
// with a small picture. Nothing moves by itself: it changes on a click, hover
// or key press. Phones and tablets: each card pins while the next slides over it.
export default function WhyUs() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const item = whyUs.items[active];

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(max-width: 1023px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-why-card]");
        cards.slice(0, -1).forEach((card, i) => {
          // Scale and darken rather than fade: a faded card would show the one
          // beneath it through. The filter starts from an explicit value:
          // tweening from "none" overshoots and turns the card black.
          gsap.fromTo(
            card,
            { scale: 1, filter: "brightness(1)" },
            {
              scale: 0.92,
              filter: "brightness(0.92)",
              ease: "none",
              scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 30%", scrub: true },
            },
          );
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="why-us" className="scroll-mt-20 overflow-x-clip bg-tint">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mb-12 grid gap-6 lg:mb-16 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Label className="mb-6">{whyUs.tag}</Label>
            <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
              {whyUs.titleLead} <span className="text-accent">{whyUs.titleAccent}</span> {whyUs.titleTrail}
            </h2>
          </div>
          <p data-reveal="fade" className="max-w-sm self-end text-base text-ink/60">
            {whyUs.intro}
          </p>
        </div>

        {/* Phones and tablets: stacking cards */}
        <ul className="flex flex-col gap-6 lg:hidden">
          {whyUs.items.map((it, i) => (
            <li
              key={it.title}
              data-why-card
              style={{ ["--i" as string]: i }}
              className="sticky top-[calc(84px+var(--i)*12px)] origin-top sm:mx-auto sm:w-full sm:max-w-lg"
            >
              <div className={`flex min-h-[19rem] flex-col justify-between overflow-hidden rounded-xl p-7 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] ${tones[i % tones.length]}`}>
                <span className="grid size-14 place-items-center rounded-2xl border border-current/40">
                  <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                    {icons[i]}
                  </svg>
                </span>
                <div>
                  <h3 className="heading text-[1.6rem]">{it.title}</h3>
                  <p className="mt-3 text-[0.95rem] leading-relaxed opacity-80">{it.body}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Desktop: list + panel */}
        <div data-reveal="fade" className="hidden gap-4 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-6">
          <ul role="tablist" aria-label="Why choose Mochan Labs" className="flex flex-col gap-2 lg:min-h-[31rem]">
            {whyUs.items.map((it, i) => {
              const on = i === active;
              return (
                <li key={it.title}>
                  <button
                    type="button"
                    role="tab"
                    id={`why-tab-${i}`}
                    aria-selected={on}
                    aria-controls="why-panel"
                    onClick={() => setActive(i)}
                    onMouseEnter={() => window.matchMedia("(hover: hover)").matches && setActive(i)}
                    className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-colors duration-300 sm:p-5 ${
                      on ? "border-accent/40 bg-card" : "border-transparent hover:bg-card/60"
                    }`}
                  >
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-300 ${on ? "bg-accent text-card" : "bg-accent-soft text-accent"}`}>
                      <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                        {icons[i]}
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="heading block text-[1.2rem]">{it.title}</span>
                      <span className={`grid transition-[grid-template-rows,opacity] duration-300 ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                        <span className="overflow-hidden">
                          <span className="mt-2 block text-[0.95rem] leading-relaxed text-ink/60">{it.body}</span>
                        </span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div
            key={active}
            id="why-panel"
            role="tabpanel"
            aria-labelledby={`why-tab-${active}`}
            className="svc-card relative min-h-[22rem] overflow-hidden rounded-2xl bg-accent-soft p-7 sm:p-10 lg:min-h-0"
          >
            <CircuitLines className="pointer-events-none absolute inset-0 h-full w-full text-accent opacity-25 [&_[data-trace]]:[stroke-dashoffset:0]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <p className="heading text-[clamp(1.6rem,2.4vw,2.2rem)]">{item.title}</p>
              <div className="max-w-md">{visuals[active]}</div>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
