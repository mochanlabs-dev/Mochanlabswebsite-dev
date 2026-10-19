"use client";

import { useState } from "react";
import { footer, services } from "@/content/site";
import { Button, Label } from "./ui";

// Services grouped into four categories (by title, so the copy in
// content/site.ts stays as written).
const groups = [
  { name: "Web & Mobile", titles: ["Web Development", "Mobile App Development", "Enterprise Web Applications", "E-commerce & Logistics"] },
  { name: "Business Software", titles: ["Custom Software", "ERP & CRM Development"] },
  { name: "AI & Automation", titles: ["AI & Automation Solutions", "API Integration & Automation"] },
  { name: "Cloud & Security", titles: ["Cloud Solutions & DevOps", "Cybersecurity", "IT Support & Consulting"] },
].map((g) => ({ ...g, items: g.titles.map((t) => services.items.find((s) => s.title === t)!) }));

// Category tabs with every service in the chosen category visible at once -
// nothing moves on its own, so visitors read at their own pace.
export default function Services() {
  const [active, setActive] = useState(0);
  const group = groups[active];

  return (
    <section id="services" className="scroll-mt-20 bg-tint">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mb-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Label className="mb-6">{services.tag}</Label>
            <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
              {services.titleLead} <span className="text-accent">{services.titleAccent}</span>
            </h2>
          </div>
          <p data-reveal="fade" className="max-w-sm self-end text-base text-ink/60">
            {services.intro}
          </p>
        </div>

        {/* Tabs (scroll sideways on small screens) */}
        <div
          role="tablist"
          aria-label="Service categories"
          className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
        >
          {groups.map((g, i) => {
            const on = i === active;
            return (
              <button
                key={g.name}
                type="button"
                role="tab"
                id={`svc-tab-${i}`}
                aria-selected={on}
                aria-controls="svc-panel"
                onClick={() => setActive(i)}
                className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${
                  on ? "border-accent bg-accent text-card" : "border-ink/12 bg-card text-ink/75 hover:border-accent/50 hover:text-ink"
                }`}
              >
                {g.name}
                <span className={`grid size-5 place-items-center rounded-full text-[0.7rem] tabular-nums ${on ? "bg-card/20" : "bg-ink/[0.06]"}`}>
                  {g.items.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Cards for the chosen category; re-keyed so they animate in on switch */}
        <ul
          key={active}
          id="svc-panel"
          role="tabpanel"
          aria-labelledby={`svc-tab-${active}`}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {group.items.map((s, i) => (
            <li
              key={s.title}
              style={{ animationDelay: `${i * 70}ms` }}
              className="svc-card group flex flex-col rounded-xl border border-ink/8 bg-card p-6 transition-[border-color,box-shadow,translate] duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-[0_20px_50px_-24px_rgb(43_89_255/0.45)]"
            >
              <span aria-hidden className="mb-6 h-1 w-10 rounded-full bg-accent transition-[width] duration-300 group-hover:w-16" />
              <h3 className="heading text-[1.4rem]">{s.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">{s.body}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-6">
                {s.points.map((p) => (
                  <li key={p} className="rounded-[4px] bg-tint px-2 py-1 text-xs text-ink/70">
                    {p}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {/* Closing call to action */}
        <div className="mt-6 flex flex-col items-start justify-between gap-5 rounded-xl bg-accent px-6 py-6 text-card sm:flex-row sm:items-center sm:px-8">
          <p className="heading max-w-2xl text-xl">{footer.blurb}</p>
          <Button href="#contact" variant="light" className="shrink-0">
            {footer.cta}
          </Button>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
