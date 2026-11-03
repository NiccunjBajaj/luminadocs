import { useLayoutEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function startSmoothScroll() {
  if (reducedMotion()) return () => {}
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.95, anchors: true })
  lenis.on('scroll', ScrollTrigger.update)
  const tick = (time) => lenis.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    gsap.ticker.remove(tick)
    lenis.destroy()
  }
}

/**
 * Staggered entrance for every [data-reveal] inside the ref'd element.
 * Items are only hidden by script, so the content stays visible if JS fails.
 */
export function useReveal(ref, { y = 28, stagger = 0.09, start = 'top 90%' } = {}) {
  useLayoutEffect(() => {
    if (reducedMotion() || !ref.current) return
    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray('[data-reveal]', ref.current)
      if (!items.length) return
      gsap.set(items, { y, opacity: 0 })
      ScrollTrigger.batch(items, {
        start,
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { y: 0, opacity: 1, duration: 1, ease: 'power3.out', stagger, overwrite: true }),
      })
    }, ref)
    return () => ctx.revert()
  }, [ref, y, stagger, start])
}

export { gsap, ScrollTrigger }
