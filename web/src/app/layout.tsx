import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import DevBadge from "@/components/DevBadge";
import VisitBeacon from "@/components/VisitBeacon";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";

// Figtree: a plain, friendly sans (the face vinskyn.com uses).
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mochan Labs | IT Solutions & Services",
  description:
    "Mochan Labs - Premier IT Solutions & Services. Web Development, Mobile Apps, Cloud, Cybersecurity and more.",
  // Test sites (dev and branch previews) must never show up in search results.
  ...(process.env.VERCEL_ENV === "preview" || process.env.DEV_SITE === "1" ? { robots: { index: false, follow: false } } : {}),
};

export const viewport: Viewport = {
  themeColor: "#f5f6f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>
        {children}
        <VisitBeacon />
        <WhatsAppButton />
        <DevBadge />
      </body>
    </html>
  );
}
