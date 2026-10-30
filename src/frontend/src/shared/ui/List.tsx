import { Children, cloneElement, isValidElement } from 'react'
import type { CSSProperties, KeyboardEvent, ReactElement, ReactNode } from 'react'

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
      {/* WCAG 1.3.1: un rowgroup solo admite filas; el encabezado del grupo es una fila con una celda. */}
      <div role="row" className="eco-group-row"><div role="gridcell" className="eco-group-cell">
      <button className="eco-group" type="button" aria-expanded={expanded} onClick={onToggle}>
        <svg className="eco-group__chev" viewBox="0 0 16 16" aria-hidden="true" style={expanded ? undefined : { transform: 'rotate(-90deg)' }}>
          <path d="M4 6l4 4 4-4" />
        </svg>
        {heading}
        <span className="eco-group__count">{count}</span>
        {hint ? <span className="eco-group__hint">{hint}</span> : null}
      </button>
      </div></div>
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
  // WCAG 1.3.1: una fila de cuadrícula debe contener celdas (o encabezados de columna). Los controles
  // interactivos conservan su rol y van dentro de una celda sin caja propia para no alterar la cuadrícula.
  const role = head ? 'columnheader' : 'gridcell'
  const interactive = new Set(['button', 'a', 'input', 'select', 'textarea'])
  const cells = Children.map(children, child => {
    if (!isValidElement(child) || 'role' in (child.props as object)) return child
    if (typeof child.type === 'string' && interactive.has(child.type)) return <span role={role} style={{ display: 'contents' }}>{child}</span>
    return cloneElement(child as ReactElement<{ role?: string }>, { role })
  })
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
      {cells}
    </div>
  )
}
