import { useEffect, useRef, useState } from 'react'
import type { DriverOrders } from '../application/driverOrders'
import type { DriverRouteService } from '../application/driverRoute'
import { currentStop, routeProgress, stopNumber } from '../domain/driverRoute'
import type { DriverRoute } from '../domain/driverRoute'
import { formatDecimal } from '../domain/format'
import { formatClock, formatKg, formatWindow, statusLabels } from '../domain/managedOrder'
import { canConfirm } from '../domain/order'
import type { Order } from '../domain/order'
import { Banner, DriverBar, DriverTabBar, EntregaIcon, HojaCo2Icon, IncidenciaIcon, TripStatus } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { tripOf } from './orders/tripState'

type DriverOrderViewProps = {
  service: DriverOrders
  routeService?: DriverRouteService
  orderId: string
  demo: boolean
  onNavigate?: (id: ModuleId, href: string) => void
  onOpenOrder?: (orderId: string) => void
}

// «Pedido actual» del conductor: datos de la entrega y confirmación. Solo móvil, objetivos táctiles de 48 px.
export function DriverOrderView({ service, routeService, orderId, demo, onNavigate, onOpenOrder }: DriverOrderViewProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [route, setRoute] = useState<DriverRoute | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const inFlight = useRef(false)

  useEffect(() => {
    let active = true
    service
      .view(orderId)
      .then(value => {
        if (active) setOrder(value)
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el pedido.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    // La ruta solo enriquece la vista (parada, avance, CO₂); si falla, el pedido sigue siendo utilizable.
    routeService
      ?.route()
      .then(value => {
        if (active) setRoute(value)
      })
      .catch(() => {
        if (active) setRoute(null)
      })
    return () => {
      active = false
    }
  }, [service, routeService, orderId, reload])

  async function confirm() {
    if (inFlight.current) return
    inFlight.current = true
    setSaving(true)
    setError('')
    try {
      setOrder(await service.confirm(orderId))
      dialog.current?.close()
      routeService?.route().then(setRoute, () => undefined)
    } catch (reason) {
      dialog.current?.close()
      setError(reason instanceof Error ? reason.message : 'No se pudo confirmar la entrega.')
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }

  const stop = route && order ? stopNumber(route, order.id) : null
  const next = route ? currentStop(route) : null
  const percent = route ? Math.round(routeProgress(route) * 100) : 0
  const delivered = order?.status === 'ENTREGADO'

  return (
    <div className="eco-root eco-phone-root eco-phone-root--forest">
      <div className="eco-phone eco-phone--forest">
        <DriverBar plate={route?.plate} initials={route?.initials ?? ''}>
          <a
            className="eco-phone__back"
            href="/?vista=mi-ruta"
            onClick={event => {
              if (onNavigate) {
                event.preventDefault()
                onNavigate('mi-ruta', '/?vista=mi-ruta')
              }
            }}
          >
            ← Mi ruta
          </a>
        </DriverBar>

        {route ? (
          <section className="eco-phone__hero" aria-label="Tu impacto hoy">
            <p className="eco-hero__label">
              <HojaCo2Icon />
              CO₂ en tu ruta de hoy
            </p>
            <div className="eco-phone__co2">
              <span className="eco-phone__co2-value">−{route.co2_saved_percent} %</span>
              <span className="eco-phone__co2-note">
                {formatDecimal(route.co2_saved_kg, 0, 1)} kg evitados
                <br />
                frente a la ruta sin optimizar
              </span>
            </div>
            <div className="eco-phone__meta">
              <span className="eco-code eco-phone__count">{route.delivered}/{route.total}</span>
              <div className="eco-hero__meter" role="img" aria-label={`${route.delivered} de ${route.total} entregas`}>
                <div className="eco-hero__meter-fill" style={{ width: `${percent}%` }} />
              </div>
              <span>{route.km_remaining} km restantes</span>
            </div>
          </section>
        ) : null}

        <main className="eco-phone__sheet">
          {demo ? <Banner tone="warning">Modo demostración · datos ficticios. Los cambios se reinician al recargar.</Banner> : null}
          {error ? (
            <Banner
              tone="error"
              title="No se pudo completar la operación."
              action={
                <button
                  className="eco-btn eco-btn--secondary"
                  type="button"
                  onClick={() => {
                    setLoading(true)
                    setError('')
                    setOrder(null)
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
          {loading ? <p role="status" className="eco-muted">Cargando pedido…</p> : null}

          {order && !loading ? (
            <>
              {delivered ? (
                <Banner tone="success" icon={EntregaIcon} title="Entrega confirmada">
                  {order.confirmed_at ? `· ${formatClock(order.confirmed_at)} · hora de Lima` : '· pedido entregado'}
                </Banner>
              ) : null}

              <div className="eco-phone__line">
                <span className="eco-code eco-muted">
                  {order.id}
                  {stop ? ` · parada ${stop}` : ''}
                </span>
                <TripStatus status={tripOf[order.status]} label={statusLabels[order.status]} />
              </div>

              <div>
                <h1 className="eco-phone__h1">{order.customer}</h1>
                <p className="eco-muted eco-phone__address">
                  {order.address}, {order.district}
                </p>
              </div>

              <dl className="eco-props eco-props--phone">
                <dt>Ventana</dt>
                <dd className="eco-code">{formatWindow(order.window_start, order.window_end)}</dd>
                <dt>Peso</dt>
                <dd>{formatKg(order.weight_kg)}</dd>
              </dl>

              <div className="eco-note-block">
                <strong>Indicaciones</strong>
                {order.instructions || 'Sin indicaciones adicionales.'}
              </div>

              <p className="eco-muted eco-flush eco-phone__hint">
                {canConfirm(order) ? 'Confirma únicamente después de entregar el pedido al destinatario.' : 'Este pedido no requiere confirmación en su estado actual.'}
              </p>
            </>
          ) : null}
        </main>

        <div className="eco-phone__footer">
          <button className="eco-btn eco-btn--secondary eco-btn--icon" type="button" aria-label="Reportar incidencia" title="Próximamente" disabled>
            <IncidenciaIcon size="md" />
          </button>
          {delivered ? (
            next && next.order_id !== order?.id ? (
              <a
                className="eco-btn eco-btn--block"
                href={`/?vista=conductor&pedido=${encodeURIComponent(next.order_id)}`}
                onClick={event => {
                  if (onOpenOrder) {
                    event.preventDefault()
                    onOpenOrder(next.order_id)
                  }
                }}
              >
                Siguiente parada →
              </a>
            ) : (
              <a
                className="eco-btn eco-btn--block"
                href="/?vista=mi-ruta"
                onClick={event => {
                  if (onNavigate) {
                    event.preventDefault()
                    onNavigate('mi-ruta', '/?vista=mi-ruta')
                  }
                }}
              >
                Volver a mi ruta
              </a>
            )
          ) : (
            <button className="eco-btn eco-btn--block" type="button" disabled={!order || !canConfirm(order) || saving} onClick={() => dialog.current?.showModal()}>
              {saving ? 'Confirmando…' : 'Confirmar entrega'}
            </button>
          )}
        </div>

        <DriverTabBar current="pedido-actual" onNavigate={onNavigate} />

        <dialog
          ref={dialog}
          className="eco-dialog eco-dialog--sheet"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-description"
          onCancel={event => {
            if (saving) event.preventDefault()
          }}
        >
          <h2 className="eco-dialog__title" id="confirm-title">¿Ya entregaste el pedido?</h2>
          <p className="eco-muted eco-flush" id="confirm-description">Se marcará como entregado y se registrará la hora de confirmación.</p>
          <div className="eco-dialog__stack">
            <button className="eco-btn eco-btn--block" type="button" disabled={saving} onClick={() => void confirm()}>
              {saving ? 'Confirmando…' : 'Sí, confirmar entrega'}
            </button>
            <button className="eco-btn eco-btn--secondary eco-btn--block" type="button" disabled={saving} onClick={() => dialog.current?.close()}>
              Volver
            </button>
          </div>
        </dialog>
      </div>
    </div>
  )
}
