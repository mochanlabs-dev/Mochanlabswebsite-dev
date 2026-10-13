import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mochan Labs | IT Solutions & Services",
  description:
    "Mochan Labs — Premier IT Solutions & Services. Web Development, Mobile Apps, Cloud, Cybersecurity and more.",
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

// Runs before paint: skips the intro loader if it already played this session.
const introScript = `try{if(sessionStorage.getItem('ml-intro'))document.documentElement.classList.add('intro-seen')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
