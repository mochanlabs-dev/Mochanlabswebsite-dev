"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { nav, contact } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { onReady, scrollToTarget } from "@/lib/ready";
import { WhatsAppIcon } from "./icons";

// Floating dark "pill" navigation. Hides while scrolling down, returns on
// scroll up. On mobile, the menu opens a full-screen panel.
export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useGSAP(
    () => {
      // Animate the inner bar: the header itself has a CSS transform transition.
      const bar = root.current!.querySelector("nav")!;
      gsap.set(bar, { yPercent: -150 });
      return onReady(() => {
        gsap.to(bar, { yPercent: 0, duration: 1.1, ease: "expo.out", delay: 0.35 });
      });
    },
    { scope: root },
  );

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > last && y > 400);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) window.__lenis?.stop();
    else window.__lenis?.start();
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    scrollToTarget(href);
  };

  return (
    <>
      <header
        ref={root}
        className={`fixed inset-x-0 top-3 z-50 px-3 transition-transform duration-500 ease-out-expo sm:top-4 sm:px-6 ${
          hidden && !open ? "-translate-y-[150%]" : ""
        }`}
      >
        <nav
          aria-label="Main"
          className="mx-auto flex h-14 max-w-[1400px] items-center justify-between rounded-full border border-paper/10 bg-ink/80 pr-2 pl-4 text-paper backdrop-blur-xl"
        >
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              go("#home");
            }}
            className="flex items-center gap-2.5"
          >
            <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-8 w-auto" priority />
            <span className="font-mono text-sm font-semibold tracking-tight">
              Mochan<span className="text-accent">Labs</span>
            </span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {nav.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(item.href);
                  }}
                  className="rounded-full px-3.5 py-2 font-mono text-[0.72rem] tracking-[0.14em] text-paper/65 uppercase transition-colors hover:text-paper"
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
              className="flex items-center gap-2 rounded-full border border-paper/15 px-4 py-2 font-mono text-[0.72rem] tracking-wide transition-colors hover:border-accent hover:bg-accent"
            >
              <WhatsAppIcon className="size-3.5" />
              <span className="hidden sm:inline">message us</span>
            </a>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className="grid size-10 place-items-center rounded-full lg:hidden"
            >
              <span className="relative block h-3 w-5">
                <span
                  className={`absolute left-0 h-px w-5 bg-paper transition-transform duration-300 ${open ? "top-1.5 rotate-45" : "top-0"}`}
                />
                <span
                  className={`absolute left-0 h-px w-5 bg-paper transition-transform duration-300 ${open ? "top-1.5 -rotate-45" : "top-3"}`}
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-10 text-paper transition-[clip-path] duration-700 ease-out-expo lg:hidden ${
          open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]"
        }`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col gap-1">
          {nav.map((item, i) => (
            <li key={item.href} className="overflow-hidden">
              <a
                href={item.href}
                tabIndex={open ? 0 : -1}
                onClick={(e) => {
                  e.preventDefault();
                  go(item.href);
                }}
                className={`display flex items-baseline gap-4 py-1 text-5xl transition-transform duration-700 ease-out-expo ${
                  open ? "translate-y-0" : "translate-y-full"
                }`}
                style={{ transitionDelay: open ? `${120 + i * 50}ms` : "0ms" }}
              >
                <span className="font-mono text-xs tracking-normal text-accent">0{i + 1}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="tag mt-10 text-paper/50">{contact.email}</p>
      </div>
    </>
  );
}
