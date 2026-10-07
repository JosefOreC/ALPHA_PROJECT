import { TRIP_LABELS, UNIT_LABELS } from './statusLabels'
import type { TripState, UnitState } from './statusLabels'

type TripStatusProps = {
  status: TripState
  label?: string
  meta?: string
  wide?: boolean
}

// Estado de pedido como trayecto de 3 paradas; nunca solo color: siempre lleva palabra.
export function TripStatus({ status, label = TRIP_LABELS[status], meta, wide }: TripStatusProps) {
  return (
    <span className={`eco-trip eco-trip--${status}${wide ? ' eco-trip--lg' : ''}`}>
      <svg className="eco-trip__track" viewBox="0 0 46 12" aria-hidden="true">
        <path className="seg seg1" d="M9 6h10" />
        <path className="seg seg2" d="M27 6h10" />
        <path className="cut" d="M11.5 3l5 6M16.5 3l-5 6" />
        <circle className="stop st1" cx="4.5" cy="6" r="3.5" />
        <circle className="stop st2" cx="23" cy="6" r="3.5" />
        <circle className="stop st3" cx="41" cy="6" r="3.5" />
        <path className="mark" d="M39 6.1l1.4 1.4 2.6-2.8" />
      </svg>
      {label}
      {meta ? <span className="eco-trip__meta">{meta}</span> : null}
    </span>
  )
}

type UnitStatusProps = {
  status: UnitState
  label?: string
  meta?: string
}

// Estado de vehículo como anillo con palabra.
export function UnitStatus({ status, label = UNIT_LABELS[status], meta }: UnitStatusProps) {
  return (
    <span className={`eco-unit eco-unit--${status}`}>
      <svg className="eco-unit__ring" viewBox="0 0 16 16" aria-hidden="true">
        <circle className="ring" cx="8" cy="8" r="6.2" />
        <path className="pie" d="M8 8V3.6A4.4 4.4 0 0 1 8 12.4z" />
        <circle className="core" cx="8" cy="8" r="2.6" />
        <path className="slash" d="M3.6 12.4l8.8-8.8" />
      </svg>
      {label}
      {meta ? <span className="eco-muted">{meta}</span> : null}
    </span>
  )
}
