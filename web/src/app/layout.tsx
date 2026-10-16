import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
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
};

export const viewport: Viewport = {
  themeColor: "#f5f6f3",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      <body>{children}</body>
    </html>
  );
}
