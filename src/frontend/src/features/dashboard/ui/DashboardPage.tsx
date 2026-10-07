import { useState, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'
import { AppShell, HojaCo2Icon } from '../../../shared/ui'
import type { ModuleId } from '../../../shared/ui'
import { useDashboard } from '../application/useDashboard'
import { useDashboardInsights } from '../application/useDashboardInsights'
import type { DashboardGateway, DashboardInsightsGateway } from '../domain/gateway'
import { Co2Hero } from './Co2Hero'
import { DashboardHeader } from './DashboardHeader'
import { DistrictFilter } from './DistrictFilter'
import { formatShortDay, formatTime } from './format'
import { OrdersHero } from './OrdersHero'
import { RiskList } from './RiskList'
import { StatusBanner } from './StatusBanner'
import type { CardState } from './shared'

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

const SESSION_USER = { name: 'Logística', initials: 'RL' }

export interface MapSlotProps {
  selectedId?: string
  onSelect: (id: string) => void
}

interface Props {
  gateway: DashboardGateway
  /** CO₂ evitado y pedidos en riesgo. Sin él, esas secciones avisan que no hay datos. */
  insights?: DashboardInsightsGateway
  /** El mapa de rutas (solo lectura) lo aporta quien compone la página, para no atar la feature a Leaflet. */
  renderMap?: (props: MapSlotProps) => ReactNode
  /** Navegación entre módulos del AppShell. */
  onNavigate?: (id: ModuleId, href: string) => void
  /** Etiqueta que avisa que parte de los datos es de demostración. */
  demoNote?: string
  /** Polling interval; defaults to 60 s. */
  refreshMs?: number
}

export function DashboardPage({ gateway, insights, renderMap, onNavigate, demoNote, refreshMs }: Props) {
  const theme = useSyncExternalStore(subscribeToScheme, readScheme)
  const dashboard = useDashboard(gateway, { refreshMs })
  const extra = useDashboardInsights(insights, dashboard.districtId, { refreshMs })
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { status, summary, lastUpdatedAt } = dashboard

  const isLoading = status === 'loading'
  const cardState: CardState = isLoading ? 'loading' : status === 'error' ? 'error' : 'data'
  const lastUpdated = lastUpdatedAt ? formatTime(lastUpdatedAt) : null
  const day = summary?.day ?? todayIso()
  const goto = (id: ModuleId, href: string) => () => onNavigate?.(id, href)

  const actions = (
    <>
      {demoNote ? <span className="eco-tag eco-tag--warning">{demoNote}</span> : null}
      <span className="eco-tag">
        <span className="eco-code">
          {formatShortDay(day)}
          {lastUpdated ? ` · ${lastUpdated}` : ''}
        </span>
      </span>
      <a
        className="eco-btn"
        href="/?vista=sostenibilidad"
        onClick={(event) => {
          if (onNavigate) {
            event.preventDefault()
            onNavigate('sostenibilidad', '/?vista=sostenibilidad')
          }
        }}
      >
        <HojaCo2Icon />
        Reporte de sostenibilidad
      </a>
    </>
  )

  return (
    <AppShell role="logistics" current="dashboard" user={SESSION_USER} title="Dashboard del día" theme={theme} actions={actions} onNavigate={onNavigate}>
      <DashboardHeader
        day={day}
        operatingHours={summary?.operatingHours}
        inProgress={summary?.inProgress}
        lastUpdated={lastUpdated}
        isLoading={isLoading || dashboard.isRefreshing}
      />

      <DistrictFilter districts={dashboard.districts} value={dashboard.districtId} onChange={dashboard.selectDistrict} />
      <span role="status" aria-live="polite" className="eco-sr">
        {dashboard.liveMessage}
      </span>

      {status === 'empty' ? <StatusBanner kind="empty" /> : null}
      {status === 'error' ? <StatusBanner kind="error" onRetry={dashboard.retry} /> : null}
      {status === 'stale' && lastUpdated ? <StatusBanner kind="stale" lastUpdated={lastUpdated} onRetry={dashboard.retry} /> : null}

      <div aria-busy={isLoading} className="eco-hero-row">
        {isLoading ? (
          <span role="status" className="eco-sr">
            Cargando indicadores
          </span>
        ) : null}
        <OrdersHero state={cardState} orders={summary?.orders} compliance={summary?.windowCompliance} onFindOrder={onNavigate ? goto('pedidos', '/?vista=pedidos') : undefined} />
        <Co2Hero
          state={cardState}
          avoided={extra.insights?.co2Avoided ?? null}
          fleetDistanceKm={summary?.fleetDistanceKm}
          co2Kg={summary?.co2Kg}
          unavailable={extra.status === 'unavailable' ? 'Aún no hay cálculo de CO₂ evitado' : undefined}
        />
      </div>

      <div className="eco-columns">
        {renderMap ? (
          <section className="eco-columns__main" aria-labelledby="dash-map-title">
            <div className="eco-section-head">
              <h2 id="dash-map-title">Rutas en vivo</h2>
              <span className="eco-muted eco-toolbar__end">Solo lectura · lo opera el Planificador</span>
            </div>
            {renderMap({ selectedId, onSelect: setSelectedId })}
          </section>
        ) : null}
        <RiskList status={extra.status} insights={extra.insights} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
    </AppShell>
  )
}
