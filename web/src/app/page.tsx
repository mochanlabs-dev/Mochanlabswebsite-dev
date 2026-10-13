import SmoothScroll from "@/components/SmoothScroll";
import Loader from "@/components/Loader";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import TechMarquee from "@/components/TechMarquee";
import About from "@/components/About";
import Services from "@/components/Services";
import WhyUs from "@/components/WhyUs";
import Process from "@/components/Process";
import Manifesto from "@/components/Manifesto";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Reveals from "@/components/Reveals";

// Page rhythm: white hero → black ink → statement → white ink (all one pinned
// hero sequence) → white body → Process fades to black → dark contact/footer.
export default function Home() {
  return (
    <>
      <SmoothScroll />
      <Loader />
      <Nav />
      <main>
        <Hero />
        <About />
        <Services />
        <TechMarquee />
        <WhyUs />
        <Process />
        <Manifesto />
        <Contact />
      </main>
      <Footer />
      <Reveals />
    </>
  );
}
