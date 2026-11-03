import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'

const FINDINGS = [
  { text: 'Auto-renews every 12 months. Give notice 90 days before the term ends.', src: 'p. 42 · §4.2' },
  { text: 'Liability is capped at 12 months of fees, except for confidentiality breaches.', src: 'p. 57 · §7.1' },
  { text: 'Security incidents must be reported within 72 hours.', src: 'p. 63 · §9.3' },
]

/** Words fade up one after another, so a finding reads as if it is being written. */
function Words({ text, on, base = 0 }) {
  return text.split(' ').map((w, i) => (
    <span
      key={i}
      className="mr-[0.27em] inline-block transition-[opacity,translate] duration-500 ease-out"
      style={{
        opacity: on ? 1 : 0,
        translate: on ? '0 0' : '0 5px',
        transitionDelay: on ? `${base + i * 32}ms` : '0ms',
      }}
    >
      {w}
    </span>
  ))
}

const Mark = ({ i, found, hot, setHot, children }) => (
  <mark
    className="doc-mark"
    data-found={found > i}
    data-hot={hot === i}
    data-dim={hot !== null && hot !== i && found > i}
    onPointerEnter={() => found > i && setHot(i)}
    onPointerLeave={() => setHot(null)}
  >
    {children}
  </mark>
)

const PHONE = '(max-width: 767px)'
const PHONE_DESIGN_WIDTH = 580

/**
 * On phones the window keeps its side-by-side layout: it is drawn at a fixed design width
 * and scaled down to the space available, like a small screenshot that still works.
 * From tablets up it lays out at its natural size.
 */
function useFit() {
  const wrap = useRef(null)
  const inner = useRef(null)
  useLayoutEffect(() => {
    const w = wrap.current
    const i = inner.current
    const mq = window.matchMedia(PHONE)
    const apply = () => {
      if (!mq.matches) {
        i.style.width = ''
        i.style.transform = ''
        w.style.height = ''
        return
      }
      const scale = Math.min(1, w.clientWidth / PHONE_DESIGN_WIDTH)
      i.style.width = `${PHONE_DESIGN_WIDTH}px`
      i.style.transformOrigin = 'top left'
      i.style.transform = `scale(${scale})`
      w.style.height = `${Math.ceil(i.offsetHeight * scale)}px`
    }
    apply()
    const ro = new ResizeObserver(apply)
    ro.observe(w)
    ro.observe(i)
    mq.addEventListener('change', apply)
    return () => {
      ro.disconnect()
      mq.removeEventListener('change', apply)
    }
  }, [])
  return [wrap, inner]
}

/**
 * Hero product frame. A progress bar reads through 100 pages, three clauses are marked
 * in the document, and the findings are written into the panel beside it.
 * Hovering either side lights its twin.
 */
