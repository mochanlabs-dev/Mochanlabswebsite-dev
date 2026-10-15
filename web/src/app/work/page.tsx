import type { Metadata } from "next";
import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Work from "@/components/Work";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveals from "@/components/Reveals";

export const metadata: Metadata = {
  title: "Our Work | Mochan Labs",
  description: "Case studies: Weighbridge management software and ODTS, an order dispatch & tracking system.",
};

// Case studies live on their own page rather than the home page.
export default function WorkPage() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main className="pt-10">
        <Work />
        <Contact />
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
