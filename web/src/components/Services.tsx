"use client";

import { useState } from "react";
import { services } from "@/content/site";
import { Label } from "./ui";

// Services grouped into four categories (by title, so the copy in
// content/site.ts stays as written).
const groups = [
  { name: "Web & mobile", titles: ["Web development", "Mobile app development", "E-commerce & logistics"] },
  { name: "Business software", titles: ["Custom software, ERP & CRM", "Process optimisation"] },
  { name: "AI & automation", titles: ["AI bots", "AI employees", "Integration & automation"] },
  { name: "Cloud & security", titles: ["Cloud & DevOps", "Cybersecurity", "IT support & consulting"] },
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
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
