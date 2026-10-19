"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { whyUs } from "@/content/site";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import CircuitLines from "./CircuitLines";
import { Label } from "./ui";

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

// Desktop: the section pins and the cards are dealt from a deck at the bottom
// edge, face down, flipping as they travel and settling into a fan with a small
// overshoot. Hovering (or tabbing to) a card brings it forward, tilts it
// towards the cursor, and slides its neighbours apart (see globals.css). Phones: each card pins while the next slides over it.
export default function WhyUs() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-why-card]");
        const flips = cards.map((c) => c.querySelector<HTMLElement>("[data-flip]")!);
        const hint = root.current!.querySelector<HTMLElement>("[data-why-hint]")!;
        const n = cards.length;
        // Cards are sized from the viewport height (--why-h); space them by
        // ~40% of a card's width so the fan stays compact.
        const spread = () => cards[0].offsetWidth * 0.4;
        const tilt = (i: number) => gsap.utils.interpolate(-9, 11, i / (n - 1)); // left → right
        const spot = (i: number) => ({ x: (i - (n - 1) / 2) * spread(), y: Math.abs(i - (n - 1) / 2) * 8, rotate: tilt(i) });

        gsap.set(cards, { xPercent: -50, yPercent: -50 });
        gsap.set(flips, { transformPerspective: 1400 });

        if (reduced) {
          // No animation: lay the fan out as it should finally look.
          cards.forEach((card, i) => gsap.set(card, spot(i)));
          gsap.set(flips, { rotateY: 0 });
          return;
        }

        gsap.set(flips, { rotateY: 180 });
        gsap.set(hint, { autoAlpha: 0, y: 6 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: `+=${n * 55}%`, pin: true, scrub: 0.8, invalidateOnRefresh: true },
        });
        cards.forEach((card, i) => {
          const at = i * 0.7;
          const to = spot(i);
          tl.fromTo(
            card,
            { x: () => i * 3, y: () => window.innerHeight, rotate: (i - (n - 1) / 2) * 1.5 },
            { x: () => to.x, y: to.y, rotate: to.rotate, ease: "back.out(1.15)", duration: 1.05 },
            at,
          );
          // Face-down on the way up, face-up as it reaches the fan.
          tl.fromTo(flips[i], { rotateY: 180 }, { rotateY: 0, ease: "power2.inOut", duration: 0.7 }, at + 0.15);
        });
        tl.to(hint, { autoAlpha: 1, y: 0, duration: 0.4 }, (n - 1) * 0.7 + 0.9);
        tl.to({}, { duration: 0.5 });
      });

      mm.add("(max-width: 1023px)", () => {
        if (reduced) return;
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

  // Picks the active card from the cursor's position against the fan's fixed
  // slots (the <li>s never move; only their insides do). Choosing by what is
  // visually under the cursor would not work: the neighbours slide aside when
  // a card is active, so the cursor would land on a card further along.
  useEffect(() => {
    const ul = list.current!;
    const wide = window.matchMedia("(min-width: 1024px)");
    let active: HTMLElement | null = null;

    const activate = (el: HTMLElement | null) => {
      if (el === active) return;
      active?.removeAttribute("data-active");
      active?.style.setProperty("--px", "0");
      active?.style.setProperty("--py", "0");
      active = el;
      active?.setAttribute("data-active", "");
    };

    // The slot nearest the cursor horizontally, if the cursor is over the fan.
    const pick = (x: number, y: number) => {
      const slots = [...ul.querySelectorAll<HTMLElement>("[data-why-card]")].map((card) => ({ card, r: card.getBoundingClientRect() }));
      const left = Math.min(...slots.map((s) => s.r.left));
      const right = Math.max(...slots.map((s) => s.r.right));
      const top = Math.min(...slots.map((s) => s.r.top)) - 40; // room for the lift
      const bottom = Math.max(...slots.map((s) => s.r.bottom));
      if (x < left || x > right || y < top || y > bottom) return null;
      return slots.reduce((best, s) => (Math.abs(x - (s.r.left + s.r.width / 2)) < Math.abs(x - (best.r.left + best.r.width / 2)) ? s : best));
    };

    const point = (e: PointerEvent) => {
      if (!wide.matches) return;
      const hit = pick(e.clientX, e.clientY);
      activate(hit?.card ?? null);
      if (!hit) return;
      // Tilt towards the cursor.
      const px = Math.max(-0.5, Math.min(0.5, (e.clientX - hit.r.left) / hit.r.width - 0.5));
      const py = Math.max(-0.5, Math.min(0.5, (e.clientY - hit.r.top) / hit.r.height - 0.5));
      hit.card.style.setProperty("--px", px.toFixed(3));
      hit.card.style.setProperty("--py", py.toFixed(3));
    };
    const away = (e: PointerEvent) => {
      // Touch: a tap outside the fan puts the card back.
      if (!ul.contains(e.target as Node)) activate(null);
    };

    ul.addEventListener("pointermove", point);
    ul.addEventListener("pointerdown", point);
    ul.addEventListener("pointerleave", () => activate(null));
    window.addEventListener("pointerdown", away);
    return () => {
      ul.removeEventListener("pointermove", point);
      ul.removeEventListener("pointerdown", point);
      window.removeEventListener("pointerdown", away);
    };
  }, []);

  return (
    <section
      ref={root}
      id="why-us"
      // overflow-x-clip (not hidden) so the cards can stick on small screens.
      className="relative overflow-x-clip bg-tint lg:h-svh lg:overflow-hidden"
      // Card height follows the screen height so the fan always fits.
      style={{ ["--why-h" as string]: "clamp(17rem, 48svh, 27rem)" }}
    >
      {/* Faint line work behind the cards */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden text-ink opacity-[0.07] lg:block">
        <CircuitLines className="h-full w-full [&_[data-trace]]:[stroke-dashoffset:0]" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1400px] flex-col px-5 py-24 sm:px-8 lg:py-0 lg:pt-24 lg:pb-6">
        <div className="mx-auto max-w-3xl text-center">
          <Label className="mb-5">{whyUs.tag}</Label>
          <h2 className="heading text-[clamp(2.2rem,min(4.4vw,7svh),4rem)]">
            {whyUs.titleLead} <span className="text-accent">{whyUs.titleAccent}</span> {whyUs.titleTrail}
          </h2>
          <p data-why-hint className="label mt-3 hidden lg:block">
            Hover a card to read it
          </p>
        </div>

        <ul ref={list} className="relative mt-12 flex flex-col gap-6 lg:mt-0 lg:block lg:flex-1">
          {whyUs.items.map((item, i) => (
            // The <li> is dealt by the scroll animation. Inside it, .why-inner
            // handles hover (lift, tilt, neighbours part) and [data-flip] turns
            // the card over; the faces are the back (logo) and the front (text).
            <li
              key={item.title}
              data-why-card
              tabIndex={0}
              style={{ ["--i" as string]: i, ["--rot" as string]: `${gsap.utils.interpolate(-9, 11, i / (whyUs.items.length - 1))}deg` }}
              className="why-card origin-top outline-none max-lg:sticky max-lg:top-[calc(84px+var(--i)*12px)] sm:mx-auto sm:w-full sm:max-w-lg lg:absolute lg:top-1/2 lg:left-1/2 lg:h-[var(--why-h)] lg:w-[calc(var(--why-h)*0.72)] lg:cursor-pointer"
            >
              <div className="why-inner h-full">
                <div data-flip className="why-flip relative h-full">
                  {/* Back: shown while the card is dealt face down (desktop only) */}
                  <div className="why-face why-back absolute inset-0 hidden place-items-center rounded-xl border border-ink/10 bg-card shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] lg:grid">
                    <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-[26%] w-auto opacity-90" />
                  </div>

                  {/* Front */}
                  <div
                    className={`why-face relative flex h-full min-h-[19rem] flex-col justify-between overflow-hidden rounded-xl p-7 shadow-[0_24px_60px_-24px_rgb(0_0_0/0.35)] lg:min-h-0 lg:p-[calc(var(--why-h)*0.07)] ${tones[i % tones.length]}`}
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
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
