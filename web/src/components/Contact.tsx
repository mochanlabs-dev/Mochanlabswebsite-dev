import { contact, contactSection } from "@/content/site";
import CircuitLines from "./CircuitLines";
import ContactForm from "./ContactForm";
import { ArrowUpRightIcon, InstagramIcon, MailIcon, WhatsAppIcon } from "./icons";
import { Label } from "./ui";

const channels = [
  { label: "Email Us", value: contact.email, href: `mailto:${contact.email}`, Icon: MailIcon },
  { label: "WhatsApp", value: "Chat Instantly on WhatsApp", href: contact.whatsappUrl, Icon: WhatsAppIcon },
  { label: "Instagram", value: "@mochan_labs", href: contact.instagramUrl, Icon: InstagramIcon },
];

export default function Contact() {
  return (
    <section id="contact" className="scroll-mt-20">
      {/* Call-to-action band */}
      <div className="px-3 sm:px-5">
        <div className="relative mx-auto max-w-[1400px] overflow-hidden rounded-lg bg-accent-soft px-6 py-24 text-center text-ink sm:py-32">
          <CircuitLines className="pointer-events-none absolute inset-0 h-full w-full text-accent opacity-25 [&_[data-trace]]:[stroke-dashoffset:0]" />
          <div className="relative">
            <Label className="mb-6">{contactSection.tag}</Label>
            <h2 data-reveal="lines" className="heading mx-auto max-w-4xl text-[clamp(2.4rem,5.6vw,5rem)]">
              {contactSection.titleLead} <span className="text-accent">{contactSection.titleAccent}</span>
            </h2>
            <p data-reveal="fade" className="mx-auto mt-6 max-w-md text-base text-ink/60">
              {contactSection.intro}
            </p>
          </div>
        </div>
      </div>

      {/* Channels + form */}
      <div className="mx-auto grid max-w-[1400px] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-3 lg:gap-0">
        <div className="lg:pr-12">
          <ul className="border-t border-ink/10">
            {channels.map(({ label, value, href, Icon }) => (
              <li key={label} data-reveal="fade">
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-center gap-4 border-b border-ink/10 py-5"
                >
                  <Icon className="size-4 text-ink/50 transition-colors group-hover:text-accent" />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium">{label}</span>
                    <span className="text-sm text-ink/55">{value}</span>
                  </span>
                  <ArrowUpRightIcon className="ml-auto size-4 text-ink/40 transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-ink" />
                </a>
              </li>
            ))}
          </ul>
          <dl data-reveal="fade" className="mt-8 grid grid-cols-2 gap-4">
            <div>
              <dt className="label mb-1">Location</dt>
              <dd className="text-sm">{contact.location}</dd>
            </div>
            <div>
              <dt className="label mb-1">Business Hours</dt>
              <dd className="text-sm">{contact.hours}</dd>
            </div>
          </dl>
        </div>

        <div data-reveal="fade" className="rounded-lg bg-card p-6 shadow-[0_1px_2px_rgb(0_0_0/0.04)] sm:p-10 lg:col-span-2">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
