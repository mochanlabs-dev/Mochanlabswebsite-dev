"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { nav, contact, footer } from "@/content/site";
import { scrollToTarget } from "@/lib/ready";
import { WhatsAppIcon } from "./icons";

// Inset white bar, as on Abatable: logo, links, and two small buttons.
export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const home = pathname === "/";
  // Section links (#about) scroll on the home page and lead back to it from
  // other pages; page links (/work) navigate.
  const link = (href: string) => (href.startsWith("#") && !home ? `/${href}` : href);
  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("#") && home) scrollToTarget(href);
    else router.push(link(href));
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        aria-label="Main"
        className={`mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-md border pr-2 pl-4 transition-[background-color,border-color,box-shadow] duration-300 ${
          scrolled || open
            ? "border-ink/8 bg-card/90 shadow-[0_1px_12px_rgb(0_0_0/0.04)] backdrop-blur-md"
            : "border-transparent bg-card/60 backdrop-blur-sm"
        }`}
      >
        <a
          href={link("#home")}
          onClick={(e) => {
            e.preventDefault();
            // Hidden door to the admin panel: click the logo three times in a
            // row (a single click still goes home). It is a convenience, not
            // security - the login itself is what protects the panel.
            if (e.detail >= 3) {
              // A plain page load: the admin app is served outside Next.js.
              // eslint-disable-next-line @next/next/no-location-assign-relative-destination
              window.location.href = "/admin/login.html";
              return;
            }
            go("#home");
          }}
          className="flex items-center gap-2"
        >
          <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-7 w-auto" priority />
          <span className="text-[0.95rem] font-medium tracking-tight">Mochan Labs</span>
        </a>

        <ul className="hidden items-center gap-6 lg:flex">
          {nav.slice(1).map((item) => (
            <li key={item.href}>
              <a
                href={link(item.href)}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.href);
                }}
                className="text-sm text-ink/70 transition-colors hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-[4px] border border-ink/15 px-3 py-2 text-sm transition-colors hover:border-ink sm:flex"
          >
            <WhatsAppIcon className="size-3.5" />
            WhatsApp
          </a>
          <a
            href={link("#contact")}
            onClick={(e) => {
              e.preventDefault();
              go("#contact");
            }}
            className="rounded-[4px] bg-accent px-3.5 py-2 text-sm font-medium text-card transition-colors hover:bg-accent-deep"
          >
            {footer.cta}
          </a>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 place-items-center lg:hidden"
          >
            <span className="relative block h-2.5 w-4.5">
              <span
                className={`absolute left-0 h-px w-4.5 bg-ink transition-transform duration-300 ${open ? "top-1.25 rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-px w-4.5 bg-ink transition-transform duration-300 ${open ? "top-1.25 -rotate-45" : "top-2.5"}`}
              />
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="mx-auto mt-2 max-w-[1400px] rounded-md border border-ink/8 bg-card p-2 shadow-[0_8px_30px_rgb(0_0_0/0.06)] lg:hidden"
      >
        <ul className="flex flex-col">
          {nav.map((item) => (
            <li key={item.href}>
              <a
                href={link(item.href)}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.href);
                }}
                className="block rounded-[4px] px-3 py-3 text-base hover:bg-paper"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href={contact.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-[4px] px-3 py-3 text-base hover:bg-paper"
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}
