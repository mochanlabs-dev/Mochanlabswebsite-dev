import { contact, contactSection } from "@/content/site";
import ContactForm from "./ContactForm";
import Particles from "./Particles";
import { ArrowUpRightIcon, InstagramIcon, MailIcon, WhatsAppIcon } from "./icons";
import { Tag } from "./ui";

const channels = [
  { label: "Email Us", value: contact.email, href: `mailto:${contact.email}`, Icon: MailIcon },
  { label: "WhatsApp", value: "Chat Instantly on WhatsApp", href: contact.whatsappUrl, Icon: WhatsAppIcon },
  { label: "Instagram", value: "@mochan_labs", href: contact.instagramUrl, Icon: InstagramIcon },
];

export default function Contact() {
  const words = `${contactSection.titleLead} ${contactSection.titleAccent}`.split(" ");
  return (
    <section id="contact" className="relative overflow-hidden bg-ink text-paper">
      {/* Dust field spans the whole section; it gathers behind the headline. */}
      <Particles className="absolute inset-0 h-full w-full" />
      <div>
        <div data-particles-anchor className="relative mx-auto max-w-[1400px] px-5 pt-24 pb-20 sm:px-8 sm:pt-32 sm:pb-28">
          <Tag index="05" className="mb-8 text-paper/50">
            {contactSection.tag}
          </Tag>
          <h2 data-reveal="lines" className="display max-w-5xl text-[clamp(2.8rem,8vw,8rem)]">
            {words.map((w, i) => (
              <span key={i}>
                {i > 0 && " "}
                <span className={`hl-word ${i === words.length - 1 ? "text-accent" : ""}`}>
                  {i === words.length - 1 ? `${w}.` : w}
                </span>
              </span>
            ))}
          </h2>
          <p data-reveal="fade" className="mt-8 max-w-md text-base text-paper/60 sm:text-lg">
            {contactSection.intro}
          </p>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1400px] gap-16 px-5 pb-28 sm:px-8 lg:grid-cols-12">
        {/* Channels */}
        <div className="flex flex-col gap-3 lg:col-span-5">
          <p className="tag mb-3 text-paper/50">[ Talk to us ]</p>
          {channels.map(({ label, value, href, Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
              data-reveal="fade"
              className="group flex items-center gap-4 rounded-2xl border border-paper/10 bg-paper/[0.03] p-5 transition-colors hover:border-accent hover:bg-accent"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-paper/15 group-hover:border-paper/40">
                <Icon className="size-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-mono text-xs tracking-[0.14em] uppercase">{label}</span>
                <span className="text-sm text-paper/55 group-hover:text-paper/85">{value}</span>
              </span>
              <ArrowUpRightIcon className="ml-auto size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          ))}
          <dl data-reveal="fade" className="mt-4 grid grid-cols-2 gap-4 border-t border-paper/10 pt-6">
            <div>
              <dt className="tag mb-1 text-paper/45">Location</dt>
              <dd className="text-sm">{contact.location}</dd>
            </div>
            <div>
              <dt className="tag mb-1 text-paper/45">Business Hours</dt>
              <dd className="text-sm">{contact.hours}</dd>
            </div>
          </dl>
        </div>

        {/* Form */}
        <div data-reveal="fade" className="lg:col-span-7">
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
