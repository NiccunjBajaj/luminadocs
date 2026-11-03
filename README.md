# LuminaDocs landing page

React 19, Tailwind v4, Vite. Three.js draws the pillars, GSAP and Lenis drive scroll.

```
npm install
npm run dev       # development
npm run build     # production build in dist/
npm run preview   # serve the build
```

## Where things are

- `src/components/Hero.jsx`, `DocMock.jsx`: hero and the key-findings mockup.
- `src/components/Ribbon.jsx`: the page ribbon between the hero and the pillars.
- `src/components/Pillars.jsx`, `src/lib/PillarScene.js`: the pinned pillar section and its Three.js scene.
- `src/components/FeatureDemos.jsx`: the four demos beside the pillars.
- `src/index.css`: colour tokens, type scale and shared keyframes.
- `public/media/`: the hero network video (processed from the supplied clip) and its poster.

## Before launch

- Replace the five placeholder client logos in `Trust.jsx`.
- Confirm the sample contract text, FAQ answers and security claims with the client.
- The email forms validate and confirm on screen only. Wire `onSubmit` in `EmailForm.jsx` to the signup endpoint.
- "Watch 2-Min Demo" replays the hero mockup. Point it at a real video when one exists.
- Footer links go to `#top`.

## Motion

The pillar scene renders only while something moves. With `prefers-reduced-motion`, or on screens under 640px tall, the pillars sit landed and the section scrolls normally.
