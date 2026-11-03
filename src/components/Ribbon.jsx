import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger, reducedMotion } from '../lib/scroll'

const COUNT = 18

const FILLER = ['Schedule 2 sets out the', 'fees, service levels and', 'the notice addresses for', 'each party to this Agreement.']

const PAGES = [
  { title: '4.2 Term and Renewal', lines: ['This Agreement begins on the', 'Effective Date and continues', 'for thirty-six (36) months.', 'It renews automatically for', 'successive twelve-month terms', 'unless notice is given.'], hl: 3 },
  { title: '7.1 Limitation of Liability', lines: ['Except for breaches of', 'confidentiality, each party’s', 'total liability is capped at', 'the fees paid in the twelve', 'months preceding the claim.', 'Neither party is liable.'], hl: 2 },
  { title: '9.3 Data Handling', lines: ['Supplier shall process', 'Customer Data only on', 'documented instructions and', 'shall notify Customer of any', 'incident within 72 hours.', 'Data is deleted on exit.'], hl: 3 },
  { title: '12.1 Termination', lines: ['Either party may terminate', 'this Agreement for', 'convenience on sixty (60)', 'days’ written notice to the', 'other party at the address', 'stated in Schedule 2.'], hl: 1 },
  { title: '14.4 Fees on Exit', lines: ['Exit fees apply if the', 'Customer leaves before the', 'first renewal date. Fees are', 'invoiced within thirty (30)', 'days of the notice and are', 'payable on receipt.'], hl: 0 },
]

/**
 * A ribbon of pages that slides along a fixed wave as the page scrolls, twisting with scroll speed.
 * It sits between the hero and the pillars: loose documents on their way to becoming the stacks below.
 * One scroll listener moves every page; nothing animates on its own.
 */
export default function Ribbon() {
  const root = useRef(null)

  useLayoutEffect(() => {
    const el = root.current
    const pages = [...el.querySelectorAll('[data-page]')]
    const s = { W: 1, H: 1, pw: 1, gap: 1, total: 1, scroll: 0, twist: 0, twistTarget: 0 }

    const measure = () => {
      s.W = el.clientWidth
      s.H = el.clientHeight
      s.pw = pages[0].offsetWidth
      s.gap = Math.max(s.W / (COUNT - 4), s.pw * 0.56)
      s.total = COUNT * s.gap
    }

    const layout = () => {
      const k = (Math.PI * 2) / (s.W * 0.78)
      const amp = s.H * 0.2
      for (let i = 0; i < COUNT; i++) {
        const raw = i * s.gap - s.scroll
        const u = (((raw % s.total) + s.total) % s.total) - s.gap * 2
        const a = u * k
        const y = s.H / 2 + amp * Math.sin(a)
        const rz = (Math.atan(amp * k * Math.cos(a)) * 180) / Math.PI
        const ry = 34 * Math.sin(a + 1.1) + s.twist
        const z = 70 * Math.cos(a + 0.6)
        pages[i].style.transform = `translate3d(${u.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateZ(${rz.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
      }
    }

    measure()

    if (reducedMotion()) {
      s.scroll = s.W * 0.2
      layout()
      const onResize = () => {
        measure()
        layout()
      }
      window.addEventListener('resize', onResize)
      return () => window.removeEventListener('resize', onResize)
    }

    // Runs only while the ribbon is on screen.
    const tick = () => {
      const d = s.twistTarget - s.twist
      if (Math.abs(d) > 0.05 || s.dirty) {
        s.twist += d * 0.12
        s.dirty = false
        layout()
      }
    }

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          s.scroll = self.progress * s.W * 1.5
          s.twistTarget = gsap.utils.clamp(-38, 38, self.getVelocity() / 70)
          s.dirty = true
        },
        onToggle: (self) => {
          if (self.isActive) gsap.ticker.add(tick)
          else gsap.ticker.remove(tick)
        },
        onRefresh: () => {
          measure()
          s.dirty = true
        },
      })
    }, el)

    layout()
    return () => {
      gsap.ticker.remove(tick)
      ctx.revert()
    }
  }, [])

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="relative h-[17rem] overflow-hidden [perspective:1100px] md:h-[25rem]"
      style={{ '--pw': 'clamp(7rem, 10.5vw, 9.5rem)' }}
    >
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {Array.from({ length: COUNT }, (_, i) => {
          const pg = PAGES[i % PAGES.length]
          return (
            <div
              key={i}
              data-page
              className="absolute top-0 left-0 overflow-hidden bg-raise-3 p-[0.9rem] font-serif text-[0.5rem] leading-[1.7] text-ink-3 will-change-transform md:p-4 md:text-[0.5625rem]"
              style={{ width: 'var(--pw)', height: 'calc(var(--pw) * 1.28)', translate: '-50% -50%' }}
            >
              <p className="mb-1.5 font-sans text-[0.5625rem] font-semibold text-ink-2 md:text-[0.625rem]">{pg.title}</p>
              {[...pg.lines, ...FILLER].map((l, k) =>
                k === pg.hl ? (
                  <mark key={k} className="block w-fit bg-accent px-0.5 text-accent-ink">
                    {l}
                  </mark>
                ) : (
                  <span key={k} className="block">
                    {l}
                  </span>
                ),
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
