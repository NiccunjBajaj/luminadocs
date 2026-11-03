import { useEffect, useState } from 'react'
import Button from './Button'

const links = [
  { href: '#product', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
]

export function Wordmark({ className = '' }) {
  return (
    <a href="#top" className={`group inline-flex items-center gap-2.5 font-semibold tracking-tight ${className}`} aria-label="LuminaDocs home">
      <span className="flex h-6 w-6 flex-col justify-between" aria-hidden="true">
        <span className="h-[5px] w-full bg-raise-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5" />
        <span className="h-[5px] w-full bg-ink-3 transition-transform duration-300 ease-out group-hover:-translate-x-0.5" />
        <span className="h-[7px] w-full bg-accent transition-transform duration-300 ease-out group-hover:translate-x-1" />
      </span>
      <span className="text-[1.0625rem]">LuminaDocs</span>
    </a>
  )
}

export default function Nav() {
  const [hidden, setHidden] = useState(false)
  const [solid, setSolid] = useState(false)

  useEffect(() => {
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setSolid(y > 24)
      if (Math.abs(y - last) > 6) {
        setHidden(y > last && y > 240)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`frame fixed inset-x-0 top-0 z-50 max-md:hidden transition-[transform,background-color] duration-500 ease-out ${hidden ? '-translate-y-full' : 'translate-y-0'} ${solid ? 'bg-ground' : 'bg-transparent'}`}
    >
      <nav className="flex h-[4.5rem] items-center justify-between" aria-label="Primary">
        <Wordmark />
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="t-small inline-block rounded-full px-4 py-2 font-medium text-ink-2 transition-[color,padding] duration-300 ease-out hover:px-5 hover:text-ink"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <Button as="a" href="#trial" arrow={false} className="!px-5 !py-2.5">
          Start free trial
        </Button>
      </nav>
    </header>
  )
}
