import { useState } from 'react'
import { requestJson } from '../../infrastructure/httpClient'

type RouteChoice = { id: string; driver: string; plate: string }

export function AddToRoute({ orderId, onAssigned }: { orderId: string; onAssigned: () => void }) {
  const [routes, setRoutes] = useState<RouteChoice[] | null>(null)
  const [selected, setSelected] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setBusy(true)
    setError('')
    try {
      setRoutes(await requestJson<RouteChoice[]>('/api/routes/assignment-options'))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron consultar las rutas.')
    } finally {
      setBusy(false)
    }
  }

  async function assign() {
    if (!selected || busy) return
    setBusy(true)
    setError('')
    try {
      await requestJson(`/api/routes/${encodeURIComponent(selected)}/orders`, {
        method: 'POST', body: { order_id: orderId },
      })
      onAssigned()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo agregar el pedido.')
    } finally {
      setBusy(false)
    }
  }

  return <div className="eco-stack">
    {routes === null ? (
      <button className="eco-btn eco-btn--secondary" type="button" disabled={busy} onClick={() => void load()}>
        {busy ? 'Buscando rutas…' : 'Agregar a ruta existente'}
      </button>
    ) : routes.length === 0 ? (
      <p role="status">Todavía no hay rutas activas para hoy.</p>
    ) : <>
      <label className="eco-field">Conductor y vehículo
        <select className="eco-select" value={selected} onChange={event => setSelected(event.target.value)} disabled={busy}>
          <option value="">Selecciona una ruta</option>
          {routes.map(route => <option key={route.id} value={route.id}>{route.driver} · {route.plate}</option>)}
        </select>
      </label>
      <button className="eco-btn" type="button" disabled={!selected || busy} onClick={() => void assign()}>
        {busy ? 'Guardando…' : 'Agregar pedido'}
      </button>
    </>}
    {routes !== null ? <button className="eco-btn eco-btn--ghost" type="button" disabled={busy}
      onClick={() => { setRoutes(null); setSelected(''); setError('') }}>Cerrar selector</button> : null}
    {error ? <p role="alert">{error}</p> : null}
  </div>
}
