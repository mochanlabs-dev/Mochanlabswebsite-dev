import { about } from "@/content/site";
import { Button, Label } from "./ui";

// Headline on the left, intro and the two statements on the right (the thin
// vertical line ends with them). The closing line, the four points and the
// button sit underneath as a centred wrap-up, like the taglines in the other
// sections.
export default function About() {
  return (
    <section id="about" className="scroll-mt-[4.5rem]">
      <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-8 sm:py-24">
        <Label className="mb-8">{about.tag}</Label>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,7fr)] lg:gap-0">
          <div className="lg:pr-6">
            <h2 data-reveal="lines" className="heading text-[clamp(1.9rem,3.4vw,3rem)]">
              {about.titleLead} <span className="text-accent">{about.titleAccent}</span> {about.titleTrail}
            </h2>
          </div>

          <div className="lg:border-l lg:border-ink/10 lg:pl-12">
            <p data-reveal="fade" className="text-[clamp(1.05rem,1.7vw,1.6rem)] leading-snug">
              {about.lead}
            </p>

            <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-12">
              {about.blocks.map((b) => (
                <div key={b.title} data-reveal="fade">
                  <h3 className="heading text-[clamp(1.1rem,1.45vw,1.4rem)]">{b.title}</h3>
                  <p className="mt-3 text-[clamp(0.95rem,1.15vw,1.1rem)] leading-relaxed text-ink/60">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wrap-up, centred at the bottom */}
        <div data-reveal="fade" className="mt-14 border-t border-ink/10 pt-10 text-center lg:mt-16">
          <p className="heading mx-auto text-[clamp(1.2rem,1.9vw,1.7rem)] [text-wrap:balance]!">{about.closing}</p>

          <ul className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {about.features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-[0.95rem]">
                <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                {f}
              </li>
            ))}
          </ul>

          <div className="mt-8">
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
