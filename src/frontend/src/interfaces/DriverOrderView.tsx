import { useEffect, useRef, useState } from 'react'
import type { DriverOrders } from '../application/driverOrders'
import { canConfirm } from '../domain/order'
import type { Order } from '../domain/order'

const labels = { PENDIENTE: 'Pendiente', EN_CAMINO: 'En camino', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' }
const date = (value: string) => new Intl.DateTimeFormat('es-PE', {
  timeZone: 'America/Lima', dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

export function DriverOrderView({ service, orderId, demo }: {
  service: DriverOrders; orderId: string; demo: boolean
}) {
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [reload, setReload] = useState(0)
  const dialog = useRef<HTMLDialogElement>(null)
  const inFlight = useRef(false)
  useEffect(() => {
    let active = true
    service.view(orderId).then(value => { if (active) setOrder(value) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el pedido.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [service, orderId, reload])
  async function confirm() {
    if (inFlight.current) return
    inFlight.current = true
    setSaving(true)
    setError('')
    try {
      setOrder(await service.confirm(orderId))
      dialog.current?.close()
    } catch (reason) {
      dialog.current?.close()
      setError(reason instanceof Error ? reason.message : 'No se pudo confirmar la entrega.')
    } finally {
      inFlight.current = false
      setSaving(false)
    }
  }
  return <>
    <header className="topbar"><a href="/">Eco<span>Logística</span></a><span className="role">Conductor</span></header>
    <main>
      <p className="eyebrow">MI JORNADA / DETALLE DEL PEDIDO</p>
      <h1>Una entrega, un paso más.</h1>
      <p className="intro">Consulta los datos del pedido y confirma cuando lo hayas entregado.</p>
      {demo && <p className="demo">Modo demostración · Datos ficticios. Los cambios se reinician al recargar.</p>}
      {error && <div role="alert" className="error">{error} <button onClick={() => {
        setLoading(true)
        setError('')
        setOrder(null)
        setReload(value => value + 1)
      }}>Volver a cargar</button></div>}
      {loading && <p role="status">Cargando pedido…</p>}
      {order && !loading && <article className="order-card">
        <div className="card-head"><div><p className="eyebrow">PEDIDO ASIGNADO</p><h2>{order.id}</h2></div><span className={`status ${order.status}`}>{labels[order.status]}</span></div>
        <section className="destination"><p className="eyebrow">DESTINO DE ENTREGA</p><h3>{order.customer}</h3><p>{order.address}</p><p className="muted">{order.district}</p></section>
        <dl><div><dt>Ventana de entrega · Lima</dt><dd>{date(order.window_start)} — {date(order.window_end)}</dd></div><div><dt>Peso del pedido</dt><dd>{order.weight_kg} kg</dd></div></dl>
        <section className="instructions"><h3>Indicaciones</h3><p>{order.instructions || 'Sin indicaciones adicionales.'}</p></section>
        {order.status === 'ENTREGADO' && <div className="success" role="status"><strong>Entrega confirmada</strong><p>{order.confirmed_at ? date(order.confirmed_at) + ' · Hora de Lima' : 'Pedido entregado.'}</p></div>}
        <footer className="card-footer"><p>{canConfirm(order) ? 'Confirma únicamente después de entregar el pedido al destinatario.' : 'Este pedido no requiere confirmación en su estado actual.'}</p><button className="primary" disabled={!canConfirm(order) || saving} onClick={() => dialog.current?.showModal()}>{saving ? 'Confirmando…' : order.status === 'ENTREGADO' ? 'Entrega registrada' : 'Confirmar entrega'}</button></footer>
      </article>}
      <p className="bottom-note">EcoLogística Lima · Entregas responsables</p>
    </main>
    <dialog ref={dialog} onCancel={event => { if (saving) event.preventDefault() }} aria-labelledby="confirm-title">
      <h2 id="confirm-title">¿Ya entregaste el pedido?</h2><p>Se marcará como entregado y se registrará la hora de confirmación.</p>
      <div className="dialog-actions"><button disabled={saving} onClick={() => dialog.current?.close()}>Volver</button><button className="primary" disabled={saving} onClick={() => void confirm()}>{saving ? 'Confirmando…' : 'Sí, confirmar entrega'}</button></div>
    </dialog>
  </>
}
