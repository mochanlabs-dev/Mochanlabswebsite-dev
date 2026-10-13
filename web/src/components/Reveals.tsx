"use client";

import { gsap, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";

// Attribute-driven scroll animations shared across sections. Mounted after
// all sections so its triggers are created after the pinned sections.
//   data-reveal="lines"  heading lines slide up from a mask
//   data-reveal="words"  paragraph words brighten as you scroll (scrubbed)
//   data-reveal="fade"   element fades up
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
              yPercent: 110,
              duration: 1.2,
              ease: "expo.out",
              stagger: 0.08,
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
              { opacity: 0.12 },
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
        y: 32,
        duration: 1.1,
        ease: "expo.out",
        delay: Number(el.dataset.delay ?? 0),
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    });

    return () => splits.forEach((s) => s.revert());
  });

  return null;
}
