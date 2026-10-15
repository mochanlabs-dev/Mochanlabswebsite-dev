"use client";

import { useRef, type ReactNode } from "react";
import { whyUs } from "@/content/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import CircuitLines from "./CircuitLines";
import { Label, Plus } from "./ui";

// Card colours, in the order the cards are dealt (the last one ends on top).
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

// As on Abatable: the section pins, the cards rise from below one at a time,
// tilting as they come, and settle into a fan from left to right so the last
// card reads in full. On small screens each card pins below the heading
// while the next slides over it, and the one beneath eases back.
export default function WhyUs() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-why-card]");
        const n = cards.length;
        // Hovered/tapped/focused card: straighten, lift, bring to front (CSS
        // in globals.css). The mm context below handles the dealing.
        // Cards are sized from the viewport height (see --why-h); space them
        // by ~40% of a card's width so the fan stays compact.
        const spread = () => cards[0].offsetWidth * 0.4;
        gsap.set(cards, { xPercent: -50, yPercent: -50 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: `+=${n * 55}%`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
        cards.forEach((card, i) => {
          const t = i - (n - 1) / 2; // centred index
          const rot = gsap.utils.interpolate(-9, 11, i / (n - 1)); // left tilt → right tilt
          tl.fromTo(
            card,
            { y: () => window.innerHeight, x: () => t * spread() + 60, rotate: rot + 12 },
            { y: Math.abs(t) * 8, x: () => t * spread(), rotate: rot, ease: "power2.out", duration: 1 },
            i * 0.7,
          );
        });
        tl.to({}, { duration: 0.5 });
      });
      mm.add("(max-width: 1023px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-why-card]");
        cards.slice(0, -1).forEach((card, i) => {
          gsap.to(card, {
            // Scale and darken rather than fade: a faded card would show the
            // one beneath it through.
            scale: 0.92,
            filter: "brightness(0.9)",
            ease: "none",
            scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 30%", scrub: true },
          });
        });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="why-us"
      // overflow-x-clip (not hidden) so the cards can stick on small screens.
      className="relative overflow-x-clip bg-tint lg:h-svh lg:overflow-hidden"
      // Card height follows the screen height so the fan always fits.
      style={{ ["--why-h" as string]: "clamp(17rem, 48svh, 27rem)" }}
    >
      {/* Faint line work and blueprint markers behind the cards */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-ink opacity-[0.07] lg:block">
        <CircuitLines className="h-full w-full [&_[data-trace]]:[stroke-dashoffset:0]" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
        {["16%", "50%", "84%"].map((top) =>
          ["4%", "50%", "96%"].map((left) => <Plus key={top + left} style={{ top, left }} />),
        )}
      </div>

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 py-24 sm:px-8 lg:py-0 lg:pt-24 lg:pb-6">
        <div className="mx-auto max-w-3xl text-center">
          <Label className="mb-5">{whyUs.tag}</Label>
          <h2 className="heading text-[clamp(2.2rem,min(4.4vw,7svh),4rem)]">
            {whyUs.titleLead} <span className="text-accent">{whyUs.titleAccent}</span> {whyUs.titleTrail}
          </h2>
        </div>

        <ul className="relative mt-12 flex flex-col gap-6 lg:mt-0 lg:block lg:flex-1">
          {whyUs.items.map((item, i) => (
            // The <li> is placed and dealt by the scroll animation; the inner
            // card handles hover/tap: it straightens, lifts and comes to the
            // front so its text can be read in full.
            <li
              key={item.title}
              data-why-card
              tabIndex={0}
              style={{ ["--i" as string]: i, ["--rot" as string]: `${gsap.utils.interpolate(-9, 11, i / (whyUs.items.length - 1))}deg` }}
              className="why-card group/card origin-top outline-none max-lg:sticky max-lg:top-[calc(84px+var(--i)*12px)] sm:mx-auto sm:w-full sm:max-w-lg lg:absolute lg:top-1/2 lg:left-1/2 lg:h-[var(--why-h)] lg:w-[calc(var(--why-h)*0.72)] lg:cursor-pointer"
            >
              <div
                className={`why-inner flex h-full min-h-[19rem] flex-col justify-between rounded-xl p-7 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] lg:min-h-0 lg:p-[calc(var(--why-h)*0.07)] ${tones[i % tones.length]}`}
              >
              <span className="grid size-14 place-items-center rounded-2xl border border-current/40 lg:size-[calc(var(--why-h)*0.15)]">
                <svg viewBox="0 0 24 24" className="size-6 lg:size-[45%]" aria-hidden>
                  {icons[i]}
                </svg>
              </span>
              <div>
                <h3 className="heading text-[1.6rem] lg:text-[calc(var(--why-h)*0.068)]">{item.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-relaxed opacity-80 lg:text-[calc(var(--why-h)*0.037)]">{item.body}</p>
              </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
