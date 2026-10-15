"use client";

import { useState, type FormEvent } from "react";
import emailjsClient from "@emailjs/browser";
import { contact, contactSection, emailjs } from "@/content/site";

type Status = { type: "success" | "error"; message: string } | null;

const REQUIRED = ["name", "email", "subject", "message"] as const;

const field =
  "w-full rounded-[4px] border border-ink/12 bg-paper/60 px-3.5 py-3 text-base text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-accent focus:bg-card";
const label = "mb-1.5 block text-sm font-medium";

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
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5" aria-describedby="form-status">
      <h3 className="heading text-2xl">{contactSection.formTitle}</h3>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={label}>
            Full Name *
          </label>
          <input id="name" name="name" required autoComplete="name" className={`${field} ${errorRing("name")}`} />
        </div>
        <div>
          <label htmlFor="email" className={label}>
            Email Address *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={`${field} ${errorRing("email")}`}
          />
        </div>
        <div>
          <label htmlFor="phone" className={label}>
            Phone / WhatsApp
          </label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" className={field} />
        </div>
        <div>
          <label htmlFor="service" className={label}>
            Service Interested In
          </label>
          <select id="service" name="service" defaultValue="" className={`${field} appearance-none`}>
            <option value="">Select a service</option>
            {contactSection.serviceOptions.map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="subject" className={label}>
          Subject *
        </label>
        <input id="subject" name="subject" required className={`${field} ${errorRing("subject")}`} />
      </div>
      <div>
        <label htmlFor="message" className={label}>
          Message *
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className={`${field} resize-none ${errorRing("message")}`}
        />
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          disabled={sending}
          className="rounded-[4px] bg-accent px-5 py-3 text-sm font-medium text-card transition-colors hover:bg-accent-deep disabled:opacity-60"
        >
          {sending ? "Sending…" : "Send Message →"}
        </button>
        <p
          id="form-status"
          role="status"
          className={`text-sm ${status?.type === "error" ? "text-accent" : "text-ink/70"}`}
        >
          {status?.message}
        </p>
      </div>
    </form>
  );
}
