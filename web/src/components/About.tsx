import { about } from "@/content/site";
import { RollButton, Tag } from "./ui";

export default function About() {
  return (
    // Pulled up by one hero height (h-svh, min 640px) so it rises during the
    // end of the hero's pinned sequence. No background on purpose: its text
    // is revealed by the hero's white ink flood rather than after it.
    <section id="about" className="relative z-10 -mt-[max(100svh,640px)] pt-12 pb-24 sm:pt-16 sm:pb-36">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Tag index="01" className="text-ink/50 lg:sticky lg:top-28">
            {about.tag}
          </Tag>
        </div>

        <div className="lg:col-span-8">
          <h2 data-reveal="lines" className="display text-[clamp(2.4rem,6vw,5.5rem)]">
            {about.titleLead} <span className="text-accent">{`${about.titleAccent}.`}</span>
          </h2>

          <p data-reveal="words" className="mt-12 text-[clamp(1.25rem,2.2vw,1.9rem)] leading-snug tracking-tight">
            {about.paragraphs[0]}
          </p>
          <p data-reveal="fade" className="mt-8 max-w-2xl text-base leading-relaxed text-ink/60 sm:text-lg">
            {about.paragraphs[1]}
          </p>

          <ul className="mt-14 grid grid-cols-1 border-t border-ink/10 sm:grid-cols-2">
            {about.features.map((f, i) => (
              <li
                key={f}
                data-reveal="fade"
                data-delay={i * 0.06}
                className="flex items-center justify-between border-b border-ink/10 py-5 sm:odd:pr-8 sm:even:pl-8"
              >
                <span className="text-lg tracking-tight">{f}</span>
                <span className="font-mono text-xs text-accent">0{i + 1}</span>
              </li>
            ))}
          </ul>

          <div data-reveal="fade" className="mt-12">
            <RollButton href="#contact" variant="dark">
              {about.cta}
            </RollButton>
          </div>
        </div>
      </div>
    </section>
  );
}
