import { useRef } from 'react'
import { useReveal } from '../lib/scroll'
import EmailForm from './EmailForm'

export default function CtaBand() {
  const ref = useRef(null)
  useReveal(ref, { stagger: 0.1 })

  return (
    <section id="trial" ref={ref} aria-labelledby="trial-title" className="bg-accent text-accent-ink">
      <div className="frame grid gap-12 py-24 md:py-40 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
        <h2 id="trial-title" data-reveal className="t-display max-w-[14ch]">
          Your next 100 pages, in 3 bullets
        </h2>
        <div data-reveal>
          <p className="t-lead mb-8 max-w-[30ch]">Start your 14-day free trial and cancel anytime.</p>
          <EmailForm tone="accent" />
        </div>
      </div>
    </section>
  )
}
