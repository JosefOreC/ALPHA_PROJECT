import { useId } from 'react'
import { formatDecimal } from './format'
import { NoData, SkeletonGroup, type CardState } from './shared'

interface Props {
  title: string
  state: CardState
  value?: number
  /** Short unit shown next to the figure, e.g. "km". */
  unit: string
  /** Spoken unit, e.g. "kilómetros". */
  srUnit: string
  note?: string
}

export function MetricCard({ title, state, value, unit, srUnit, note }: Props) {
  const titleId = useId()
  const hasValue = state === 'data' && value !== undefined

  return (
    <section aria-labelledby={titleId} className="dash-card dash-card--metric">
      <h2 id={titleId} className="dash-card__title">
        {title}
      </h2>
      {state === 'loading' ? <SkeletonGroup lines={[[44, '80%'], [16, '50%']]} /> : null}
      {state === 'error' ? <NoData /> : null}
      {hasValue ? (
        <>
          <div className="dash-figure">
            <span
              aria-label={`${formatDecimal(value)} ${srUnit}`}
              className="dash-figure__value dash-figure__value--metric"
            >
              {formatDecimal(value)}
            </span>
            <span className="dash-figure__unit">{unit}</span>
          </div>
          {note ? <p className="dash-note">{note}</p> : null}
        </>
      ) : null}
    </section>
  )
}