export default function DocMock({ replayKey }) {
  const [wrapRef, innerRef] = useFit()
  const paperRef = useRef(null)
  const asideRef = useRef(null)
  const countRef = useRef(null)
  const barRef = useRef(null)
  const [found, setFound] = useState(0)
  const [hot, setHot] = useState(null)
  const [phase, setPhase] = useState('reading')
  const [elapsed, setElapsed] = useState(null)

  useEffect(() => {
    setFound(0)
    setHot(null)
    setElapsed(null)
    const counter = countRef.current
    const bar = barRef.current

    if (reducedMotion()) {
      counter.textContent = '100'
      bar.style.transform = 'scaleX(1)'
      setFound(3)
      setPhase('done')
      return
    }

    setPhase('reading')
    counter.textContent = '0'
    bar.style.transform = 'scaleX(0)'
    const state = { n: 0 }
    const tl = gsap.timeline({ delay: 0.9 })
    tl.to(state, {
      n: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: () => {
        counter.textContent = String(Math.round(state.n))
        bar.style.transform = `scaleX(${state.n / 100})`
      },
    })
    FINDINGS.forEach((_, i) => tl.call(() => setFound(i + 1), null, i === 0 ? '>-0.2' : '>+0.7'))
    tl.call(
      () => {
        setPhase('done')
        setElapsed(tl.duration().toFixed(1))
      },
      null,
      '>+0.6',
    )
    return () => tl.kill()
  }, [replayKey])

  // A light parallax between the page and the panel. Two layers, a few pixels each.
  useEffect(() => {
    if (reducedMotion()) return
    const px = gsap.quickTo(paperRef.current, 'x', { duration: 1.1, ease: 'power3.out' })
    const py = gsap.quickTo(paperRef.current, 'y', { duration: 1.1, ease: 'power3.out' })
    const ax = gsap.quickTo(asideRef.current, 'x', { duration: 1.1, ease: 'power3.out' })
    const onMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5
      const ny = e.clientY / window.innerHeight - 0.5
      px(nx * -8)
      py(ny * -6)
      ax(nx * 4)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const reading = phase === 'reading'

  return (
    <div ref={wrapRef} data-ui className="overflow-hidden bg-raise-2">
    <div ref={innerRef} className="bg-raise-2">
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink-2" fill="none" aria-hidden="true">
            <path d="M3.5 1.5h6l3 3v10h-9z" fill="currentColor" opacity="0.9" />
            <path d="M9.5 1.5v3h3" stroke="#171b1a" strokeWidth="1.2" />
          </svg>
          <p className="t-small truncate font-medium">Northbridge_MSA_v7.pdf</p>
          <p className="t-small hidden text-ink-3 sm:block">100 pages</p>
        </div>
        <p className="t-small flex items-center gap-2 text-ink-2 tabular-nums">
          <span
            aria-hidden="true"
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-500 ${reading ? 'bg-ink-3 [animation:pulse-dot_1.2s_ease-in-out_infinite]' : 'bg-accent'}`}
          />
          <span className={reading ? '' : 'hidden'}>
            Reading page <span ref={countRef}>0</span> of 100
          </span>
          <span className={reading ? 'hidden' : 'text-ink'}>3 findings in {elapsed ?? '0.0'}s</span>
        </p>
      </div>
      <div className="h-[3px] bg-raise-3" aria-hidden="true">
        <div
          ref={barRef}
          className={`h-full origin-left bg-accent transition-opacity duration-700 ${reading ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      <div className="grid grid-cols-[1.12fr_1fr]">
        <div className="bg-raise p-4 sm:p-6">
          <article
            ref={paperRef}
            aria-label="Excerpt of Master Services Agreement"
            className="relative overflow-hidden bg-paper px-6 py-5 text-paper-ink sm:px-7 sm:py-6"
          >
            <p className="t-small font-semibold">Master Services Agreement</p>
            <p className="mt-0.5 text-[0.875rem] text-[#5d625f]">Northbridge Holdings</p>
            <div className="mt-4 space-y-3 font-serif text-[0.875rem] leading-[1.6]">
              <p>
                <span className="mr-2 font-sans text-[0.8125rem] text-[#5d625f]">p. 42</span>
                <strong>4.2 Term and Renewal.</strong> This Agreement begins on the Effective Date and continues for
                thirty-six (36) months.{' '}
                <Mark i={0} found={found} hot={hot} setHot={setHot}>
                  It renews automatically for successive twelve-month terms unless either party gives written notice of
                  non-renewal at least ninety (90) days before the term ends.
                </Mark>
              </p>
              <p>
                <span className="mr-2 font-sans text-[0.8125rem] text-[#5d625f]">p. 57</span>
                <strong>7.1 Limitation of Liability.</strong> Except for breaches of confidentiality,{' '}
                <Mark i={1} found={found} hot={hot} setHot={setHot}>
                  each party’s total liability under this Agreement is capped at the fees paid in the twelve months
                  preceding the claim.
                </Mark>{' '}
                Neither party is liable for indirect or consequential damages.
              </p>
              <p>
                <span className="mr-2 font-sans text-[0.8125rem] text-[#5d625f]">p. 63</span>
                <strong>9.3 Data Handling.</strong> Supplier shall process Customer Data only on documented
                instructions,{' '}
                <Mark i={2} found={found} hot={hot} setHot={setHot}>
                  shall notify Customer of any security incident within seventy-two (72) hours,
                </Mark>{' '}
                and shall delete all Customer Data within thirty (30) days of termination.
              </p>
            </div>
            {reading && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 h-16 bg-accent/20 [animation:scan_1.6s_ease-in-out_infinite]"
              />
            )}
          </article>
        </div>

        <aside ref={asideRef} className="flex flex-col p-5 sm:p-6" aria-label="Key findings">
          <h2 className="t-h3">Key findings</h2>
          <ul className="mt-4 flex-1 space-y-1">
            {FINDINGS.map((f, i) => {
              const on = found > i
              const isHot = hot === i
              return (
                <li
                  key={f.src}
                  onPointerEnter={() => on && setHot(i)}
                  onPointerLeave={() => setHot(null)}
                  className={`relative py-3 pr-4 transition-[padding,background-color] duration-500 ease-out ${isHot ? 'bg-raise-3 pl-6' : 'pl-4'}`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-[3px] origin-top bg-accent transition-transform duration-500 ease-out ${isHot ? 'scale-y-100' : 'scale-y-0'}`}
                  />
                  <p className="t-small min-h-[2.5rem] font-medium text-ink">
                    <Words text={f.text} on={on} />
                  </p>
                  <p
                    className={`mt-2 text-[0.875rem] transition-colors duration-500 ${isHot ? 'text-accent' : 'text-ink-3'}`}
                    style={{ opacity: on ? 1 : 0, transition: 'opacity 600ms ease-out 500ms, color 500ms' }}
                  >
                    {f.src}
                  </p>
                </li>
              )
            })}
          </ul>
        </aside>
      </div>
    </div>
    </div>
  )
}
