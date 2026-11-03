import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, reducedMotion } from "../lib/scroll";
import Button from "./Button";
import EmailForm from "./EmailForm";
import DocMock from "./DocMock";
import Mark from "./Mark";

const HEADLINE = "Turn 100-Page PDFs into 3-Bullet Insights in Seconds.".split(
  " ",
);

function PlayIcon() {
  return (
    <svg
      className="h-3.5 w-3.5"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M4 2.5v11l9.5-5.5z" />
    </svg>
  );
}

export default function Hero() {
  const root = useRef(null);
  const mockRef = useRef(null);
  const videoRef = useRef(null);
  const [replayKey, setReplayKey] = useState(0);
  const motion = !reducedMotion();

  useLayoutEffect(() => {
    if (!motion) return;
    const ctx = gsap.context(() => {
      gsap.set("[data-word]", { yPercent: 110 });
      gsap.set("[data-hero-in]", { y: 22, opacity: 0 });
      gsap.set(mockRef.current, { y: 48, opacity: 0 });
      gsap.set("[data-hero-media]", { opacity: 0, scale: 0.94 });
      const tl = gsap.timeline({
        defaults: { ease: "power4.out" },
        delay: 0.1,
      });
      tl.to('[data-hero-in="brand"]', { y: 0, opacity: 1, duration: 0.9 })
        .to(
          "[data-word]",
          { yPercent: 0, duration: 1.1, stagger: 0.06 },
          "-=0.55",
        )
        .to(
          '[data-hero-in]:not([data-hero-in="brand"])',
          { y: 0, opacity: 1, duration: 0.9, stagger: 0.09 },
          "-=0.7",
        )
        .to(mockRef.current, { y: 0, opacity: 1, duration: 1.2 }, "-=0.9")
        .to(
          "[data-hero-media]",
          { opacity: 1, scale: 1, duration: 2, ease: "power2.out" },
          0.3,
        );
    }, root);
    return () => ctx.revert();
  }, [motion]);

  // Park the loop while the hero is off screen.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      {
        threshold: 0.05,
      },
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  const replay = () => {
    setReplayKey((k) => k + 1);
    mockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="top" ref={root} className="relative">
      <div className="frame relative z-10 flex flex-col pb-12 max-md:justify-start max-md:pt-10 md:min-h-svh md:justify-end md:pt-24 md:pb-14">
        <div
          data-hero-in="brand"
          className="mb-7 flex items-center justify-center gap-3.5 md:mb-12 md:gap-5"
        >
          <Mark className="h-9 w-9 md:h-12 md:w-12" animate />
          <div>
            <p className="text-[min(11.5vw,3rem)] leading-none font-semibold tracking-[-0.04em] md:text-[min(12vw,10rem)]">
              LuminaDocs
            </p>
          </div>
        </div>

        <h1
          className="t-display max-w-[19ch] max-md:max-w-none max-md:text-[1.625rem] max-md:text-center md:max-w-[32ch]"
          aria-label={HEADLINE.join(" ")}
        >
          {HEADLINE.map((w, i) => (
            <span key={i} aria-hidden="true">
              <span className="-mb-[0.08em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                <span data-word className="inline-block">
                  {w}
                </span>
              </span>
              {i < HEADLINE.length - 1 && " "}
            </span>
          ))}
        </h1>

        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-8 md:mt-9 md:gap-12 lg:mt-12 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-end lg:gap-12">
          <div>
            <p data-hero-in className="t-lead max-w-[34ch] text-ink max-md:mx-auto max-md:max-w-[36ch] max-md:text-center max-md:text-[1.0625rem]">
              LuminaDocs uses specialized AI models to extract key findings,
              audit compliance, and summarize complex documents automatically.
            </p>

            {/* Phones: no email field up here. Two compact buttons instead. */}
            <div data-hero-in className="mt-6 flex flex-wrap justify-center gap-3 md:hidden">
              <Button as="a" href="#trial" arrow={false} className="!px-5 !py-3">
                Start free trial
              </Button>
              <Button variant="ghost" arrow={false} onClick={replay} aria-label="Watch 2-Min Demo" className="!px-5 !py-3">
                <PlayIcon />
                Watch demo
              </Button>
            </div>

            <div data-hero-in className="mt-8 hidden max-w-[32rem] md:block">
              <EmailForm />
            </div>
            <div data-hero-in className="mt-5 hidden md:block">
              <Button variant="ghost" arrow={false} onClick={replay}>
                <PlayIcon />
                Watch 2-Min Demo
              </Button>
            </div>
          </div>

          <div ref={mockRef}>
            <DocMock replayKey={replayKey} />
          </div>
        </div>
      </div>
    </section>
  );
}
