import { useSyncExternalStore } from 'react'
import { useDashboard } from '../application/useDashboard'
import type { DashboardGateway } from '../domain/gateway'
import './dashboard.css'
import { DashboardHeader } from './DashboardHeader'
import { DistrictFilter } from './DistrictFilter'
import { formatTime } from './format'
import { MetricCard } from './MetricCard'
import { OrdersCard } from './OrdersCard'
import { StatusBanner } from './StatusBanner'
import type { CardState } from './shared'
import { WindowComplianceCard } from './WindowComplianceCard'

const DARK_QUERY = '(prefers-color-scheme: dark)'

function subscribeToScheme(onChange: () => void) {
  const media = window.matchMedia?.(DARK_QUERY)
  media?.addEventListener('change', onChange)
  return () => media?.removeEventListener('change', onChange)
}

const readScheme = () => (window.matchMedia?.(DARK_QUERY).matches ? 'dark' : 'light')

const todayIso = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

interface Props {
  gateway: DashboardGateway
  /** Polling interval; defaults to 60 s. */
  refreshMs?: number
}

export function DashboardPage({ gateway, refreshMs }: Props) {
  const theme = useSyncExternalStore(subscribeToScheme, readScheme)
  const dashboard = useDashboard(gateway, { refreshMs })
  const { status, summary, lastUpdatedAt } = dashboard

  const isLoading = status === 'loading'
  const cardState: CardState = isLoading ? 'loading' : status === 'error' ? 'error' : 'data'
  const lastUpdated = lastUpdatedAt ? formatTime(lastUpdatedAt) : null

  return (
    <div data-theme={theme} lang="es-PE" className="dash-root">
      <div className="dash-container">
        <DashboardHeader
          day={summary?.day ?? todayIso()}
          operatingHours={summary?.operatingHours}
          inProgress={summary?.inProgress}
          lastUpdated={lastUpdated}
          isLoading={isLoading || dashboard.isRefreshing}
        />

        <DistrictFilter
          districts={dashboard.districts}
          value={dashboard.districtId}
          onChange={dashboard.selectDistrict}
        />
        <span role="status" aria-live="polite" className="dash-sr-only">
          {dashboard.liveMessage}
        </span>

        {status === 'empty' ? <StatusBanner kind="empty" /> : null}
        {status === 'error' ? <StatusBanner kind="error" onRetry={dashboard.retry} /> : null}
        {status === 'stale' && lastUpdated ? (
          <StatusBanner kind="stale" lastUpdated={lastUpdated} onRetry={dashboard.retry} />
        ) : null}

        <div aria-busy={isLoading} className="dash-grid">
          {isLoading ? (
            <span role="status" className="dash-sr-only">
              Cargando indicadores
            </span>
          ) : null}
          <OrdersCard state={cardState} orders={summary?.orders} />
          <WindowComplianceCard state={cardState} compliance={summary?.windowCompliance} />
          <MetricCard
            title="Distancia total de la flota"
            state={cardState}
            value={summary?.fleetDistanceKm}
            unit="km"
            srUnit="kilómetros"
          />
          <MetricCard
            title="CO₂ estimado"
            state={cardState}
            value={summary?.co2Kg}
            unit="kg"
            srUnit="kilogramos"
            note="Estimado a partir de la distancia de la flota"
          />
        </div>
      </div>
    </div>
  )
}
