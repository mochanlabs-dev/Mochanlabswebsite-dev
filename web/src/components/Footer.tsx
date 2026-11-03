import Image from "next/image";
import Link from "next/link";
import { contact, footer } from "@/content/site";
import { InstagramIcon, WhatsAppIcon } from "./icons";
import FooterLink from "./FooterLink";

// Brand and a short line on the left, the page links and a way to reach us on
// the right, the two QR codes, then the legal line. The contact section and the
// top bar already carry the calls to action, so none is repeated here.
export default function Footer() {
  return (
    <footer className="mt-20 px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="mx-auto max-w-[1400px] rounded-lg border border-ink/10 bg-card px-6 pt-14 pb-8 text-ink sm:px-10">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Image src="/brand/mark.png" alt="" width={292} height={321} className="h-9 w-auto" />
              <span className="text-lg font-medium tracking-tight">Mochan Labs</span>
            </Link>
            <p className="heading mt-8 max-w-sm text-2xl">{footer.blurb}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 lg:col-span-6 lg:grid-cols-2">
            <div>
              <h4 className="label mb-4">company</h4>
              <ul className="flex flex-col gap-2 text-sm">
                {footer.company.map((c) => (
                  <li key={c.href}>
                    <FooterLink href={c.href} className="text-ink/70 transition-colors hover:text-accent">
                      {c.label}
                    </FooterLink>
                  </li>
                ))}
                <li>
                  {/* Served outside the Next.js export */}
                  <a href="/admin/login.html" className="text-ink/70 transition-colors hover:text-accent">
                    Admin login
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="label mb-4">get in touch</h4>
              <ul className="flex flex-col gap-2 text-sm text-ink/70">
                <li>
                  <a href={`mailto:${contact.email}`} className="transition-colors hover:text-accent">
                    {contact.email}
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
          <span>{footer.madeWith}</span>
        </div>
      </div>
    </footer>
  );
}
