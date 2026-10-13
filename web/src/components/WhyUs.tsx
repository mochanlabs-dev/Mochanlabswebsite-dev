import { whyUs } from "@/content/site";
import { Tag } from "./ui";

export default function WhyUs() {
  return (
    <section id="why-us" className="bg-paper pb-24 sm:pb-36">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
        <div className="grid gap-8 pt-24 sm:pt-36 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Tag index="03" className="text-ink/50">
              {whyUs.tag}
            </Tag>
          </div>
          <div className="lg:col-span-8">
            <h2 data-reveal="lines" className="display text-[clamp(2.4rem,6vw,5.5rem)]">
              {whyUs.titleLead} <span className="text-accent">{whyUs.titleAccent}</span> {`${whyUs.titleTrail}.`}
            </h2>
          </div>
        </div>

        <ul className="mt-16 grid grid-cols-1 border-t border-l border-ink/10 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.items.map((item, i) => (
            <li
              key={item.title}
              data-reveal="fade"
              data-delay={(i % 3) * 0.08}
              className="group relative flex min-h-[19rem] flex-col justify-between overflow-hidden border-r border-b border-ink/10 p-8 sm:p-10"
            >
              {/* Hover: ink panel rises from the bottom */}
              <span
                aria-hidden
                className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-700 ease-out-expo group-hover:scale-y-100"
              />
              <span className="relative font-mono text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div className="relative transition-colors duration-500 group-hover:text-paper">
                <h3 className="display mb-4 text-3xl">{item.title}</h3>
                <p className="text-[0.95rem] leading-relaxed text-ink/60 transition-colors duration-500 group-hover:text-paper/65">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
