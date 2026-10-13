import { work } from "@/content/site";
import CircuitLines from "./CircuitLines";
import OdtsBoard from "./OdtsBoard";
import WorkWeighbridge from "./WorkWeighbridge";
import { Label } from "./ui";

const odts = work.odts;

// Case studies: Weighbridge as sticky steps with real (demo-data) screenshots,
// then ODTS beside a designed fragment of its dispatch screen.
export default function Work() {
  return (
    <section id="work" className="scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mb-16 grid gap-6 lg:mb-20 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Label className="mb-6">{work.tag}</Label>
            <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
              {work.titleLead} <span className="text-accent">{work.titleAccent}</span>
            </h2>
          </div>
          <p data-reveal="fade" className="max-w-sm self-end text-base text-ink/60">
            {work.intro}
          </p>
        </div>

        <WorkWeighbridge />

        {/* ODTS */}
        <div className="mt-24 grid items-center gap-12 border-t border-ink/10 pt-24 sm:mt-32 sm:pt-32 lg:grid-cols-2 lg:gap-16">
          <div data-reveal="fade" className="relative overflow-hidden rounded-lg bg-ink px-5 py-10 sm:px-12 sm:py-14">
            <CircuitLines className="pointer-events-none absolute inset-0 h-full w-full text-card opacity-20 [&_[data-trace]]:[stroke-dashoffset:0]" />
            <div className="relative">
              <OdtsBoard />
            </div>
          </div>

          <div>
            <p className="label mb-4">{odts.kicker}</p>
            <h3 className="heading text-[clamp(2rem,3.4vw,3rem)]">
              {odts.name} <span className="text-ink/35">— {odts.fullName}</span>
            </h3>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink/65">{odts.summary}</p>

            <p className="label mt-8 mb-3">Built for every role</p>
            <ul className="flex flex-wrap gap-1.5">
              {odts.roles.map((r) => (
                <li key={r} className="rounded-[4px] border border-ink/15 px-2.5 py-1 text-sm">
                  {r}
                </li>
              ))}
            </ul>

            <ul className="mt-8 border-t border-ink/10">
              {odts.features.map((f) => (
                <li key={f} className="flex gap-3 border-b border-ink/10 py-3.5 text-[0.95rem]">
                  <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  {f}
                </li>
              ))}
            </ul>

            <ul className="mt-6 flex flex-wrap gap-1.5">
              {odts.tags.map((t) => (
                <li key={t} className="rounded-[4px] bg-ink/[0.05] px-2 py-1 text-xs text-ink/70">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
