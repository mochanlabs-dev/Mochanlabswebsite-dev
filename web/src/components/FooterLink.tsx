"use client";

import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { scrollToTarget } from "@/lib/ready";

// A footer link that behaves like the navigation bar: section links (#about)
// smooth-scroll on the home page and lead back to it from other pages; page
// links (/work) navigate.
export default function FooterLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  const target = href.startsWith("/#") ? href.slice(1) : href;
  const isSection = target.startsWith("#");
  const real = isSection && !home ? `/${target}` : target;

  return (
    <a
      href={real}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (isSection && home) scrollToTarget(target);
        else router.push(real);
      }}
    >
      {children}
    </a>
  );
}
