import Image from "next/image";
import Link from "next/link";
import { contact, footer, nav } from "@/content/site";
import { ArrowIcon, InstagramIcon, WhatsAppIcon } from "./icons";
import FooterLink from "./FooterLink";

// Dark footer in the Abatable mould: brand and call to action on the left,
// link columns on the right, legal line at the bottom.
export default function Footer() {
  return (
    <footer className="mt-20 px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[1400px] rounded-lg border border-ink/10 bg-card px-6 pt-14 pb-8 text-ink sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-9 w-auto" />
              <span className="text-lg font-medium tracking-tight">Mochan Labs</span>
            </Link>
            <p className="heading mt-8 max-w-sm text-2xl">{footer.blurb}</p>
            <FooterLink
              href="#contact"
              className="group mt-8 inline-flex items-center gap-2 rounded-[4px] bg-accent px-4 py-2.5 text-sm font-medium text-card transition-colors duration-300 hover:bg-accent-deep"
            >
              {footer.cta}
              <ArrowIcon className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </FooterLink>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h4 className="label mb-4">Services</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {footer.services.map((s) => (
                  <li key={s}>
                    <FooterLink href="#services" className="text-ink/70 transition-colors hover:text-accent">
                      {s}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="label mb-4">Company</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {footer.company.map((c) => (
                  <li key={c.href}>
                    <FooterLink href={c.href} className="text-ink/70 transition-colors hover:text-accent">
                      {c.label}
                    </FooterLink>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="label mb-4">Get In Touch</h4>
              <ul className="flex flex-col gap-2 text-sm text-ink/70">
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
              <div className="mt-6 flex gap-2">
                <a
                  href={contact.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="grid size-9 place-items-center rounded-[4px] border border-ink/15 transition-colors hover:border-accent hover:text-accent"
                >
                  <InstagramIcon />
                </a>
                <a
                  href={contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="grid size-9 place-items-center rounded-[4px] border border-ink/15 transition-colors hover:border-accent hover:text-accent"
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap gap-6 border-t border-ink/10 pt-8">
          {[
            { src: "/brand/qr-whatsapp.png", label: "Scan to WhatsApp" },
            { src: "/brand/qr-instagram.png", label: "Follow on Instagram" },
          ].map((q) => (
            <figure key={q.src} className="flex items-center gap-3">
              <Image src={q.src} alt={`${q.label} QR code`} width={64} height={64} className="rounded-[4px] border border-ink/10 bg-card p-1" />
              <figcaption className="text-xs text-ink/55">{q.label}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-ink/10 pt-6 text-xs text-ink/45 sm:flex-row sm:justify-between">
          <span>{footer.copyright}</span>
          <nav aria-label="Footer" className="flex flex-wrap gap-4">
            {nav.slice(1).map((n) => (
              <FooterLink key={n.href} href={n.href} className="inline-block py-1 hover:text-accent">
                {n.label}
              </FooterLink>
            ))}
          </nav>
          <span>{footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
