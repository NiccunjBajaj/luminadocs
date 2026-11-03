import { useId, useRef, useState } from 'react'
import { gsap } from '../lib/scroll'
import Button from './Button'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const tones = {
  hero: { shell: 'sm:bg-raise-2', field: 'bg-raise-2 sm:bg-transparent', button: 'primary' },
  accent: { shell: 'sm:bg-ground', field: 'bg-ground sm:bg-transparent', button: 'primary' },
  footer: { shell: 'sm:bg-raise-3', field: 'bg-raise-3 sm:bg-transparent', button: 'ghost' },
}

/**
 * Inline email capture. No backend yet: it validates, then confirms in place.
 * Swap onSubmit for the real trial-signup request.
 */
export default function EmailForm({
  label = 'Start 14-Day Free Trial',
  doneTitle = 'Check your inbox.',
  doneBody = 'We sent your trial link to',
  tone = 'hero',
  name = 'email',
  onSubmit,
}) {
  const t = tones[tone]
  const id = useId()
  const formRef = useRef(null)
  const [value, setValue] = useState('')
  const [state, setState] = useState('idle')

  const submit = (e) => {
    e.preventDefault()
    if (!EMAIL.test(value.trim())) {
      setState('error')
      gsap.fromTo(formRef.current, { x: 0 }, { keyframes: { x: [-9, 8, -5, 3, 0] }, duration: 0.45, ease: 'power2.out' })
      return
    }
    setState('done')
    onSubmit?.(value.trim())
  }

  if (state === 'done') {
    return (
      <div className="rise flex items-start gap-3" role="status">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink [animation:pop_0.5s_var(--ease-spring)_both]">
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
            <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="t-body">
          <span className="font-semibold">{doneTitle}</span> {doneBody} {value.trim()}.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="w-full">
      <div
        className={`grid gap-3 sm:flex sm:items-center sm:gap-2 sm:rounded-full sm:p-1.5 sm:pl-6 sm:transition-[padding] sm:duration-300 sm:focus-within:pl-7 sm:focus-within:ring-2 sm:focus-within:ring-accent ${t.shell}`}
      >
        <label htmlFor={id} className="sr-only">
          Work email
        </label>
        <input
          id={id}
          name={name}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Work email"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            if (state === 'error') setState('idle')
          }}
          aria-invalid={state === 'error'}
          aria-describedby={state === 'error' ? `${id}-err` : undefined}
          className={`min-w-0 flex-1 rounded-full px-5 py-3.5 text-ink placeholder:text-ink-3 focus:outline-none focus:ring-2 focus:ring-accent sm:rounded-none sm:px-0 sm:py-2.5 sm:focus:ring-0 ${t.field}`}
        />
        <Button type="submit" variant={t.button} className="w-full sm:w-auto">
          {label}
        </Button>
      </div>
      <p
        id={`${id}-err`}
        aria-live="polite"
        className={`t-small overflow-hidden text-ink transition-[max-height,margin,opacity] duration-300 ease-out ${state === 'error' ? 'mt-3 max-h-8 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        Enter a valid work email, like name@company.com.
      </p>
    </form>
  )
}
