/** The three-bar brand mark: two pages and the highlighted finding. */
export default function Mark({ className = 'h-6 w-6', animate = false }) {
  const bar = (cls, i) => (
    <span
      className={`block w-full ${cls} ${animate ? 'rise' : ''}`}
      style={animate ? { '--i': i, '--base': '150ms' } : undefined}
    />
  )
  return (
    <span className={`flex shrink-0 flex-col justify-between ${className}`} aria-hidden="true">
      {bar('h-[22%] bg-raise-4', 0)}
      {bar('h-[22%] bg-ink-3', 1)}
      {bar('h-[30%] bg-accent', 2)}
    </span>
  )
}
