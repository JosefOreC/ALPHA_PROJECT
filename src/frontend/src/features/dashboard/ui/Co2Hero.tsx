import { HojaCo2Icon } from '../../../shared/ui'
import type { Co2Avoided } from '../domain/types'
import { formatCompact, formatDecimal, formatInt } from './format'
import { NoData, SkeletonGroup } from './shared'
import type { CardState } from './shared'

interface Props {
  state: CardState
  /** CO₂ evitado frente a rutas sin optimizar; null cuando aún no hay cálculo. */
  avoided: Co2Avoided | null
  fleetDistanceKm?: number
  co2Kg?: number
  /** Texto cuando no hay fuente de CO₂ evitado. */
  unavailable?: string
}

const TITLE_ID = 'dash-co2-title'

// El héroe de CO₂: lo más importante del tablero, sobre el bosque con el patrón Rutas.
export function Co2Hero({ state, avoided, fleetDistanceKm, co2Kg, unavailable }: Props) {
  return (
    <section className="eco-hero" aria-labelledby={TITLE_ID}>
      <svg className="eco-hero__pattern" viewBox="0 0 820 300" preserveAspectRatio="xMaxYMid slice" aria-hidden="true">
        <path className="contour" d="M0 250C140 210 230 275 360 235S600 170 820 200" />
        <path className="contour" d="M0 200C130 160 250 230 370 185S610 120 820 150" />
        <path className="contour" d="M0 150C150 110 260 180 380 135S620 70 820 100" />
        <path className="contour" d="M0 100C140 60 270 130 390 85S630 20 820 50" />
        <path className="route" d="M60 280C170 230 230 140 330 160S470 250 560 180S690 60 790 80" />
        <circle className="stop" cx="60" cy="280" r="7" />
        <circle className="stop--open" cx="560" cy="180" r="6" />
        <circle className="stop" cx="790" cy="80" r="8" />
      </svg>
      <div className="eco-hero__inner eco-hero__inner--stack">
        <div>
          <p className="eco-hero__label" id={TITLE_ID}>
            <HojaCo2Icon />
            CO₂ evitado hoy
          </p>
          {state === 'loading' ? <SkeletonGroup lines={[[64, '45%']]} /> : null}
          {state !== 'loading' && !avoided ? (
            <div className="eco-hero__big">
              <span className="eco-hero__value">
                <NoData />
              </span>
              {unavailable ? <span className="eco-hero__unit">{unavailable}</span> : null}
            </div>
          ) : null}
          {state !== 'loading' && avoided ? (
            <div className="eco-hero__big">
              <span className="eco-hero__value">−{formatCompact(avoided.avoidedPercent)} %</span>
              <span className="eco-hero__unit">de emisiones frente a rutas sin optimizar</span>
            </div>
          ) : null}
        </div>

        {state !== 'loading' ? (
          <div className="eco-hero__row">
            <ul className="eco-hero__facts">
              {avoided ? (
                <>
                  <li><strong>{formatCompact(avoided.avoidedKg)} kg</strong>evitados hoy</li>
                  {avoided.fuelSavedLiters !== null ? <li><strong>{formatCompact(avoided.fuelSavedLiters)} L</strong>equivalente diésel</li> : null}
                  {avoided.kmSaved !== null ? <li><strong>−{formatInt(avoided.kmSaved)} km</strong>recorridos</li> : null}
                </>
              ) : null}
              {co2Kg !== undefined ? (
                <li><strong>{formatDecimal(co2Kg)} kg</strong>CO₂ estimado</li>
              ) : null}
              {fleetDistanceKm !== undefined ? (
                <li><strong>{formatDecimal(fleetDistanceKm)} km</strong>de la flota</li>
              ) : null}
            </ul>
            {avoided ? <WeeklyBars days={avoided.weekly} /> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

function WeeklyBars({ days }: { days: Co2Avoided['weekly'] }) {
  const max = Math.max(1, ...days.map((day) => day.avoidedKg))
  const label = days.map((day) => (day.today ? `y hoy ${formatCompact(day.avoidedKg)}` : formatCompact(day.avoidedKg))).join(', ')
  return (
    <div className="eco-hero__chart-slim">
      <div className="eco-bars eco-bars--slim" role="img" aria-label={`Kg evitados por día: ${label}`}>
        {days.map((day, i) => (
          <div key={i} className={`eco-bars__bar${day.today ? ' eco-bars__bar--today' : ''}`} style={{ height: `${Math.round((day.avoidedKg / max) * 100)}%` }} />
        ))}
      </div>
      <div className="eco-bars__days" aria-hidden="true">
        {days.map((day, i) => (
          <span key={i} className={day.today ? 'eco-lime' : undefined}>{day.today ? 'HOY' : day.label}</span>
        ))}
      </div>
    </div>
  )
}
