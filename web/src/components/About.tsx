import { about } from "@/content/site";
import { Label } from "./ui";

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
            {about.lead}
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 sm:gap-12">
            {about.blocks.map((b) => (
              <div key={b.title} data-reveal="fade">
                <h3 className="heading text-xl">{b.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-ink/60">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
