import { useEffect } from "react";
import { ScrollTrigger, startSmoothScroll } from "./lib/scroll";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Ribbon from "./components/Ribbon";
import Trust from "./components/Trust";
import Pillars from "./components/Pillars";
import Pricing from "./components/Pricing";
import Faq from "./components/Faq";
import CtaBand from "./components/CtaBand";
import Footer from "./components/Footer";

export default function App() {
  useEffect(() => {
    const stop = startSmoothScroll();
    // Layout shifts once the font and video poster land; re-measure the pins.
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      stop();
      window.removeEventListener("load", refresh);
    };
  }, []);

  return (
    <>
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Trust />
        <Pillars />
        <Pricing />
        <Faq />
        <CtaBand />
      </main>
      <Footer />
    </>
  );
}
