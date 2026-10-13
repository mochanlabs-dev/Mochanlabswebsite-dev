"use client";

import { useState } from "react";
import { services } from "@/content/site";
import { Tag } from "./ui";

// Indexed list of services; each row expands to show details. (Scroll
// positions below are re-measured automatically when the height changes.)
export default function Services() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="services" className="bg-paper pb-24 sm:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-8 border-t border-ink/10 pt-24 sm:pt-36 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Tag index="02" className="text-ink/50">
              {services.tag}
            </Tag>
          </div>
          <div className="lg:col-span-8">
            <h2 data-reveal="lines" className="display text-[clamp(2.4rem,6vw,5.5rem)]">
              {services.titleLead} <span className="text-accent">{`${services.titleAccent}.`}</span>
            </h2>
            <p data-reveal="fade" className="mt-6 max-w-xl text-base text-ink/60 sm:text-lg">
              {services.intro}
            </p>
          </div>
        </div>

        <ol className="mt-16 border-t border-ink">
          {services.items.map((s, i) => {
            const isOpen = open === i;
            const id = `service-${i}`;
            return (
              <li key={s.title} data-reveal="fade" className="border-b border-ink/15">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={id}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group grid w-full grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 text-left sm:grid-cols-[6rem_1fr_auto] sm:py-8"
                >
                  <span
                    className={`font-mono text-sm transition-colors ${isOpen ? "text-accent" : "text-ink/40 group-hover:text-accent"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="display text-[clamp(1.5rem,3.6vw,3.25rem)] transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                    {s.title}
                  </span>
                  <span
                    aria-hidden
                    className={`relative grid size-10 place-items-center rounded-full border transition-colors duration-300 ${
                      isOpen ? "border-accent bg-accent text-paper" : "border-ink/15 group-hover:border-ink"
                    }`}
                  >
                    <span className="absolute h-px w-3.5 bg-current" />
                    <span
                      className={`absolute h-3.5 w-px bg-current transition-transform duration-300 ${isOpen ? "scale-y-0" : ""}`}
                    />
                  </span>
                </button>

                <div
                  id={id}
                  role="region"
                  className={`grid transition-[grid-template-rows] duration-500 ease-out-expo ${
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="grid gap-6 pb-10 sm:grid-cols-[6rem_1fr_1fr] sm:gap-8">
                      <span className="hidden sm:block" />
                      <p className="max-w-md text-base leading-relaxed text-ink/70">{s.body}</p>
                      <ul className="flex flex-col gap-2 font-mono text-[0.8rem] tracking-wide uppercase">
                        {s.points.map((p) => (
                          <li key={p} className="flex items-center gap-3">
                            <span aria-hidden className="text-accent">
                              —
                            </span>
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
