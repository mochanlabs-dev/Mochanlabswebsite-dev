import type { CSSProperties, ReactNode } from "react";
import { ArrowIcon } from "./icons";

/** Small "+" crosshair marking a hairline intersection (blueprint detail). */
export function Plus({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      aria-hidden
      style={style}
      viewBox="0 0 11 11"
      className={`pointer-events-none absolute size-[11px] -translate-x-1/2 -translate-y-1/2 text-accent ${className}`}
    >
      <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** Section label, e.g. "About Us". */
export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`label ${className}`}>{children}</p>;
}

/** Small rectangular button. */
export function Button({
  href,
  children,
  variant = "accent",
  className = "",
  external = false,
  tabIndex,
}: {
  href: string;
  children: ReactNode;
  variant?: "accent" | "outline" | "ink" | "light";
  className?: string;
  external?: boolean;
  tabIndex?: number;
}) {
  const styles = {
    accent: "bg-accent text-card hover:bg-accent-deep",
    ink: "bg-accent-deep text-card hover:bg-accent",
    light: "bg-card text-ink hover:bg-accent hover:text-card",
    outline: "border border-ink/15 text-ink hover:border-ink",
  }[variant];
  return (
    <a
      href={href}
      tabIndex={tabIndex}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`group inline-flex items-center gap-2 rounded-[4px] px-4 py-2.5 text-sm font-medium transition-colors duration-300 ${styles} ${className}`}
    >
      {children}
      <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
    </a>
  );
}
