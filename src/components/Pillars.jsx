import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, reducedMotion } from "../lib/scroll";
import { PillarScene, progressToIndex } from "../lib/PillarScene";
import { demos } from "./FeatureDemos";

const FEATURES = [
  {
    name: "Smart Semantic Search",
    short: "Search",
    tagline: "Find by meaning",
    blurb:
      "Ask in your own words. LuminaDocs finds the clause even when the document words it differently.",
  },
  {
    name: "Automated Citation Tracking",
    short: "Citations",
    tagline: "Traced to the page",
    blurb:
      "Every claim in a summary links back to the page and section it came from.",
  },
  {
    name: "Real-Time Team Annotations",
    short: "Annotations",
    tagline: "Comment together",
    blurb: "Comment on a passage and your team sees it the moment you do.",
  },
  {
    name: "SOC2 Certified Enterprise Security",
    short: "Security",
    tagline: "SOC 2 certified",
    blurb:
      "Independently audited controls. Your documents stay in your workspace and never train public models.",
  },
];

// Below this height the pinned stage cannot fit the heading, tabs and demo, so it scrolls normally.
const SHORT = "(max-height: 639px)";

/** True when the pillars should sit still: reduced motion, or a screen too short to pin. */
function useStill() {
  const get = () => reducedMotion() || window.matchMedia(SHORT).matches;
  const [still, setStill] = useState(get);
  useEffect(() => {
    const mqs = [
      window.matchMedia(SHORT),
      window.matchMedia("(prefers-reduced-motion: reduce)"),
    ];
    const on = () => setStill(get());
    mqs.forEach((m) => m.addEventListener("change", on));
    return () => mqs.forEach((m) => m.removeEventListener("change", on));
  }, []);
  return still;
}

