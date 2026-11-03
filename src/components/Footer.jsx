import { useEffect, useRef } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'
import EmailForm from './EmailForm'
import { Wordmark } from './Nav'

const columns = [
  { title: 'Product', links: ['Summaries', 'Semantic search', 'Citations', 'Annotations', 'Pricing'] },
  { title: 'Security', links: ['SOC 2 report', 'Data handling', 'Trust center'] },
  { title: 'Company', links: ['About', 'Careers', 'Contact'] },
  { title: 'Legal', links: ['Privacy', 'Terms', 'Data processing'] },
]

const WORD = 'LuminaDocs'.split('')
const W_MIN = 300
const W_MAX = 800

/** The wordmark's letters thicken toward the cursor (variable font weight). */
function Wordmarque() {
  const wrap = useRef(null)

  useEffect(() => {
    if (reducedMotion()) return
    const letters = [...wrap.current.children]
    const cur = letters.map(() => W_MIN)
    const tgt = letters.map(() => W_MIN)
    let inside = false
    let mx = 0
    let my = 0

    const aim = () => {
      letters.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const d = Math.hypot(mx - (r.left + r.width / 2), my - (r.top + r.height / 2))
        tgt[i] = inside ? W_MIN + (W_MAX - W_MIN) * Math.exp(-((d / (r.width * 1.5)) ** 2)) : W_MIN
      })
    }
    const move = (e) => {
      inside = true
      mx = e.clientX
      my = e.clientY
      aim()
    }
    const leave = () => {
      inside = false
      aim()
    }
    const tick = () => {
      letters.forEach((el, i) => {
        if (Math.abs(tgt[i] - cur[i]) < 0.5) return
        cur[i] += (tgt[i] - cur[i]) * 0.14
        el.style.fontWeight = Math.round(cur[i])
      })
    }
    const el = wrap.current
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    gsap.ticker.add(tick)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      gsap.ticker.remove(tick)
    }
  }, [])

  return (
    <p
      ref={wrap}
      aria-hidden="true"
      className="frame flex select-none justify-between leading-[0.8] tracking-[-0.05em] text-[min(15.4vw,15rem)] font-light"
    >
      {WORD.map((c, i) => (
        <span key={i} style={{ fontWeight: W_MIN }} className="inline-block">
          {c}
        </span>
      ))}
    </p>
  )
}

export default function Footer() {
  return (
    <footer className="bg-ground pt-24 md:pt-40">
      <div className="frame grid gap-16 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)]">
        <div>
          <Wordmark />
          <h2 className="t-h3 mt-10 max-w-[22ch]">Product updates, once a month.</h2>
          <div className="mt-5 max-w-[26rem]">
            <EmailForm tone="footer" label="Subscribe" name="newsletter" doneTitle="Subscribed." doneBody="Updates will go to" />
          </div>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
          {columns.map((c) => (
            <div key={c.title}>
              <h2 className="t-body font-semibold">{c.title}</h2>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l}>
                    <a
                      href="#top"
                      className="t-body inline-block text-ink-2 transition-[color,padding] duration-300 ease-out hover:pl-2 hover:text-ink"
                    >
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="frame mt-20 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="t-small flex items-center gap-3 text-ink">
          <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-accent [animation:pulse-dot_2.4s_ease-in-out_infinite]" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
          All Systems Operational
        </p>
        <p className="t-small flex items-center gap-3 text-ink">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-accent" fill="none" aria-hidden="true">
            <path d="M12 2.5l8 3v6.2c0 4.7-3.2 8.5-8 9.8-4.8-1.3-8-5.1-8-9.8V5.5z" fill="currentColor" />
            <path d="M8.5 12.2l2.4 2.4 4.6-5" stroke="#06130e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          SOC 2 Certified
        </p>
        <p className="t-small text-ink-2">© 2026 LuminaDocs, Inc.</p>
      </div>

      <div className="mt-16 overflow-hidden pb-6 md:mt-24">
        <Wordmarque />
      </div>
    </footer>
  )
}
