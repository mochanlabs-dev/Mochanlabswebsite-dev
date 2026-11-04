import { work } from "@/content/site";
import { ArrowUpRightIcon } from "./icons";
import ProductVideo from "./ProductVideo";
import { Label } from "./ui";

// Two products, one block each: the story on one side, its demo film on the
// other (sides swap for the second). Kept short on purpose; the films do the
// explaining.
export default function Work() {
  return (
    <section id="work" className="scroll-mt-20">
      <div className="mx-auto max-w-[1400px] px-5 pt-24 pb-8 sm:px-8 sm:pt-32">
        <div className="mb-16 lg:mb-24">
          <Label className="mb-6">{work.tag}</Label>
          <h1 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
            {work.titleLead} <span className="text-accent">{work.titleAccent}</span>
          </h1>
        </div>

        <div className="divide-y divide-ink/10 border-t border-ink/10">
          {work.items.map((p, i) => (
            <article key={p.slug} className="grid items-center gap-10 py-16 sm:py-24 lg:grid-cols-12 lg:gap-16">
              <div data-reveal="fade" className={`lg:col-span-5 ${i % 2 ? "lg:order-2" : ""}`}>
                <p className="label mb-4">{p.kicker}</p>
                <h2 className="heading text-[clamp(2.4rem,4.4vw,3.8rem)]">{p.name}</h2>
                <p className="mt-5 max-w-md text-base leading-relaxed text-ink/65">{p.summary}</p>

                <ul className="mt-8 space-y-3">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-3 text-[0.95rem]">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                      {pt}
                    </li>
                  ))}
                </ul>

                <ul className="mt-8 flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <li key={t} className="rounded-[4px] bg-ink/[0.05] px-2 py-1 text-xs text-ink/70">
                      {t}
                    </li>
                  ))}
                </ul>

                {"docsUrl" in p && p.docsUrl && (
                  <a
                    href={p.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-accent"
                  >
                    Read the docs
                    <ArrowUpRightIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
              </div>

              <div data-reveal="fade" className={`lg:col-span-7 ${i % 2 ? "lg:order-1" : ""}`}>
                <ProductVideo src={p.video} poster={p.poster} title={p.name} length={p.length} />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
