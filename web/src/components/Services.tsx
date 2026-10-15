import { footer, services } from "@/content/site";
import { Button, Label } from "./ui";

const card = "flex w-[min(82vw,22rem)] shrink-0 flex-col rounded-lg";

function Cards({ hidden = false }: { hidden?: boolean }) {
  return (
    <>
      {services.items.map((s) => (
        <li key={s.title} aria-hidden={hidden || undefined} className={`${card} border border-ink/10 bg-card p-7`}>
          <h3 className="heading text-[1.5rem]">{s.title}</h3>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/60">{s.body}</p>
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-8">
            {s.points.map((p) => (
              <li key={p} className="rounded-[4px] bg-ink/[0.05] px-2 py-1 text-xs text-ink/70">
                {p}
              </li>
            ))}
          </ul>
        </li>
      ))}
      {/* Closing card: a call to action */}
      <li aria-hidden={hidden || undefined} className={`${card} justify-between gap-10 bg-accent p-7 text-card`}>
        <p className="heading text-[1.5rem]">{footer.blurb}</p>
        <Button href="#contact" variant="light" className="self-start" tabIndex={hidden ? -1 : undefined}>
          {footer.cta}
        </Button>
      </li>
    </>
  );
}

// Services as an endless, slowly drifting row of cards (left to right).
// Hovering pauses it so a card can be read; with reduced motion it becomes
// a still row that scrolls sideways.
export default function Services() {
  return (
    <section id="services" className="scroll-mt-20 bg-tint">
      <div className="mx-auto max-w-[1400px] px-5 pt-24 sm:px-8 sm:pt-32">
        <div className="mb-12 max-w-2xl">
          <Label className="mb-6">{services.tag}</Label>
          <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
            {services.titleLead} <span className="text-accent">{services.titleAccent}</span>
          </h2>
          <p data-reveal="fade" className="mt-5 max-w-md text-base text-ink/60">
            {services.intro}
          </p>
        </div>
      </div>

      <div data-reveal="fade" className="services-marquee pb-24 sm:pb-32">
        {/* Two copies side by side; the track shifts by one copy's width. */}
        <ul aria-label="Services" className="services-track flex w-max gap-4 pr-4">
          <Cards />
          <Cards hidden />
        </ul>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
