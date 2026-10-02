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
    <header className="dash-header">
      <div>
        <h1 tabIndex={-1} className="dash-title">
          Dashboard del día
        </h1>
        <div className="dash-meta">
          <span>
            {weekday} <span className="dash-num">{date}</span>
          </span>
          {operatingHours ? (
            <>
              <span aria-hidden="true">·</span>
              <span>
                Jornada{' '}
                <span className="dash-num">
                  {trimSeconds(operatingHours.start)}–{trimSeconds(operatingHours.end)}
                </span>
              </span>
              {/* Assumption: the badge reflects the backend's `in_progress` flag. */}
              <span className={`dash-badge ${inProgress ? 'dash-badge--live' : 'dash-badge--off'}`}>
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                  {inProgress ? (
                    <circle cx="8" cy="8" r="3.5" fill="currentColor" />
                  ) : (
                    <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
                  )}
                </svg>
                {inProgress ? 'En curso' : 'Fuera de jornada'}
              </span>
            </>
          ) : null}
        </div>
      </div>
      <p className="dash-refresh">
        {isLoading ? (
          <span>Actualizando…</span>
        ) : (
          <span>
            Última actualización: <strong className="dash-num">{lastUpdated ?? '—'}</strong>
          </span>
        )}
        <br />
        <span>Se actualiza cada 60 s</span>
      </p>
    </header>
  )
}
