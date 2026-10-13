import { manifesto } from "@/content/site";

// Tilted, endlessly scrolling statement band between Process and Contact.
export default function Manifesto() {
  const line = manifesto.toUpperCase();
  const items = Array.from({ length: 4 }, () => line);
  return (
    <section aria-label={manifesto} className="overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <div className="-mx-10 -rotate-3 border-y border-paper/10 py-5">
        <div className="flex overflow-hidden">
          <p aria-hidden className="marquee flex shrink-0" style={{ ["--marquee-duration" as string]: "70s" }}>
            {[...items, ...items].map((t, i) => (
              <span key={i} className="display flex items-center gap-10 pr-10 text-[clamp(1.6rem,3.6vw,3.25rem)] whitespace-nowrap">
                {t}
                <span className="text-accent">✦</span>
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
