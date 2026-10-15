"use client";

import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

// Attribute-driven scroll animations shared across sections. Mounted after
// all sections so its triggers are created after any pinned sections.
//   data-reveal="lines"  heading lines slide up from a mask
//   data-reveal="words"  paragraph words brighten as you scroll (scrubbed)
//   data-reveal="fade"   element fades up
//   data-reveal="clip"   element opens up from an inset frame
//   data-reveal="draw"   element scales in vertically, scrubbed
export default function Reveals() {
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    const splits: SplitText[] = [];

    document.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
      splits.push(
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 105,
              duration: 1,
              ease: "power3.out",
              stagger: 0.07,
              scrollTrigger: { trigger: el, start: "top 88%", once: true },
            }),
        }),
      );
    });

    document.querySelectorAll<HTMLElement>('[data-reveal="words"]').forEach((el) => {
      splits.push(
        SplitText.create(el, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.18 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
              },
            ),
        }),
      );
    });

    gsap.utils.toArray<HTMLElement>('[data-reveal="fade"]').forEach((el) => {
      gsap.from(el, {
        autoAlpha: 0,
        y: 18,
        duration: 0.9,
        ease: "power3.out",
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    // Screenshots and panels open up from an inset frame.
    gsap.utils.toArray<HTMLElement>('[data-reveal="clip"]').forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: "inset(10% 8% 10% 8% round 14px)", scale: 0.96 },
        {
          clipPath: "inset(0% 0% 0% 0% round 8px)",
          scale: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    // Lines that draw as their parent scrolls through (e.g. Process timeline).
    gsap.utils.toArray<HTMLElement>('[data-reveal="draw"]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "bottom 55%", scrub: true } },
      );
    });

    return () => splits.forEach((s) => s.revert());
  });

  return null;
}
