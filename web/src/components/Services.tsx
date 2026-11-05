"use client";

import { useState } from "react";
import { services } from "@/content/site";
import { Label } from "./ui";

// Services grouped into four categories (by title, so the copy in
// content/site.ts stays as written).
const groups = [
  { name: "Web & Mobile", titles: ["Web Development", "Mobile App Development", "Enterprise Web Applications", "E-commerce & Logistics"] },
  { name: "Business Software", titles: ["Custom Software", "ERP & CRM Development", "Process Optimisation"] },
  { name: "AI & Automation", titles: ["AI & Automation Solutions", "AI Bots", "AI Employees", "API Integration & Automation"] },
  { name: "Cloud & Security", titles: ["Cloud Solutions & DevOps", "Cybersecurity", "IT Support & Consulting"] },
].map((g) => ({ ...g, items: g.titles.map((t) => services.items.find((s) => s.title === t)!) }));

// Category tabs with every service in the chosen category visible at once -
// nothing moves on its own, so visitors read at their own pace.
export default function Services() {
  const [active, setActive] = useState(0);
  const group = groups[active];

  return (
    <section id="services" className="scroll-mt-[4.5rem] bg-tint">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 pb-16 sm:px-8 sm:pt-16 sm:pb-20">
        <div className="mb-8">
          <Label className="mb-4">{services.tag}</Label>
          <h2 data-reveal="lines" className="heading text-[clamp(2.1rem,3.6vw,3.2rem)]">
            {services.titleLead} <span className="text-accent">{services.titleAccent}</span>
          </h2>
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

        {/* Closing tagline, centred at the bottom */}
        <div data-reveal="fade" className="mx-auto mt-10 max-w-2xl text-center">
          <p className="text-base text-ink/60">{services.intro}</p>
          <p className="heading mt-3 text-[clamp(1.4rem,2.4vw,2rem)] text-accent">{services.tagline}</p>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
