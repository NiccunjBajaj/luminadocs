import { useRef } from 'react'
import { gsap, reducedMotion } from '../lib/scroll'

const variants = {
  primary: 'bg-accent text-accent-ink hover:bg-ink',
  ghost: 'bg-raise-4 text-ink hover:bg-ink hover:text-ground',
  dark: 'bg-ground text-ink hover:bg-ink hover:text-ground',
}

export function Arrow({ className = '' }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 ${className}`}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * Flat pill button. The gap between label and arrow opens on hover (spacing as feedback)
 * and the button leans toward the pointer.
 */
export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  magnetic = true,
  arrow = true,
  className = '',
  children,
  ...rest
}) {
  const ref = useRef(null)

  const onMove = (e) => {
    if (!magnetic || reducedMotion() || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    const x = e.clientX - (r.left + r.width / 2)
    const y = e.clientY - (r.top + r.height / 2)
    // A nudge, not a pull: a few pixels at most.
    const clamp = (v) => Math.max(-4, Math.min(4, v))
    gsap.to(ref.current, { x: clamp(x * 0.06), y: clamp(y * 0.1), duration: 0.5, ease: 'power3.out' })
  }
  const onLeave = () => {
    if (!magnetic || !ref.current) return
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' })
  }

  return (
    <Tag
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3.5 text-[0.9375rem] font-semibold select-none transition-[gap,background-color,color,scale] duration-300 ease-out hover:gap-3.5 active:scale-[0.96] ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
      {arrow && <Arrow />}
    </Tag>
  )
}
