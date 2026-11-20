import { useState } from 'react'
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
import { OperationalMetrics } from './OperationalMetrics'
import { ProjectIndicators } from './ProjectIndicators'

const todayIso = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
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

export function DashboardPage({ gateway, insights, renderMap, onNavigate, refreshMs }: Props) {
  const theme = 'light'
  const dashboard = useDashboard(gateway, { refreshMs })
  const [refreshKey, setRefreshKey] = useState(0)
  const extra = useDashboardInsights(insights, dashboard.districtId, { refreshMs, refreshKey })
  const [selectedId, setSelectedId] = useState<string | undefined>()
  const { status, summary, lastUpdatedAt } = dashboard

  const isLoading = status === 'loading'
  const cardState: CardState = isLoading ? 'loading' : status === 'error' ? 'error' : 'data'
  const lastUpdated = lastUpdatedAt ? formatTime(lastUpdatedAt) : null
  const day = summary?.day ?? todayIso()
  const goto = (id: ModuleId, href: string) => () => onNavigate?.(id, href)

  const actions = (
    <>
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
      <div className="eco-dashboard">
      <DashboardHeader
        day={day}
        operatingHours={summary?.operatingHours}
        inProgress={summary?.inProgress}
        lastUpdated={lastUpdated}
        isLoading={isLoading || dashboard.isRefreshing}
        refreshSeconds={Math.round((refreshMs ?? 60_000) / 1000)}
      />

      <section className="eco-dash-intro" aria-label="Resumen de la jornada">
        <div className="eco-dash-intro__copy">
          <p className="eco-dash-eyebrow">Operación e impacto</p>
          <h2>Más entregas a tiempo.<br />Menos impacto en cada ruta.</h2>
          <p>El avance de tu jornada y la eficiencia de tus rutas, en un solo lugar.</p>
        </div>
        <div className="eco-dash-toolbar">
          <DistrictFilter districts={dashboard.districts} value={dashboard.districtId} onChange={id => { setSelectedId(undefined); dashboard.selectDistrict(id) }} />
          <button className="eco-btn eco-btn--secondary" type="button" disabled={isLoading || dashboard.isRefreshing} onClick={() => { dashboard.retry(); setRefreshKey(key => key + 1) }}>Actualizar</button>
        </div>
      </section>
      <span role="status" aria-live="polite" className="eco-sr">
        {dashboard.liveMessage}
      </span>

      {status === 'empty' ? <StatusBanner kind="empty" /> : null}
      {status === 'error' ? <StatusBanner kind="error" onRetry={dashboard.retry} /> : null}
      {status === 'stale' && lastUpdated ? <StatusBanner kind="stale" lastUpdated={lastUpdated} onRetry={dashboard.retry} /> : null}

      <OperationalMetrics summary={summary} insights={extra.insights} state={cardState} />

      <div className="eco-dash-section-intro"><h2>Balance de la jornada</h2><p>Entregas, recursos y emisiones estimadas</p></div>
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
            {dashboard.districtId ? <p className="eco-muted">El mapa mantiene la vista general; los indicadores y pedidos en riesgo corresponden al distrito seleccionado.</p> : null}
            {renderMap({ selectedId, onSelect: setSelectedId })}
          </section>
        ) : null}
        <RiskList status={extra.status} insights={extra.insights} selectedId={selectedId} onSelect={setSelectedId} />
      </div>
      <ProjectIndicators summary={summary} insights={extra.insights} />
      </div>
    </AppShell>
  )
}
