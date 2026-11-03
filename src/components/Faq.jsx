import { useRef, useState } from 'react'
import { useReveal } from '../lib/scroll'

const ITEMS = [
  {
    q: 'Is my proprietary data used to train public AI models?',
    a: 'No. Your documents are processed inside your private workspace and are never used to train public models. You can delete any document, and everything derived from it, whenever you choose.',
  },
  {
    q: 'What file formats are supported (PDF, DOCX, Scanned OCR)?',
    a: 'PDF, DOCX and scanned documents. Scans run through OCR first, so an image-only PDF is summarized the same way as a text one.',
  },
  {
    q: 'Can I cancel my free trial anytime?',
    a: 'Yes. Cancel from your account settings at any point during the 14 days and you will not be charged.',
  },
]

function Item({ item, open, onToggle, id }) {
  return (
    <div data-reveal>
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className={`group flex w-full items-start justify-between gap-6 py-7 text-left transition-[padding,background-color] duration-500 ease-out hover:pl-4 ${open ? 'bg-raise pl-4' : 'bg-transparent'}`}
        >
          <span className="t-lead font-semibold max-sm:text-[1.125rem]">{item.q}</span>
          <span
            aria-hidden="true"
            className={`relative mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-[background-color,rotate] duration-500 ease-[var(--ease-spring)] ${open ? 'rotate-180 bg-accent text-accent-ink' : 'bg-raise-3 text-ink group-hover:bg-raise-4'}`}
          >
            <span className="absolute h-[2px] w-3 bg-current" />
            <span className={`absolute h-3 w-[2px] bg-current transition-transform duration-500 ease-out ${open ? 'scale-y-0' : 'scale-y-100'}`} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-a`}
        role="region"
        aria-labelledby={`${id}-q`}
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <p className={`t-body max-w-[56ch] pr-14 text-ink transition-[padding] duration-500 ease-out ${open ? 'pt-1 pb-9 pl-4' : 'pb-0'}`}>{item.a}</p>
        </div>
      </div>
    </div>
  )
}

export default function Faq() {
  const ref = useRef(null)
  const [open, setOpen] = useState(0)
  useReveal(ref, { stagger: 0.1 })

  return (
    <section id="faq" ref={ref} aria-labelledby="faq-title" className="frame bg-ground pb-32 md:pb-48">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <h2 id="faq-title" data-reveal className="t-h2 max-w-[12ch] lg:sticky lg:top-28">
            Questions before you start
          </h2>
        </div>
        <div className="space-y-2">
          {ITEMS.map((item, i) => (
            <Item key={item.q} id={`faq-${i}`} item={item} open={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
          ))}
        </div>
      </div>
    </section>
  )
}
