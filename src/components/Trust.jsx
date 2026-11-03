import { useRef } from 'react'
import { useReveal } from '../lib/scroll'

/* Fictional demo brands, drawn as simple monochrome wordmarks. Swap for the client's real logos. */
const logos = [
  {
    name: 'Halvorsen & Pike',
    mark: <path d="M4 20V4h4v6h8V4h4v16h-4v-6H8v6z" />,
    style: 'font-semibold tracking-tight',
  },
  {
    name: 'Meridian Capital',
    mark: <circle cx="12" cy="12" r="8" fillRule="evenodd" d="M12 4a8 8 0 100 16 8 8 0 000-16zm0 4a4 4 0 110 8 4 4 0 010-8z" />,
    style: 'font-light tracking-[0.12em] uppercase text-[0.9375rem]',
  },
  {
    name: 'Northbridge LLP',
    mark: <path d="M2 18l10-12 10 12h-5l-5-6-5 6z" />,
    style: 'font-bold tracking-tighter',
  },
  {
    name: 'Kestrel Partners',
    mark: <path d="M12 3l9 9-9 9-9-9z" />,
    style: 'font-medium italic tracking-tight',
  },
  {
    name: 'Altamira Group',
    mark: <path d="M3 5h18v4H3zm0 10h12v4H3z" />,
    style: 'font-extrabold tracking-[-0.03em]',
  },
]

export default function Trust() {
  const ref = useRef(null)
  useReveal(ref, { stagger: 0.08 })

  return (
    <section ref={ref} aria-labelledby="trust-title" className="frame bg-ground py-24 md:py-32">
      <h2 id="trust-title" data-reveal className="t-lead max-w-[28ch] text-ink md:max-w-[44ch]">
        Trusted by legal and finance teams at leading enterprises
      </h2>

      <ul className="mt-10 grid grid-cols-6 gap-x-6 gap-y-9 sm:mt-12 sm:grid-cols-5 sm:gap-x-8">
        {logos.map((l, i) => (
          <li key={l.name} data-reveal className={`min-w-0 ${i < 3 ? 'col-span-2' : 'col-span-3'} sm:col-span-1`}>
            <span
              className={`group flex flex-col items-start gap-3 text-ink-3 transition-colors duration-300 ease-out hover:text-ink lg:flex-row lg:items-center lg:transition-[color,gap] lg:hover:gap-4 ${l.style}`}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 fill-current" aria-hidden="true">
                {l.mark}
              </svg>
              <span className="text-[1rem] leading-tight lg:text-[1.0625rem] lg:whitespace-nowrap">{l.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
