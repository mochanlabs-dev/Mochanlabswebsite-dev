import { about } from "@/content/site";
import { Button, Label } from "./ui";

export default function About() {
  return (
    <section id="about" className="scroll-mt-20">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-3 lg:gap-0">
        <div className="lg:pr-12">
          <Label className="mb-6">{about.tag}</Label>
          <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
            {about.titleLead} <span className="text-accent">{about.titleAccent}</span>
          </h2>
        </div>

        <div className="lg:col-span-2 lg:border-l lg:border-ink/10 lg:pl-12">
          <p data-reveal="fade" className="max-w-3xl text-[clamp(1.15rem,1.7vw,1.45rem)] leading-snug">
            {about.paragraphs[0]}
          </p>
          <p data-reveal="fade" className="mt-6 max-w-2xl text-base leading-relaxed text-ink/60">
            {about.paragraphs[1]}
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-12">
            {about.blocks.map((b) => (
              <div key={b.title} data-reveal="fade">
                <h3 className="heading text-xl">{b.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink/60">{b.body}</p>
              </div>
            ))}
          </div>

          <p data-reveal="fade" className="heading mt-12 max-w-2xl text-[clamp(1.3rem,2vw,1.7rem)]">
            {about.closing}
          </p>

          <ul className="mt-10 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {about.features.map((f) => (
              <li key={f} data-reveal="fade" className="flex items-center gap-3">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>

          <div data-reveal="fade" className="mt-10">
            <Button href="#contact" variant="ink">
              {about.cta}
            </Button>
          </div>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
