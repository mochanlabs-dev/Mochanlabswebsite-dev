import type { ReactNode } from "react";
import { ArrowIcon } from "./icons";

/** "[ 02 — OUR SERVICES ]" section tag. */
export function Tag({ index, children, className = "" }: { index?: string; children: ReactNode; className?: string }) {
  return (
    <p className={`tag ${className}`}>
      [ {index && <span className="text-accent">{index} — </span>}
      {children} ]
    </p>
  );
}

/**
 * Button whose label rolls up letter by letter on hover. Each letter is
 * rendered twice (stacked); hover slides the column up by one line.
 */
export function RollButton({
  href,
  children,
  variant = "accent",
  className = "",
  external = false,
}: {
  href: string;
  children: string;
  variant?: "accent" | "light" | "dark";
  className?: string;
  external?: boolean;
}) {
  const styles = {
    accent: "bg-accent text-paper",
    light: "bg-paper text-ink",
    dark: "bg-ink text-paper",
  }[variant];

  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group inline-flex items-center gap-3 rounded-full py-3 pr-3 pl-6 font-mono text-[0.8rem] font-medium tracking-wide uppercase transition-transform duration-300 active:scale-[0.97] ${styles} ${className}`}
    >
      <span className="sr-only">{children}</span>
      <span className="relative inline-flex overflow-hidden" aria-hidden>
        {children.split("").map((ch, i) => (
          <span
            key={i}
            aria-hidden
            className="relative inline-block transition-transform duration-500 ease-out-expo group-hover:-translate-y-full"
            style={{ transitionDelay: `${i * 18}ms` }}
          >
            {ch === " " ? " " : ch}
            <span className="absolute top-full left-0">{ch === " " ? " " : ch}</span>
          </span>
        ))}
      </span>
      <span
        className={`grid size-8 place-items-center rounded-full transition-transform duration-500 ease-out-expo group-hover:rotate-[-45deg] ${
          variant === "accent" ? "bg-paper text-accent" : variant === "light" ? "bg-ink text-paper" : "bg-paper text-ink"
        }`}
      >
        <ArrowIcon className="size-3.5" />
      </span>
    </a>
  );
}
