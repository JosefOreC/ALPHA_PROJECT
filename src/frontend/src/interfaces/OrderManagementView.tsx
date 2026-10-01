import { useEffect, useRef, useState } from 'react'
import type { Management } from '../application/manageOrders'
import { canEdit, districts, formatLima, statusLabels } from '../domain/managedOrder'
import type { ManagedOrder, OrderPage, OrderPermissions } from '../domain/managedOrder'
import type { OrderStatus } from '../domain/order'
import { OrderForm } from './OrderForm'
import './orderManagement.css'

export function OrderManagementView({ service, demo }: { service: Management; demo: boolean }) {
  const [screen, setScreen] = useState<'list' | 'detail' | 'create' | 'edit'>('list')
  const [page, setPage] = useState<OrderPage | null>(null)
  const [permissions, setPermissions] = useState<OrderPermissions>({ can_write: false })
  const [selected, setSelected] = useState<ManagedOrder | null>(null)
  const [status, setStatus] = useState<OrderStatus | ''>('')
  const [district, setDistrict] = useState('')
  const [offset, setOffset] = useState(0)
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelling, setCancelling] = useState<ManagedOrder | null>(null)
  const [cancelError, setCancelError] = useState('')
  const [saving, setSaving] = useState(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const cancelInFlight = useRef(false)
  const detailRequest = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    let active = true
    Promise.all([service.permissions(), service.list({ limit: 20, offset, ...(status ? { status } : {}), ...(district ? { district } : {}) })])
      .then(([access, value]) => { if (active) { setPermissions(access); setPage(value) } })
      .catch(reason => { if (active) { setPermissions({ can_write: false }); setError(reason instanceof Error ? reason.message : 'No se pudo cargar el listado.') } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [service, status, district, offset, reload])
  useEffect(() => { heading.current?.focus() }, [screen])
  function refresh() {
    setLoading(true); setError(''); setPage(null); setReload(value => value + 1)
  }
  async function show(id: string) {
    const request = ++detailRequest.current
    setError(''); setLoading(true)
    try { const order = await service.view(id); if (request === detailRequest.current) { setSelected(order); setScreen('detail') } }
    catch (reason) { if (request === detailRequest.current) setError(reason instanceof Error ? reason.message : 'No se pudo consultar el pedido.') }
    finally { if (request === detailRequest.current) setLoading(false) }
  }
  function saved(order: ManagedOrder) {
    setSelected(order); setScreen('detail'); setNotice('Pedido guardado correctamente.'); refresh()
  }
  function openCancel(order: ManagedOrder) {
    setCancelling(order); setCancelError(''); dialog.current?.showModal()
  }
  async function cancel() {
    if (!cancelling || cancelInFlight.current) return
    cancelInFlight.current = true; setSaving(true); setCancelError('')
    try {
      const order = await service.cancel(cancelling)
      if (selected?.id === order.id) setSelected(order)
      setNotice('Pedido cancelado. Su historial se conserva.'); refresh()
      dialog.current?.close()
    } catch (reason) { setCancelError(reason instanceof Error ? reason.message : 'No se pudo cancelar el pedido.') }
    finally { cancelInFlight.current = false; setSaving(false) }
  }
  const back = () => { ++detailRequest.current; setScreen('list'); setNotice(''); refresh() }
  return <div className="management">
    <header className="management-header"><a href="/?vista=pedidos">Eco<span>Logística</span></a><nav aria-label="Navegación de pedidos"><a href="/">Vista del conductor</a><span>Gestión de pedidos</span></nav></header>
    <main className="management-main">
      <p className="management-eyebrow">OPERACIÓN / PEDIDOS DE ENTREGA</p>
      <h1 ref={heading} tabIndex={-1}>Cada pedido, bien organizado.</h1>
      <p>Registra entregas, consulta su avance y mantén sus datos al día.</p>
      {demo && <p className="message demo-message" role="status">Modo demostración · Vista de operador con datos ficticios. Los cambios se reinician al recargar; no hay sesión ni almacenamiento durable.</p>}
      {!demo && <p className="integration-note">La gestión requiere una sesión verificada y la integración de protección de operaciones.</p>}
      {notice && <p role="status" className="message success-message">{notice}</p>}
      {error && <div role="alert" className="message error-message">{error}<div className="actions"><button onClick={() => selected && screen === 'detail' ? void show(selected.id) : refresh()}>Volver a cargar</button></div></div>}
      {screen === 'list' && <>
        <div className="section-header"><h2>Pedidos registrados</h2>{permissions.can_write && <button className="action-primary" disabled={loading} onClick={() => { setNotice(''); setScreen('create') }}>Registrar pedido</button>}</div>
        <div className="filters">
          <div><label htmlFor="filter-status">Estado</label><select id="filter-status" value={status} onChange={event => { setStatus(event.target.value as OrderStatus | ''); setOffset(0); refresh() }}><option value="">Todos los estados</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
          <div><label htmlFor="filter-district">Distrito</label><select id="filter-district" value={district} onChange={event => { setDistrict(event.target.value); setOffset(0); refresh() }}><option value="">Todos los distritos</option>{districts.map(value => <option key={value}>{value}</option>)}</select></div>
        </div>
        {loading && <p role="status">Cargando pedidos…</p>}
        {!loading && page && page.items.length === 0 && <div className="empty-state"><h3>{status || district ? 'Sin coincidencias' : 'No hay pedidos registrados'}</h3><p>{status || district ? 'Prueba con otros filtros.' : 'Los pedidos nuevos aparecerán aquí.'}</p>{(status || district) && <button onClick={() => { setStatus(''); setDistrict(''); setOffset(0); refresh() }}>Limpiar filtros</button>}{offset > 0 && <button onClick={() => { setOffset(0); refresh() }}>Volver a la primera página</button>}</div>}
        {!loading && page && page.items.length > 0 && <>
          <div className="table-container" tabIndex={0} role="region" aria-label="Listado de pedidos, desplázate horizontalmente en pantallas pequeñas">
            <table><caption>Ventanas de entrega expresadas en hora de Lima</caption><thead><tr><th scope="col">Referencia / Destinatario</th><th scope="col">Distrito</th><th scope="col">Ventana de entrega</th><th scope="col">Peso</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
              <tbody>{page.items.map(order => <tr key={order.id}><td><strong className="order-reference">{order.id}</strong><span>{order.customer}</span></td><td>{order.district}</td><td>{formatLima(order.window_start)}<br />{formatLima(order.window_end)}</td><td>{order.weight_kg} kg</td><td><span className={`order-status state-${order.status}`}>{statusLabels[order.status]}</span></td><td><div className="row-actions"><button aria-label={`Ver pedido ${order.id}`} onClick={() => void show(order.id)}>Ver detalle</button>{permissions.can_write && canEdit(order) && <button aria-label={`Cancelar pedido ${order.id}`} onClick={() => openCancel(order)}>Cancelar</button>}</div></td></tr>)}</tbody>
            </table>
          </div>
          <div className="pagination"><button disabled={offset === 0} onClick={() => { setOffset(value => Math.max(0, value - 20)); refresh() }}>Anterior</button><span>Mostrando {offset + 1}–{offset + page.items.length}</span><button disabled={!page.has_more || offset >= 99980} onClick={() => { setOffset(value => value + 20); refresh() }}>Siguiente</button></div>
        </>}
      </>}
      {screen === 'detail' && selected && <article className="detail-card">
        <div className="section-header"><div><h2>Detalle del pedido</h2><p className="order-reference">{selected.id}</p></div><span className={`order-status state-${selected.status}`}>{statusLabels[selected.status]}</span></div>
        <dl><div><dt>Destinatario</dt><dd>{selected.customer}</dd></div><div><dt>Dirección</dt><dd>{selected.address}</dd></div><div><dt>Distrito</dt><dd>{selected.district}</dd></div><div><dt>Peso</dt><dd>{selected.weight_kg} kg</dd></div><div><dt>Inicio · Lima</dt><dd>{formatLima(selected.window_start)}</dd></div><div><dt>Fin · Lima</dt><dd>{formatLima(selected.window_end)}</dd></div><div><dt>Asignación</dt><dd>{selected.assigned ? 'Conductor asignado' : 'Sin conductor'}</dd></div><div><dt>Confirmación de entrega · Lima</dt><dd>{selected.confirmed_at ? formatLima(selected.confirmed_at) : 'Sin confirmación'}</dd></div><div className="wide"><dt>Indicaciones</dt><dd>{selected.instructions || 'Sin indicaciones adicionales.'}</dd></div></dl>
        <div className="actions"><button onClick={back}>Volver al listado</button><button disabled={loading} onClick={() => void show(selected.id)}>Consultar versión actual</button>{permissions.can_write && canEdit(selected) && <><button className="action-primary" onClick={() => { setNotice(''); setScreen('edit') }}>Editar pedido</button><button onClick={() => openCancel(selected)}>Cancelar pedido</button></>}</div>
        {!canEdit(selected) && <p className="form-note">La edición y cancelación solo están disponibles para pedidos pendientes y sin conductor.</p>}
      </article>}
      {(screen === 'create' || screen === 'edit') && permissions.can_write && <OrderForm key={screen === 'edit' ? selected?.id : 'new'} service={service} order={screen === 'edit' ? selected ?? undefined : undefined} onSaved={saved} onBack={back} />}
      <p className="management-footer">EcoLogística Lima · Entregas responsables</p>
    </main>
    <dialog ref={dialog} className="management-dialog" aria-labelledby="cancel-title" aria-describedby="cancel-description" onCancel={event => { if (saving) event.preventDefault() }} onClose={() => { setCancelling(null); heading.current?.focus() }}>
      <h2 id="cancel-title">¿Cancelar este pedido?</h2><p id="cancel-description">{cancelling?.id} se marcará como cancelado. Su historial se conservará. La operación se rechazará si el pedido cambió.</p>
      {cancelError && <p role="alert" className="message error-message">{cancelError}</p>}
      <div className="actions"><button autoFocus disabled={saving} onClick={() => dialog.current?.close()}>Volver</button><button disabled={saving} className="action-danger" onClick={() => void cancel()}>{saving ? 'Cancelando…' : 'Sí, cancelar pedido'}</button></div>
    </dialog>
  </div>
}
