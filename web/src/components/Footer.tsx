import Image from "next/image";
import { contact, footer } from "@/content/site";
import FitText from "./FitText";
import LiveClock from "./LiveClock";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import { RollButton } from "./ui";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-paper/10 bg-ink text-paper">
      <div className="mx-auto max-w-[1400px] px-5 pt-20 sm:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <a href="#home" className="inline-flex items-center gap-3">
              <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-11 w-auto" />
              <span className="font-mono text-lg font-semibold tracking-tight">
                Mochan<span className="text-accent">Labs</span>
              </span>
            </a>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-paper/55">{footer.blurb}</p>
            <div className="mt-6 flex gap-2">
              <a
                href={contact.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="grid size-10 place-items-center rounded-full border border-paper/15 transition-colors hover:border-accent hover:bg-accent"
              >
                <InstagramIcon />
              </a>
              <a
                href={contact.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="grid size-10 place-items-center rounded-full border border-paper/15 transition-colors hover:border-accent hover:bg-accent"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h4 className="tag mb-5 text-paper/45">[ Services ]</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footer.services.map((s) => (
                <li key={s}>
                  <a href="#services" className="text-paper/75 transition-colors hover:text-accent">
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="tag mb-5 text-paper/45">[ Company ]</h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {footer.company.map((c) => (
                <li key={c.href}>
                  <a href={c.href} className="text-paper/75 transition-colors hover:text-accent">
                    {c.label}
                  </a>
                </li>
              ))}
              <li>
                {/* Served by the Express app, outside the Next.js export */}
                <a href="/admin/login.html" className="text-paper/75 transition-colors hover:text-accent">
                  Admin Login
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="tag mb-5 text-paper/45">[ Get In Touch ]</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-paper/75">
              <li>
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={contact.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  WhatsApp Us
                </a>
              </li>
              <li>{contact.location}</li>
            </ul>
            <RollButton href="#contact" className="mt-8">
              {footer.cta}
            </RollButton>
          </div>
        </div>

        {/* QR codes */}
        <div className="mt-16 flex flex-wrap gap-8 border-t border-paper/10 pt-10">
          {[
            { src: "/brand/qr-whatsapp.png", label: "Scan to WhatsApp" },
            { src: "/brand/qr-instagram.png", label: "Follow on Instagram" },
          ].map((q) => (
            <figure key={q.src} className="flex items-center gap-4">
              <Image src={q.src} alt={`${q.label} QR code`} width={88} height={88} className="rounded-lg bg-paper p-1.5" />
              <figcaption className="tag text-paper/55">{q.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-paper/10 py-6 font-mono text-[0.7rem] tracking-[0.14em] text-paper/45 uppercase lg:flex-row lg:items-center lg:justify-between">
          <span className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-accent" />
            India · HQ · <LiveClock /> IST
          </span>
          <span>{footer.copyright}</span>
          <span>{footer.madeWith}</span>
        </div>
      </div>

      {/* Oversized wordmark, fitted edge to edge at every width */}
      <div aria-hidden className="pointer-events-none px-3 select-none sm:px-5">
        <FitText className="display leading-[0.82] text-paper/[0.07]">MOCHANLABS</FitText>
      </div>
    </footer>
  );
}
