"use client";

import { useRef } from "react";
import { contact, hero } from "@/content/site";
import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import BrandFilm from "./BrandFilm";
import CircuitLines from "./CircuitLines";
import { WhatsAppIcon } from "./icons";
import { Button, Plus } from "./ui";

// Hero: headline, intro and actions on the left; the brand film framed on
// the right. The circuit lines draw themselves in as faint background texture.
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current!;
      if (prefersReducedMotion()) {
        gsap.set("[data-trace]", { strokeDashoffset: 0 });
        return;
      }

      const title = SplitText.create("[data-hero-title]", { type: "lines", mask: "lines", linesClass: "split-line" });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-trace]", { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut", stagger: 0.06 }, 0)
        .from("[data-node]", { opacity: 0, duration: 0.6, stagger: 0.04 }, 1.2)
        .from(title.lines, { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.15)
        .from("[data-hero-fade]", { opacity: 0, y: 14, duration: 0.8, stagger: 0.08 }, 0.5)
        .from("[data-hero-film]", { opacity: 0, y: 30, scale: 0.98, duration: 1.1 }, 0.35)
        .set("[data-signal]", { opacity: 1 }, 2.2);

      // Signal pulses travel along their traces, looping.
      gsap.fromTo("[data-signal]", { strokeDashoffset: 0 }, { strokeDashoffset: -1, duration: 9, ease: "none", repeat: -1 });

      // Gentle parallax on the line work as the hero scrolls away.
      gsap.to("[data-hero-art]", {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
      });

      return () => title.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="home" className="relative overflow-hidden pt-[72px]">
      {/* Soft blue glow so the hero isn't flat white (strongest on phones) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_85%_30%,rgb(43_89_255/0.16),transparent_70%),radial-gradient(50%_35%_at_0%_90%,rgb(43_89_255/0.08),transparent_70%)] lg:bg-[radial-gradient(40%_50%_at_80%_45%,rgb(43_89_255/0.10),transparent_70%)]"
      />
      {/* Background line work: faint on desktop, off on small screens where it
          would run through the text. Faded out behind the copy column. */}
      <div
        data-hero-art
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden text-ink opacity-45 [mask-image:linear-gradient(90deg,transparent_5%,#000_45%)] lg:block"
      >
        <CircuitLines className="h-full w-full" />
      </div>

      <div className="relative mx-auto grid max-w-[1400px] items-center gap-10 px-5 pt-10 pb-14 sm:px-8 lg:min-h-[calc(100svh-72px)] lg:grid-cols-12 lg:gap-12 lg:py-10">
        {/* Copy */}
        <div className="lg:col-span-5">
          <h1 data-hero-title className="heading text-[clamp(2.6rem,min(5vw,9svh),5.2rem)]">
            {hero.titleLead} <span className="text-accent">{hero.titleAccent}</span>
          </h1>
          <p data-hero-fade className="mt-6 max-w-md text-lg leading-relaxed text-ink/70">
            {hero.body}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap gap-2">
            <Button href="#contact">{hero.cta}</Button>
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[4px] border border-ink/15 bg-card/60 px-4 py-2.5 text-sm font-medium transition-colors hover:border-ink"
            >
              <WhatsAppIcon className="size-3.5" />
              WhatsApp
            </a>
          </div>
        </div>

        {/* Brand film */}
        <div data-hero-film className="relative lg:col-span-7">
          <Plus className="top-0 left-0 hidden lg:block" />
          <Plus className="top-full left-full hidden lg:block" />
          <BrandFilm className="shadow-[0_40px_100px_-40px_rgb(0_0_0/0.35)]" />
        </div>
      </div>

      <div aria-hidden className="relative h-px bg-ink/10" />
    </section>
  );
}
