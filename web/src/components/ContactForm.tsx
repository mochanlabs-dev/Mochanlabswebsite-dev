"use client";

import { useState, type FormEvent } from "react";
import emailjsClient from "@emailjs/browser";
import { contact, contactSection, emailjs } from "@/content/site";

type Status = { type: "success" | "error"; message: string } | null;

const REQUIRED = ["name", "email", "subject", "message"] as const;

const field =
  "peer w-full border-b border-paper/20 bg-transparent pt-6 pb-3 text-base text-paper outline-none transition-colors placeholder:text-transparent focus:border-accent";
const label =
  "pointer-events-none absolute top-6 left-0 font-mono text-xs tracking-[0.16em] text-paper/45 uppercase transition-all peer-focus:top-0 peer-focus:text-accent peer-[:not(:placeholder-shown)]:top-0";

// Contact form sent via EmailJS (same service and templates as before):
// one email to Mochan Labs, plus an auto-reply to the sender.
export default function ContactForm() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<Status>(null);
  const [invalid, setInvalid] = useState<string[]>([]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const value = (k: string) => String(data.get(k) ?? "").trim();

    const missing = REQUIRED.filter((k) => !value(k));
    setInvalid(missing);
    if (missing.length) {
      setStatus({ type: "error", message: "Please fill in all required fields." });
      return;
    }

    setSending(true);
    setStatus(null);
    const params = {
      to_email: contact.email,
      from_name: value("name"),
      from_email: value("email"),
      phone: value("phone") || "Not provided",
      service: value("service") || "Not specified",
      subject: value("subject"),
      message: value("message"),
    };

    try {
      const options = { publicKey: emailjs.publicKey };
      await emailjsClient.send(emailjs.serviceId, emailjs.templateId, params, options);
      await emailjsClient.send(
        emailjs.serviceId,
        emailjs.autoReplyTemplateId,
        { to_email: params.from_email, to_name: params.from_name, from_email: contact.email, from_name: "Mochan Labs" },
        options,
      );
      setStatus({ type: "success", message: "✓ Message sent! We'll get back to you within 24 hours." });
      form.reset();
    } catch {
      setStatus({
        type: "error",
        message: "✗ Could not send. Please email us at mochanlabs@gmail.com or WhatsApp us.",
      });
    } finally {
      setSending(false);
    }
  };

  const errorRing = (name: string) => (invalid.includes(name) ? "!border-accent" : "");

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-8" aria-describedby="form-status">
      <h3 className="tag text-paper/60">{contactSection.formTitle}</h3>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative">
          <input id="name" name="name" placeholder=" " required autoComplete="name" className={`${field} ${errorRing("name")}`} />
          <label htmlFor="name" className={label}>
            Full Name *
          </label>
        </div>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            placeholder=" "
            required
            autoComplete="email"
            className={`${field} ${errorRing("email")}`}
          />
          <label htmlFor="email" className={label}>
            Email Address *
          </label>
        </div>
        <div className="relative">
          <input id="phone" name="phone" type="tel" placeholder=" " autoComplete="tel" className={field} />
          <label htmlFor="phone" className={label}>
            Phone / WhatsApp
          </label>
        </div>
        <div className="relative">
          <select id="service" name="service" defaultValue="" className={`${field} appearance-none pt-6 text-paper`}>
            <option value="" className="bg-ink">
              Select a service
            </option>
            {contactSection.serviceOptions.map((o) => (
              <option key={o} className="bg-ink">
                {o}
              </option>
            ))}
          </select>
          <label htmlFor="service" className={`${label} !top-0`}>
            Service Interested In
          </label>
        </div>
      </div>
      <div className="relative">
        <input id="subject" name="subject" placeholder=" " required className={`${field} ${errorRing("subject")}`} />
        <label htmlFor="subject" className={label}>
          Subject *
        </label>
      </div>
      <div className="relative">
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder=" "
          required
          className={`${field} resize-none ${errorRing("message")}`}
        />
        <label htmlFor="message" className={label}>
          Message *
        </label>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={sending}
          className="rounded-full bg-accent px-8 py-4 font-mono text-[0.8rem] tracking-wide text-paper uppercase transition-[transform,opacity] hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send Message →"}
        </button>
        <p
          id="form-status"
          role="status"
          className={`text-sm ${status?.type === "error" ? "text-accent" : "text-paper/80"}`}
        >
          {status?.message}
        </p>
      </div>
    </form>
  );
}
