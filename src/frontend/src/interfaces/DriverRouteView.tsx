import { useEffect, useState } from 'react'
import type { DriverRouteService } from '../application/driverRoute'
import { currentStop, routeProgress } from '../domain/driverRoute'
import type { DriverRoute, RouteStop } from '../domain/driverRoute'
import type { MapDataSource } from '../domain/ports/mapDataSource'
import { Banner, DriverBar, DriverTabBar, RutaIcon } from '../shared/ui'
import { RouteMap } from './map/RouteMap'
import type { ModuleId } from '../shared/ui'

type DriverRouteViewProps = {
  service: DriverRouteService
  mapSource: MapDataSource
  onNavigate?: (id: ModuleId, href: string) => void
  onOpenOrder?: (orderId: string) => void
}

function stopMeta(stop: RouteStop) {
  if (stop.kind === 'done') return `${stop.order_id} · entregado`
  if (stop.kind === 'now') return `${stop.order_id} · ${stop.address} · ahora`
  if (stop.kind === 'new') return `${stop.order_id} · nueva parada`
  return `${stop.order_id} · ${stop.address}`
}

// «Mi ruta» del conductor: paradas del día, avance y aviso de reoptimización. Solo móvil.
export function DriverRouteView({ service, mapSource, onNavigate, onOpenOrder }: DriverRouteViewProps) {
  const [route, setRoute] = useState<DriverRoute | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(0)
  const [alertOpen, setAlertOpen] = useState(true)

  useEffect(() => {
    let active = true
    service
      .route()
      .then(value => {
        if (active) setRoute(value)
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar tu ruta.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [service, reload])

  const percent = route ? Math.round(routeProgress(route) * 100) : 0

  return (
    <div className="eco-root eco-phone-root">
      <div className="eco-phone">
        <DriverBar plate={route?.plate} initials={route?.initials ?? ''}>
          <span className="eco-phone__title">Mi ruta</span>
        </DriverBar>

        {route ? (
          <div className="eco-phone__progress">
            <span className="eco-code eco-phone__count">{route.delivered}/{route.total}</span>
            <div className="eco-hero__meter" role="img" aria-label={`${route.delivered} de ${route.total} entregas`}>
              <div className="eco-hero__meter-fill" style={{ width: `${percent}%` }} />
            </div>
            <span>
              <strong className="eco-lime">−{route.co2_saved_percent} %</strong> CO₂
            </span>
          </div>
        ) : null}

        <main className="eco-phone__body">
          {loading ? <p role="status" className="eco-muted">Cargando tu ruta…</p> : null}
          {error ? (
            <Banner
              tone="error"
              title="No se pudo cargar tu ruta."
              action={
                <button
                  className="eco-btn eco-btn--secondary"
                  type="button"
                  onClick={() => {
                    setLoading(true)
                    setError('')
                    setReload(value => value + 1)
                  }}
                >
                  Volver a cargar
                </button>
              }
            >
              {error}
            </Banner>
          ) : null}

          {route ? (
            <>
              {route.change && alertOpen ? (
                <Banner
                  tone="warning"
                  icon={RutaIcon}
                  title={`Tu ruta cambió · ${route.change.at}`}
                  action={<button className="eco-btn eco-btn--secondary" type="button" onClick={() => setAlertOpen(false)}>Entendido</button>}
                >
                  {route.change.message}
                </Banner>
              ) : null}

              <RouteMap source={mapSource} selectedId={currentStop(route)?.order_id} compact strip card={false} />

              <ol className="eco-stops" aria-label="Paradas de hoy">
                {route.stops.map((stop, index) => (
                  <li key={stop.order_id} className={`eco-stop${stop.kind === 'next' ? '' : ` eco-stop--${stop.kind}`}`} aria-current={stop.kind === 'now' ? 'step' : undefined}>
                    <span className="eco-stop__dot">{index + 1}</span>
                    {stop.kind === 'now' ? (
                      <a
                        className="eco-stop__title eco-stop__link"
                        href={`/?vista=conductor&pedido=${encodeURIComponent(stop.order_id)}`}
                        onClick={event => {
                          if (onOpenOrder) {
                            event.preventDefault()
                            onOpenOrder(stop.order_id)
                          }
                        }}
                      >
                        {stop.customer} →
                      </a>
                    ) : (
                      <span className="eco-stop__title">{stop.customer}</span>
                    )}
                    <span className="eco-stop__time">{stop.time}</span>
                    <span className="eco-stop__meta">{stopMeta(stop)}</span>
                  </li>
                ))}
                {route.remaining_stops > 0 ? (
                  <li className="eco-stop">
                    <span className="eco-stop__dot">…</span>
                    <span className="eco-stop__title eco-muted">{route.remaining_stops} paradas más</span>
                    <span className="eco-stop__time">{route.return_time}</span>
                    <span className="eco-stop__meta">regreso al {route.depot}</span>
                  </li>
                ) : null}
              </ol>
            </>
          ) : null}
        </main>

        <DriverTabBar current="mi-ruta" onNavigate={onNavigate} />
      </div>
    </div>
  )
}
