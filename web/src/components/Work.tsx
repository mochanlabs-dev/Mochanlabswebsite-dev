import { work } from "@/content/site";
import { ArrowUpRightIcon } from "./icons";
import ProductVideo from "./ProductVideo";

// Two products, one block each: the story on one side, its demo film on the
// other (sides swap for the second). Kept short on purpose; the films do the
// explaining.
export default function Work() {
  return (
    <section id="work" className="scroll-mt-[4.5rem]">
      <div className="mx-auto max-w-[1400px] px-5 pt-14 pb-10 sm:px-8 sm:pt-16">
        <div className="mb-10 lg:mb-12">
          <h1 data-reveal="lines" className="heading text-[clamp(2.2rem,4.4vw,4rem)]">
            {work.titleLead} <span className="text-accent">{work.titleAccent}</span>
          </h1>
        </div>

        <div className="divide-y divide-ink/10 border-t border-ink/10">
          {work.items.map((p, i) => (
            <article key={p.slug} className="grid gap-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-8">
              <div
                data-reveal="fade"
                className={`lg:col-span-5 lg:row-start-1 lg:self-center ${i % 2 ? "lg:col-start-8" : "lg:col-start-1"}`}
              >
                <p className="label mb-4">{p.kicker}</p>
                <h2 className="heading text-[clamp(2.4rem,4.4vw,3.8rem)]">{p.name}</h2>
                <p className="mt-5 text-base leading-relaxed text-ink/65">{p.summary}</p>

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

              <div
                data-reveal="fade"
                className={`lg:col-span-7 lg:row-start-1 lg:self-center ${i % 2 ? "lg:col-start-1" : "lg:col-start-6"}`}
              >
                <ProductVideo src={p.video} poster={p.poster} title={p.name} length={p.length} />
              </div>

              <div
                data-reveal="fade"
                className={`lg:col-span-7 lg:row-start-2 ${i % 2 ? "lg:col-start-1" : "lg:col-start-6"}`}
              >
                <dl className="grid gap-6 sm:grid-cols-3 sm:gap-8">
                  {(
                    [
                      ["The problem", p.story.problem],
                      ["What we built", p.story.built],
                      ["How it's used", p.story.use],
                    ] as const
                  ).map(([title, text]) => (
                    <div key={title}>
                      <dt className="label mb-2">{title}</dt>
                      <dd className="text-[0.92rem] leading-relaxed text-ink/65">{text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
