import { useEffect, useRef, useState } from 'react'
import { reducedMotion } from '../lib/scroll'

/*
 * Each demo is a small piece of the product itself, remounted per feature so its animation replays.
 * They sit straight on the page ground: structure comes from spacing, type and one accent bar,
 * not from grey panels.
 */

const Shell = ({ children, label }) => (
  <div data-ui role="img" aria-label={label} className="h-full min-h-0">
    {children}
  </div>
)

const Hit = ({ children }) => <b className="bg-accent px-0.5 font-medium text-accent-ink">{children}</b>

/** The accent bar that marks the row you are on. */
const Bar = ({ on }) => (
  <span
    aria-hidden="true"
    className={`absolute inset-y-1 left-0 w-[3px] origin-top bg-accent transition-transform duration-500 ease-out ${on ? 'scale-y-100' : 'scale-y-0'}`}
  />
)

function SearchDemo() {
  const query = 'ending the contract early'
  const [n, setN] = useState(reducedMotion() ? query.length : 0)

  useEffect(() => {
    if (reducedMotion()) return
    const id = setInterval(() => setN((v) => (v >= query.length ? v : v + 1)), 55)
    return () => clearInterval(id)
  }, [])

  const results = [
    {
      body: (
        <>
          …either party may <Hit>terminate</Hit> this Agreement for convenience on sixty (60) days’ written notice…
        </>
      ),
      src: 'p. 18 · §12.1',
      score: 94,
    },
    {
      body: (
        <>
          …<Hit>exit fees</Hit> apply if the Customer leaves before the first renewal date…
        </>
      ),
      src: 'p. 31 · §14.4',
      score: 81,
    },
    {
      body: (
        <>
          …the <Hit>notice period</Hit> for non-renewal is ninety (90) days…
        </>
      ),
      src: 'p. 42 · §4.2',
      score: 67,
    },
  ]

  return (
    <Shell label="Search for ending the contract early returns clauses about termination, exit fees and notice periods">
      <div className="flex items-center gap-3 pb-3">
        <svg viewBox="0 0 16 16" className="h-5 w-5 shrink-0 text-accent" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p className="t-lead text-ink max-sm:text-[1.125rem]">
          {query.slice(0, n)}
          <span className="ml-px inline-block h-5 w-[2px] translate-y-0.5 bg-accent [animation:blink_1s_steps(1)_infinite]" />
        </p>
      </div>
      <ul className="mt-2 space-y-1">
        {results.map((r, i) => (
          <li
            key={r.src}
            style={{ '--i': i, '--base': reducedMotion() ? '0ms' : '1500ms' }}
            className="rise group relative flex items-start justify-between gap-4 py-3 pl-0 transition-[padding] duration-300 ease-out hover:pl-4 compact:py-2"
          >
            <span className="absolute inset-y-2 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-y-100" aria-hidden="true" />
            <div>
              <p className="t-small text-ink">{r.body}</p>
              <p className="mt-1.5 text-[0.875rem] text-ink-3">{r.src}</p>
            </div>
            <p className="t-small shrink-0 font-semibold text-accent tabular-nums">{r.score}%</p>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

const CLAIMS = [
  {
    claim: 'The contract renews every 12 months unless notice is given 90 days ahead.',
    page: 'p. 42',
    quote: '§4.2 …renews automatically for successive twelve-month terms unless either party gives written notice of non-renewal at least ninety (90) days before the term ends.',
  },
  {
    claim: 'Liability is capped at twelve months of fees.',
    page: 'p. 57',
    quote: '§7.1 …each party’s total liability under this Agreement is capped at the fees paid in the twelve months preceding the claim.',
  },
  {
    claim: 'Security incidents must be reported within 72 hours.',
    page: 'p. 63',
    quote: '§9.3 …Supplier shall notify Customer of any security incident within seventy-two (72) hours…',
  },
]

function CitationsDemo() {
  const [i, setI] = useState(0)
  const paused = useRef(false)

  useEffect(() => {
    if (reducedMotion()) return
    const id = setInterval(() => {
      if (!paused.current) setI((v) => (v + 1) % CLAIMS.length)
    }, 2600)
    return () => clearInterval(id)
  }, [])

  const pick = (k) => () => {
    paused.current = true
    setI(k)
  }

  return (
    <Shell label="Each claim in a summary links to the page it came from">
      <ul className="space-y-1">
        {CLAIMS.map((c, k) => (
          <li key={c.page} className="relative">
            <Bar on={i === k} />
            <button
              type="button"
              onPointerEnter={pick(k)}
              onFocus={pick(k)}
              onPointerLeave={() => (paused.current = false)}
              onBlur={() => (paused.current = false)}
              className={`t-small flex w-full items-start justify-between gap-4 py-3 compact:py-2 text-left transition-[padding,color] duration-300 ease-out ${i === k ? 'pl-4 text-ink' : 'pl-0 text-ink-2'}`}
            >
              <span>{c.claim}</span>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.875rem] font-semibold transition-colors duration-300 ${i === k ? 'bg-accent text-accent-ink' : 'text-ink-3'}`}
              >
                {c.page}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p key={i} className="rise relative mt-4 pl-4 font-serif text-[0.9375rem] leading-[1.65] text-ink">
        <span className="absolute inset-y-1 left-0 w-[3px] bg-ink-3" aria-hidden="true" />
        {CLAIMS[i].quote}
      </p>
    </Shell>
  )
}

function AnnotationsDemo() {
  return (
    <Shell label="Two teammates comment on the same clause at the same time">
      <div className="relative pb-2 font-serif text-[0.9375rem] leading-[1.7] text-ink">
        <p>
          <strong>4.2 Term and Renewal.</strong> This Agreement begins on the Effective Date and continues for
          thirty-six (36) months. It renews automatically for successive twelve-month terms unless either party gives
          written notice of non-renewal{' '}
          <mark className="bg-accent px-0.5 text-accent-ink">at least ninety (90) days before the term ends.</mark>
        </p>
        <span aria-hidden="true" className="absolute top-[58%] left-[24%] [animation:drift-a_7s_ease-in-out_infinite]">
          <span className="flex items-start gap-1">
            <svg viewBox="0 0 16 16" className="h-4 w-4 text-accent" fill="currentColor"><path d="M2 1l11 6-5 1.4L6.5 14z" /></svg>
            <span className="mt-3 bg-accent px-2 py-0.5 font-sans text-[0.8125rem] font-semibold text-accent-ink">Maya</span>
          </span>
        </span>
        <span aria-hidden="true" className="absolute top-[30%] left-[62%] [animation:drift-b_8s_ease-in-out_infinite]">
          <span className="flex items-start gap-1">
            <svg viewBox="0 0 16 16" className="h-4 w-4 text-ink" fill="currentColor"><path d="M2 1l11 6-5 1.4L6.5 14z" /></svg>
            <span className="mt-3 bg-ink px-2 py-0.5 font-sans text-[0.8125rem] font-semibold text-ground">Dev</span>
          </span>
        </span>
      </div>
      <ul className="mt-5 space-y-1">
        {[
          ['Maya', 'Is 90 days standard for us?'],
          ['Dev', 'Legal says 60. Flagging it for the renegotiation.'],
        ].map(([who, text], k) => (
          <li
            key={who}
            style={{ '--i': k, '--base': reducedMotion() ? '0ms' : '700ms' }}
            className="rise flex items-baseline gap-3 py-2 transition-[padding] duration-300 ease-out hover:pl-3"
          >
            <span className={`t-small font-semibold ${k ? 'text-ink' : 'text-accent'}`}>{who}</span>
            <span className="t-small text-ink">{text}</span>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

function SecurityDemo() {
  const rows = [
    'Independent SOC 2 audit',
    'Encrypted in transit and at rest',
    'Never used to train public models',
    'Access log for every document view',
  ]
  return (
    <Shell label="Security controls verified one by one">
      <ul className="space-y-1">
        {rows.map((r, i) => (
          <li
            key={r}
            style={{ '--d': `${i * 520 + 300}ms` }}
            className="group relative flex items-center justify-between gap-4 py-3 compact:py-2 transition-[padding] duration-300 ease-out hover:pl-4"
          >
            <span className="absolute inset-y-2 left-0 w-[3px] origin-top scale-y-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-y-100" aria-hidden="true" />
            <span className="t-small text-ink">{r}</span>
            <span className="relative flex h-6 w-24 shrink-0 items-center justify-end">
              <span className="t-small absolute right-0 text-ink-3 [animation:fade-out_0.3s_var(--d)_both]">Checking</span>
              <span className="absolute right-0 flex items-center gap-2 opacity-0 [animation:rise_0.5s_calc(var(--d)+250ms)_both]">
                <span className="t-small font-semibold text-accent">Verified</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-ink">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" aria-hidden="true">
                    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Shell>
  )
}

export const demos = [SearchDemo, CitationsDemo, AnnotationsDemo, SecurityDemo]
