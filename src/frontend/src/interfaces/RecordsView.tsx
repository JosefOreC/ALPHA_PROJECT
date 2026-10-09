import { useEffect, useState } from 'react'
import { AppShell, Banner } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { useSession } from './session/SessionState'
import { requestJson } from '../infrastructure/httpClient'
import type { DriverRoute } from '../domain/driverRoute'

const labels: Record<string, string> = { fecha: 'Fecha', usuario: 'Usuario', accion: 'Acción', entidad: 'Entidad', detalle: 'Detalle', cliente: 'Cliente', conductor: 'Conductor', tipo: 'Tipo', descripcion: 'Descripción', estado: 'Estado' }
function cell(value: unknown) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Intl.DateTimeFormat('es-PE', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Lima' }).format(new Date(value))
  return value == null ? '—' : typeof value === 'object' ? JSON.stringify(value) : String(value)
}

export function RecordsView({ module, onNavigate }: { module: 'auditoria' | 'incidencias'; onNavigate?: (id: ModuleId, href: string) => void }) {
  const user = useSession()!.user!
  const title = module === 'auditoria' ? 'Auditoría' : 'Incidencias'
  const [items, setItems] = useState<Record<string, unknown>[] | null>(null)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)
  const [route, setRoute] = useState<DriverRoute | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [orderId, setOrderId] = useState('')
  const [type, setType] = useState('Entrega')
  const [description, setDescription] = useState('')
  useEffect(() => {
    const controller = new AbortController()
    const path = module === 'auditoria' ? '/api/audit' : '/api/incidents'
    requestJson<Record<string, unknown>[]>(path, { signal: controller.signal })
      .then(value => { if (!controller.signal.aborted) { setItems(value); setError('') } }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'No se pudo cargar el listado.') })
    if (user.role === 'driver' && module === 'incidencias') requestJson<DriverRoute>('/api/conductor/ruta', { signal: controller.signal }).then(setRoute).catch(() => undefined)
    return () => controller.abort()
  }, [module, reload, user.role])
  const columns = items?.length ? Object.keys(items[0]).filter(key => key !== 'id') : []
  return <AppShell role={user.role} current={module} user={{ name: user.name, initials: user.name[0] }} title={title} onNavigate={onNavigate} actions={<button className="eco-btn eco-btn--secondary" type="button" onClick={() => setReload(value => value + 1)}>Actualizar</button>}>
    <div><h1 className="eco-h1">{title}</h1><p className="eco-sub">{module === 'auditoria' ? 'Historial de acciones y cambios en la plataforma' : 'Seguimiento de los eventos reportados durante las entregas'}</p></div>
    {user.role === 'driver' && module === 'incidencias' ? <form className="eco-record-form eco-stack" onSubmit={async event => {
      event.preventDefault(); if (busy) return; setBusy(true); setError(''); setNotice('')
      try { await requestJson('/api/incidents', { method: 'POST', body: { order_id: orderId, type, description } }); setDescription(''); setNotice('Incidencia reportada.'); setReload(value => value + 1) }
      catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo reportar la incidencia.') }
      finally { setBusy(false) }
    }}>
      <h2 className="eco-h2">Reportar incidencia</h2>
      <div className="eco-field"><label htmlFor="incident-order">Pedido</label><select id="incident-order" className="eco-select" required value={orderId} onChange={event => setOrderId(event.target.value)} disabled={busy}><option value="">Selecciona un pedido de tu ruta</option>{route?.stops.map(stop => <option key={stop.order_id} value={stop.order_id}>{stop.customer}</option>)}</select></div>
      <div className="eco-field"><label htmlFor="incident-type">Tipo</label><select id="incident-type" className="eco-select" value={type} onChange={event => setType(event.target.value)} disabled={busy}>{['Entrega', 'Tráfico', 'Vehículo', 'Dirección', 'Otro'].map(value => <option key={value}>{value}</option>)}</select></div>
      <div className="eco-field"><label htmlFor="incident-description">Descripción</label><textarea id="incident-description" className="eco-input" required minLength={5} maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} disabled={busy} /></div>
      <button className="eco-btn" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Reportar incidencia'}</button>
    </form> : null}
    {notice ? <p role="status" className="eco-notice">{notice}</p> : null}
    {error ? <Banner tone="error">{error}</Banner> : !items ? <p role="status">Cargando registros…</p> : !items.length ? <Banner title="Sin registros">Todavía no hay registros en esta sección.</Banner> : <div className="eco-data-scroll"><table className="eco-data-table"><caption className="eco-sr">{title} · últimos 200 registros</caption><thead><tr>{columns.map(key => <th key={key} scope="col">{labels[key] ?? key}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={String(item.id ?? index)}>{columns.map(key => <td key={key}>{cell(item[key])}</td>)}</tr>)}</tbody></table></div>}
  </AppShell>
}
