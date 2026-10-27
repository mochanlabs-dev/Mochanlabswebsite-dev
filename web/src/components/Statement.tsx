import { statement } from "@/content/site";
import { Plus } from "./ui";

// Centred statement between the hero and About; its words darken as it
// scrolls through (data-reveal="words", handled in Reveals).
export default function Statement() {
  return (
    <section aria-label={statement} className="relative">
      <div className="relative mx-auto max-w-[1400px] border-x border-ink/10 px-5 py-28 sm:px-8 sm:py-40">
        <Plus className="top-0 left-0" />
        <Plus className="top-0 left-full" />
        <p data-reveal="words" className="heading mx-auto max-w-5xl text-center text-[clamp(1.9rem,4.2vw,3.75rem)]">
          {statement}
        </p>
        <Plus className="top-full left-0" />
        <Plus className="top-full left-full" />
      </div>
      <div aria-hidden className="h-px bg-ink/10" />
    </section>
  );
}