export default function Pillars() {
  const stage = useRef(null);
  const host = useRef(null);
  const scene = useRef(null);
  const labelRefs = useRef([]);
  const tabRefs = useRef([]);
  const [active, setActive] = useState(0);
  const [noGL, setNoGL] = useState(false);
  const still = useStill();

  // Build the Three.js scene.
  useEffect(() => {
    let s;
    try {
      s = new PillarScene(host.current, { onSelect: (i) => setActive(i) });
    } catch {
      setNoGL(true);
      return;
    }
    scene.current = s;
    s.setLabels(labelRefs.current);
    return () => {
      s.dispose();
      scene.current = null;
    };
  }, []);

  useEffect(() => {
    scene.current?.setActive(active);
  }, [active]);

  // Pin the stage and let scroll drop the pillars, or show them landed.
  useLayoutEffect(() => {
    if (still) {
      scene.current?.setProgress(1, true);
      return;
    }
    scene.current?.setProgress(0, true);
    const ctx = gsap.context(() => {
      let last = -1;
      ScrollTrigger.create({
        trigger: stage.current,
        start: "top top",
        end: "+=270%",
        pin: true,
        onUpdate: (self) => {
          scene.current?.setProgress(self.progress);
          const idx = progressToIndex(self.progress);
          if (idx !== last) {
            last = idx;
            setActive(idx);
          }
        },
      });
    }, stage);
    return () => ctx.revert();
  }, [still]);

  const onTabKey = (e, i) => {
    const dir =
      e.key === "ArrowDown" || e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowUp" || e.key === "ArrowLeft"
          ? -1
          : 0;
    if (!dir) return;
    e.preventDefault();
    const n = (i + dir + FEATURES.length) % FEATURES.length;
    setActive(n);
    tabRefs.current[n]?.focus();
  };

  const Demo = demos[active];

  // Pinned: the stage is exactly one screen. Still: it grows with its content.
  const stageCls = still
    ? "min-h-svh gap-10 py-24 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12"
    : "h-svh grid-rows-[minmax(0,34fr)_minmax(0,66fr)] max-lg:compact:grid-rows-[minmax(0,30fr)_minmax(0,70fr)] gap-3 pt-[4.5rem] pb-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:grid-rows-1 lg:gap-12 lg:pt-[5.5rem] lg:pb-10";
  const canvasCls = still
    ? "relative h-[min(26rem,60svh)] min-h-[16rem] lg:h-[min(34rem,70svh)]"
    : "relative min-h-0";

  return (
    <section id="product" aria-labelledby="pillars-title" className="bg-ground">
      <div ref={stage} className={`frame grid ${stageCls}`}>
        <div className={canvasCls}>
          <div ref={host} className="absolute inset-0" aria-hidden="true" />

          {/* Headings that ride above each pillar. The tabs beside them are the accessible controls. */}
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            {FEATURES.map((f, i) => {
              const on = active === i;
              return (
                <button
                  key={f.short}
                  ref={(el) => (labelRefs.current[i] = el)}
                  type="button"
                  tabIndex={-1}
                  onClick={() => setActive(i)}
                  className="absolute top-0 left-0 text-center whitespace-nowrap opacity-0 will-change-transform"
                >
                  <span
                    className={`flex items-center justify-center gap-1.5 text-[0.75rem] leading-tight font-semibold transition-colors duration-500 min-[400px]:text-[0.8125rem] sm:gap-2 sm:text-[0.875rem] lg:text-[1.0625rem] ${on ? "text-ink" : "text-ink-2"}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full bg-accent transition-transform duration-500 ease-out ${on ? "scale-100" : "scale-0"}`}
                    />
                    {f.short}
                  </span>
                  <span
                    className={`mt-0.5 hidden text-[0.875rem] transition-colors duration-500 lg:block ${on ? "text-ink-2" : "text-ink-3"}`}
                  >
                    {f.tagline}
                  </span>
                </button>
              );
            })}
          </div>

          {noGL && (
            <p className="t-body absolute inset-0 flex items-center text-ink-2">
              3D view unavailable on this device. Use the tabs to explore each
              pillar.
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-col">
          <h2
            id="pillars-title"
            className="t-h2 max-w-[16ch] max-lg:text-[1.75rem] max-sm:compact:text-[1.5rem] lg:compact:text-[2.25rem]"
          >
            Four pillars under every summary
          </h2>

          <div
            role="tablist"
            aria-label="Pillars"
            className="mt-3 grid grid-cols-4 gap-x-2 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-0.5 lg:mt-7 lg:block lg:space-y-0.5 lg:compact:mt-4 lg:compact:flex lg:compact:flex-wrap lg:compact:gap-x-6 lg:compact:space-y-0"
          >
            {FEATURES.map((f, i) => {
              const on = active === i;
              return (
                <button
                  key={f.name}
                  ref={(el) => (tabRefs.current[i] = el)}
                  role="tab"
                  id={`tab-${i}`}
                  aria-selected={on}
                  aria-controls="pillar-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onTabKey(e, i)}
                  aria-label={f.name}
                  className={`group flex items-center gap-2 py-2 text-left transition-[padding,color] duration-300 ease-out sm:w-full sm:gap-2.5 lg:gap-3 lg:py-2.5 lg:hover:pl-3 lg:compact:w-auto lg:compact:py-1.5 lg:compact:hover:pl-0 ${on ? "text-ink lg:pl-3 lg:compact:pl-0" : "text-ink-2 hover:text-ink"}`}
                >
                  <span
                    aria-hidden="true"
                    className={`hidden h-2 w-2 shrink-0 rounded-full transition-[background-color,scale] duration-300 min-[400px]:block ${on ? "scale-125 bg-accent" : "bg-raise-4 group-hover:bg-ink-3"}`}
                  />
                  <span className="text-[0.75rem] leading-tight font-semibold min-[400px]:text-[0.8125rem] sm:hidden lg:compact:inline lg:compact:text-[0.9375rem]">
                    {f.short}
                  </span>
                  <span className="hidden text-[0.9375rem] leading-tight font-semibold sm:inline lg:text-[1.0625rem] lg:compact:hidden">
                    {f.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id="pillar-panel"
            role="tabpanel"
            aria-labelledby={`tab-${active}`}
            className="mt-3 flex min-h-0 flex-1 flex-col lg:mt-9"
          >
            <p
              key={active}
              className="rise t-small lg:t-body max-w-[48ch] text-desc"
            >
              {FEATURES[active].blurb}
            </p>
            <div
              key={`d-${active}`}
              className={`rise mt-4 lg:mt-5 ${still ? "min-h-[16rem]" : "min-h-0 flex-1 overflow-hidden"}`}
            >
              <Demo />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
