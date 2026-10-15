import { process } from "@/content/site";
import { Label, Plus } from "./ui";

// Four steps in a hairline row. (Sticky steps are used for the Weighbridge
// case study, so this stays quiet.)
export default function Process() {
  return (
    <section id="process" className="scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="mb-14 grid gap-6 lg:grid-cols-3">
          <div>
            <Label className="mb-6">{process.tag}</Label>
            <h2 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
              {process.titleLead} <span className="text-accent">{process.titleAccent}</span>
            </h2>
          </div>
          <p data-reveal="fade" className="max-w-md self-end text-base text-ink/60 lg:col-span-2 lg:pl-12">
            {process.intro}
          </p>
        </div>

        {/* The marker sits outside the list so :first/:even target the steps. */}
        <div className="relative">
          <Plus className="top-0 left-0" />
          {/* Phones: a timeline line that draws down the steps as you scroll */}
          <span aria-hidden className="absolute top-0 bottom-0 left-[5px] w-px bg-ink/10 sm:hidden">
            <span data-reveal="draw" className="absolute inset-0 origin-top bg-accent" />
          </span>
          <ol className="grid border-t border-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {process.steps.map((s) => (
              <li
                key={s.title}
                data-reveal="fade"
                className="relative border-b border-ink/10 py-8 max-sm:pl-8 sm:pr-6 sm:even:border-l sm:even:pl-6 lg:border-b-0 lg:border-l lg:pl-6 lg:first:border-l-0 lg:first:pl-0"
              >
                <span aria-hidden className="absolute top-[2.6rem] left-0 size-[11px] rounded-full border-2 border-accent bg-paper sm:hidden" />
                <h3 className="heading text-[1.75rem]">{s.title}</h3>
                <p className="mt-3 max-w-xs text-[0.95rem] leading-relaxed text-ink/60">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
