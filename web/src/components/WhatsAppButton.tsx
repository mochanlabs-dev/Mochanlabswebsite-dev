import { contact } from "@/content/site";
import { WhatsAppIcon } from "./icons";

const message = "Hi Mochan Labs, I'd like to know more about your services.";

// A floating chat button on every page. It opens a WhatsApp chat with the
// Mochan Labs number straight away: a round icon on phones, an icon with a
// short label on larger screens.
export default function WhatsAppButton() {
  return (
    <a
      href={`${contact.whatsappUrl}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Mochan Labs on WhatsApp"
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-[#25d366] p-3.5 text-white shadow-[0_14px_34px_-10px_rgb(18_140_70/0.65)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgb(18_140_70/0.75)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:right-6 sm:bottom-6 sm:py-3 sm:pr-5 sm:pl-4"
    >
      <WhatsAppIcon className="size-6" />
      <span className="hidden text-sm font-medium sm:inline">Chat on WhatsApp</span>
    </a>
  );
}
