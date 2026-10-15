import SmoothScroll from "@/components/SmoothScroll";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Statement from "@/components/Statement";
import About from "@/components/About";
import Services from "@/components/Services";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveals from "@/components/Reveals";

// Design 2: calm and minimal, in the manner of abatable.com.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Nav />
      <main>
        <Hero />
        <Statement />
        <About />
        <Services />
        <Process />
        <WhyUs />
        <Contact />
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
