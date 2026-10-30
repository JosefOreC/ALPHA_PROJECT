import type { OperatingHours } from '../domain/types'
import { formatDay, trimSeconds } from './format'

interface Props {
  /** YYYY-MM-DD */
  day: string
  /** Unknown until the first successful load. */
  operatingHours?: OperatingHours
  inProgress?: boolean
  /** HH:mm of the last successful update, or null when there is none. */
  lastUpdated: string | null
  isLoading: boolean
}

export function DashboardHeader({ day, operatingHours, inProgress, lastUpdated, isLoading }: Props) {
  const { weekday, date } = formatDay(day)

  return (
    <header className="eco-pagehead">
      <div>
        <h1 tabIndex={-1} className="eco-h1">
          Dashboard del día
        </h1>
        <p className="eco-sub eco-pagehead__meta">
          <span>
            {weekday} <span className="eco-code">{date}</span>
          </span>
          {operatingHours ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Jornada{' '}
                <span className="eco-code">
                  {trimSeconds(operatingHours.start)}–{trimSeconds(operatingHours.end)}
                </span>
              </span>
              {/* Assumption: the badge reflects the backend's `in_progress` flag. */}
              <span className={`eco-tag${inProgress ? ' eco-tag--eco' : ''}`}>{inProgress ? 'En curso' : 'Fuera de jornada'}</span>
            </>
          ) : null}
        </p>
      </div>
      <p className="eco-pagehead__refresh eco-muted">
        {isLoading ? (
          <span>Actualizando…</span>
        ) : (
          <span>
            Última actualización: <strong className="eco-code">{lastUpdated ?? '—'}</strong>
          </span>
        )}
        <br />
        <span>Se actualiza cada 60 s</span>
      </p>
    </header>
  )
}
