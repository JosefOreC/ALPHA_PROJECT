import type { ReactNode } from 'react'

type PanelProps = {
  label: string
  minCell?: number
  children: ReactNode
}

// Un solo contenedor dividido por líneas finas; nunca una tarjeta dentro de otra.
export function Panel({ label, minCell, children }: PanelProps) {
  const style = minCell ? { gridTemplateColumns: `repeat(auto-fit, minmax(${minCell}px, 1fr))` } : undefined
  return (
    <section className="eco-panel" aria-label={label} style={style}>
      {children}
    </section>
  )
}

type PanelCellProps = {
  label: ReactNode
  value: ReactNode
  unit?: ReactNode
  note?: ReactNode
  eco?: boolean
  wide?: boolean
  tinted?: boolean
}

export function PanelCell({ label, value, unit, note, eco, wide, tinted }: PanelCellProps) {
  return (
    <div className={`eco-panel__cell${wide ? ' eco-panel__cell--wide' : ''}${tinted ? ' eco-panel__cell--eco' : ''}`}>
      <p className="eco-panel__label">{label}</p>
      <p className={`eco-panel__value${eco ? ' eco-panel__value--eco' : ''}`}>
        {value}
        {unit ? <small>{unit}</small> : null}
      </p>
      {note ? <p className="eco-panel__note">{note}</p> : null}
    </div>
  )
}
