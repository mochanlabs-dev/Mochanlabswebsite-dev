import { tech } from "@/content/site";

function Row({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  // Two copies side by side; the track moves -50% for a seamless loop.
  const doubled = [...items, ...items];
  return (
    <div className="flex overflow-hidden">
      <ul
        className={`marquee flex shrink-0 items-center ${reverse ? "marquee-reverse" : ""}`}
        style={{ ["--marquee-duration" as string]: "55s" }}
      >
        {doubled.map((item, i) => (
          <li
            key={i}
            aria-hidden={i >= items.length}
            className="display flex items-center gap-8 pr-8 text-[clamp(1.5rem,3.4vw,3rem)] whitespace-nowrap"
          >
            {item}
            <span aria-hidden className="text-accent">
              /
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TechMarquee() {
  const half = Math.ceil(tech.items.length / 2);
  return (
    <section aria-labelledby="tech-title" className="border-y border-ink/10 bg-paper py-14 sm:py-20">
      <div className="mx-auto mb-10 flex max-w-[1400px] flex-col justify-between gap-4 px-5 sm:flex-row sm:items-end sm:px-8">
        <div>
          <p className="tag mb-3 text-ink/50">[ {tech.tag} ]</p>
          <h2 id="tech-title" className="display text-2xl sm:text-3xl">
            {tech.titleLead} <span className="text-accent">{tech.titleAccent}</span>
          </h2>
        </div>
        <p className="max-w-sm text-sm text-ink/60">{tech.intro}</p>
      </div>
      <div className="flex flex-col gap-3">
        <Row items={tech.items.slice(0, half)} />
        <Row items={tech.items.slice(half)} reverse />
      </div>
    </section>
  );
}
