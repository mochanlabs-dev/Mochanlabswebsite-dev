"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { work } from "@/content/site";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ArrowUpRightIcon } from "./icons";

const wb = work.weighbridge;

// Sticky steps: the product summary and step list stay on the left while a
// framed screenshot per step scrolls past on the right. The step whose
// screenshot is mid-screen is highlighted and its description opens.
export default function WorkWeighbridge() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      root.current!.querySelectorAll<HTMLElement>("[data-shot]").forEach((shot, i) =>
        ScrollTrigger.create({
          trigger: shot,
          start: "top 60%",
          end: "bottom 60%",
          onToggle: (self) => self.isActive && setActive(i),
        }),
      );
    },
    { scope: root },
  );

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-2 lg:gap-0">
      {/* Sticky summary + steps */}
      <div className="lg:pr-16">
        <div className="lg:sticky lg:top-28">
          <p className="label mb-4">{wb.kicker}</p>
          <h3 className="heading text-[clamp(2rem,3.4vw,3rem)]">{wb.name}</h3>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/65">{wb.summary}</p>
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {wb.tags.map((t) => (
              <li key={t} className="rounded-[4px] bg-ink/[0.05] px-2 py-1 text-xs text-ink/70">
                {t}
              </li>
            ))}
          </ul>

          <ol className="mt-10 hidden border-t border-ink/10 lg:block">
            {wb.steps.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title} className="border-b border-ink/10 py-4">
                  <div className={`flex items-baseline gap-4 transition-colors duration-500 ${on ? "text-ink" : "text-ink/30"}`}>
                    <span className={`tabular-nums text-xs ${on ? "text-accent" : ""}`}>0{i + 1}</span>
                    <span className="heading text-2xl">{s.title}</span>
                  </div>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <p className="overflow-hidden pl-9 text-[0.95rem] leading-relaxed text-ink/60">
                      <span className="block pt-2">{s.body}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <a
            href={wb.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            Read the {wb.name} docs <ArrowUpRightIcon className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Screenshots */}
      <div className="flex flex-col gap-12 lg:gap-[14vh] lg:border-l lg:border-ink/10 lg:py-[8vh] lg:pl-16">
        {wb.steps.map((s, i) => (
          <figure key={s.title} data-shot>
            {/* Step text inline on small screens */}
            <div className="mb-4 lg:hidden">
              <p className="flex items-baseline gap-3">
                <span className="tabular-nums text-xs text-accent">0{i + 1}</span>
                <span className="heading text-2xl">{s.title}</span>
              </p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/60">{s.body}</p>
            </div>
            <div data-reveal="clip" className="overflow-hidden rounded-lg border border-ink/10 bg-card shadow-[0_20px_60px_-20px_rgb(0_0_0/0.18)]">
              <div className="flex items-center justify-between border-b border-ink/8 px-4 py-2.5 text-xs text-ink/45">
                <span>{wb.name}</span>
                <span className="tabular-nums">0{i + 1} / {s.title}</span>
              </div>
              <Image src={s.image} alt={s.alt} width={1600} height={1000} className="h-auto w-full" />
            </div>
          </figure>
        ))}
      </div>
    </div>
  );
}
