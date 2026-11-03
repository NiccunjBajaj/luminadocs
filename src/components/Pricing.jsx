import { useEffect, useRef, useState } from 'react'
import { gsap, useReveal } from '../lib/scroll'
import Button from './Button'

const ANNUAL_DISCOUNT = 0.2

function Price({ value, decimals = 0 }) {
  const ref = useRef(null)
  const from = useRef(value)

  useEffect(() => {
    const state = { v: from.current }
    const t = gsap.to(state, {
      v: value,
      duration: 0.7,
      ease: 'power3.out',
      onUpdate: () => ref.current && (ref.current.textContent = state.v.toFixed(decimals)),
      onComplete: () => (from.current = value),
    })
    return () => {
      from.current = state.v
      t.kill()
    }
  }, [value, decimals])

  return (
    <span ref={ref} className="tabular-nums">
      {value.toFixed(decimals)}
    </span>
  )
}

const tiers = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    features: ['3 documents per month', 'AI summaries and key findings'],
    cta: 'Start free',
    variant: 'ghost',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29,
    popular: true,
    features: ['Unlimited documents', 'AI citations', 'Priority processing'],
    cta: 'Start 14-Day Free Trial',
    variant: 'primary',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: null,
    features: ['Dedicated API access', 'Custom SSO', 'SLA support'],
    cta: 'Talk to sales',
    variant: 'ghost',
  },
]

function Tier({ tier, annual }) {
  const monthly = tier.price === null ? null : annual ? tier.price * (1 - ANNUAL_DISCOUNT) : tier.price
  const pro = tier.popular

  return (
    <article
      data-reveal
      className={`group flex flex-col transition-[translate,background-color] duration-500 ease-out hover:-translate-y-1.5 ${pro ? 'bg-raise-3 px-8 py-12 lg:-my-6 lg:px-10 lg:py-16' : 'bg-raise px-8 py-10 hover:bg-raise-2'}`}
    >
      <div className="flex items-center justify-between gap-4">
        <h3 className="t-h3">{tier.name}</h3>
        {pro && (
          <p className="t-small rounded-full bg-accent px-3 py-1 font-semibold text-accent-ink">Most Popular</p>
        )}
      </div>

      <p className="mt-8 flex items-baseline gap-1.5">
        {monthly === null ? (
          <span className="text-[3rem] leading-none font-semibold tracking-tighter">Custom</span>
        ) : (
          <>
            <span className="text-[3rem] leading-none font-semibold tracking-tighter">
              $<Price value={monthly} decimals={annual && tier.price > 0 ? 2 : 0} />
            </span>
            <span className="t-body text-ink-2">/mo</span>
          </>
        )}
      </p>
      <p className="t-small mt-2 min-h-[1.5rem] text-ink-2">
        {tier.price > 0 ? (annual ? `Billed $${(tier.price * 12 * (1 - ANNUAL_DISCOUNT)).toFixed(2)} yearly` : 'Billed monthly') : ''}
      </p>

      <ul className="mt-8 flex-1 space-y-3">
        {tier.features.map((f) => (
          <li
            key={f}
            className="t-body flex items-start gap-3 transition-[padding] duration-300 ease-out group-hover:pl-1.5"
          >
            <svg viewBox="0 0 16 16" className="mt-1.5 h-4 w-4 shrink-0 text-accent" fill="none" aria-hidden="true">
              <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {f}
          </li>
        ))}
      </ul>

      <Button as="a" href="#trial" variant={tier.variant} className="mt-10 w-full">
        {tier.cta}
      </Button>
    </article>
  )
}

export default function Pricing() {
  const ref = useRef(null)
  const [annual, setAnnual] = useState(false)
  useReveal(ref, { stagger: 0.12 })

  return (
    <section id="pricing" ref={ref} aria-labelledby="pricing-title" className="frame bg-ground py-32 md:py-48">
      <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
        <h2 id="pricing-title" data-reveal className="t-h2 max-w-[16ch]">
          Start free. Go Pro at $29 a month.
        </h2>

        <div data-reveal className="flex items-center gap-4">
          <span className={`t-body font-medium transition-colors duration-300 ${annual ? 'text-ink-3' : 'text-ink'}`} aria-hidden="true">
            Monthly
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={annual}
            aria-label="Annual billing"
            onClick={() => setAnnual((v) => !v)}
            className="relative h-9 w-16 shrink-0 rounded-full bg-raise-4 transition-colors duration-300 hover:bg-raise-3 active:scale-95 aria-checked:bg-accent"
          >
            <span
              className={`absolute top-1 left-1 h-7 w-7 rounded-full transition-[translate,background-color] duration-500 ease-[var(--ease-spring)] ${annual ? 'translate-x-7 bg-accent-ink' : 'translate-x-0 bg-ink'}`}
            />
          </button>
          <span className={`t-body flex items-center gap-3 font-medium transition-colors duration-300 ${annual ? 'text-ink' : 'text-ink-3'}`} aria-hidden="true">
            Annual Billing
            <span className="t-small rounded-full bg-accent px-2.5 py-0.5 font-semibold text-accent-ink">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="mt-16 grid items-stretch gap-4 lg:mt-24 lg:grid-cols-[1fr_1.1fr_1fr] lg:gap-0">
        {tiers.map((t) => (
          <Tier key={t.id} tier={t} annual={annual} />
        ))}
      </div>
    </section>
  )
}
