import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

export function List({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="eco-list" role="grid" aria-label={label}>
      {children}
    </div>
  )
}

type ListGroupProps = {
  heading: ReactNode
  count: number
  hint?: string
  expanded: boolean
  onToggle: () => void
  children: ReactNode
}

// Grupo plegable por estado; el chevron gira con aria-expanded.
export function ListGroup({ heading, count, hint, expanded, onToggle, children }: ListGroupProps) {
  return (
    <div role="rowgroup">
      <button className="eco-group" type="button" aria-expanded={expanded} onClick={onToggle}>
        <svg className="eco-group__chev" viewBox="0 0 16 16" aria-hidden="true" style={expanded ? undefined : { transform: 'rotate(-90deg)' }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
        {heading}
        <span className="eco-group__count">{count}</span>
        {hint ? <span className="eco-group__hint">{hint}</span> : null}
      </button>
      {expanded ? children : null}
    </div>
  )
}

type ListRowProps = {
  columns?: string
  selected?: boolean
  head?: boolean
  twoLines?: boolean
  onSelect?: () => void
  children: ReactNode
}

export function ListRow({ columns, selected, head, twoLines, onSelect, children }: ListRowProps) {
  const style = columns ? ({ '--cols': columns } as CSSProperties) : undefined
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect?.()
    }
  }
  return (
    <div
      className={`eco-row${head ? ' eco-row--head' : ''}${twoLines ? ' eco-row--two' : ''}`}
      role="row"
      style={style}
      aria-selected={onSelect ? Boolean(selected) : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={onSelect ? onKeyDown : undefined}
    >
      {children}
    </div>
  )
}
