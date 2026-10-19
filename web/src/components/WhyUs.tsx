"use client";

import { useRef, type ReactNode } from "react";
import { whyUs } from "@/content/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
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

// Desktop: a calm grid of cards that fade up as they scroll into view. Phones and tablets: each card pins while the next slides over it.
export default function WhyUs() {
  const root = useRef<HTMLElement>(null);

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

        {/* Desktop: a calm grid */}
        <ul className="mt-4 hidden grid-cols-3 gap-4 lg:grid">
          {whyUs.items.map((it, i) => (
            <li
              key={it.title}
              data-reveal="fade"
              className="group rounded-xl border border-ink/8 bg-card p-8 transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_50px_-24px_rgb(43_89_255/0.45)]"
            >
              <span className="grid size-12 place-items-center rounded-xl bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-card">
                <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
                  {icons[i]}
                </svg>
              </span>
              <h3 className="heading mt-8 text-[1.5rem]">{it.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
