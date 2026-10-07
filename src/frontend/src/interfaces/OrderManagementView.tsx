import { useEffect, useMemo, useRef, useState } from 'react'
import type { Management } from '../application/manageOrders'
import { TAB_ORDER, filterOrders, groupByStatus, summarize, tabCounts } from '../application/orderBoard'
import type { StatusTab } from '../application/orderBoard'
import { formatDecimal } from '../domain/format'
import { districts, formatWindow, statusLabels } from '../domain/managedOrder'
import type { ManagedOrder, OrderPermissions } from '../domain/managedOrder'
import { AppShell, Banner, HojaCo2Icon, List, ListGroup, ListRow, MapPlaceholder, PaqueteIcon, Panel, PanelCell, PlusIcon, RutaIcon, SearchInput, TripStatus, VentanaIcon } from '../shared/ui'
import type { ModuleId } from '../shared/ui'
import { OrderForm } from './OrderForm'
import { CancelDialog } from './orders/CancelDialog'
import { OrderDetail } from './orders/OrderDetail'
import { tripOf } from './orders/tripState'

type Screen = 'board' | 'create' | 'edit'
type Layout = 'list' | 'split' | 'map'

const PAGE_SIZE = 100
const MAX_PAGES = 20
const ROW_COLUMNS = '80px minmax(0, 1fr) 92px 74px'
const TAB_LABELS: Record<StatusTab, string> = { ALL: 'Todos', PENDIENTE: 'Pendientes', EN_CAMINO: 'En camino', ENTREGADO: 'Entregados', CANCELADO: 'Cancelados' }
const SESSION_USER = { name: 'Planificación', initials: 'PL' }

async function loadAll(service: Management): Promise<ManagedOrder[]> {
  const orders: ManagedOrder[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const result = await service.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
    orders.push(...result.items)
    if (!result.has_more) break
  }
  return orders
}

const message = (reason: unknown, fallback: string) => (reason instanceof Error ? reason.message : fallback)

export function OrderManagementView({ service, demo, onNavigate }: { service: Management; demo: boolean; onNavigate?: (id: ModuleId, href: string) => void }) {
  const [screen, setScreen] = useState<Screen>('board')
  const [orders, setOrders] = useState<ManagedOrder[]>([])
  const [permissions, setPermissions] = useState<OrderPermissions>({ can_write: false })
  const [selectedId, setSelectedId] = useState('')
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<StatusTab>('ALL')
  const [district, setDistrict] = useState('')
  const [layout, setLayout] = useState<Layout>('split')
  const [closed, setClosed] = useState<Record<string, boolean>>({})
  const [reload, setReload] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [cancelling, setCancelling] = useState<ManagedOrder | null>(null)
  const [cancelError, setCancelError] = useState('')
  const [saving, setSaving] = useState(false)
  const cancelInFlight = useRef(false)
  const detailRequest = useRef(0)
  const heading = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let active = true
    Promise.all([service.permissions(), loadAll(service)])
      .then(([access, items]) => {
        if (!active) return
        setPermissions(access)
        setOrders(items)
        setError('')
      })
      .catch(reason => {
        if (!active) return
        setPermissions({ can_write: false })
        setOrders([])
        setError(message(reason, 'No se pudo cargar el listado.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [service, reload])

  useEffect(() => {
    heading.current?.focus()
  }, [screen])

  useEffect(() => {
    const focusSearch = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (event.key !== '/' || target?.closest('input, textarea, select, [contenteditable]')) return
      event.preventDefault()
      document.getElementById('order-search')?.focus()
    }
    window.addEventListener('keydown', focusSearch)
    return () => window.removeEventListener('keydown', focusSearch)
  }, [])

  const visible = useMemo(() => filterOrders(orders, { query, status: tab, district }), [orders, query, tab, district])
  const counts = useMemo(() => tabCounts(orders, { query, district }), [orders, query, district])
  const groups = useMemo(() => groupByStatus(visible), [visible])
  const summary = useMemo(() => summarize(orders), [orders])
  const selected = orders.find(order => order.id === selectedId) ?? groups[0]?.orders[0] ?? null

  function refresh() {
    setLoading(true)
    setError('')
    setReload(value => value + 1)
  }

  async function reconsult(order: ManagedOrder) {
    const request = ++detailRequest.current
    setError('')
    setBusy(true)
    try {
      const fresh = await service.view(order.id)
      if (request === detailRequest.current) setOrders(current => current.map(item => (item.id === fresh.id ? { ...fresh, tracking: item.tracking } : item)))
    } catch (reason) {
      if (request === detailRequest.current) setError(message(reason, 'No se pudo consultar el pedido.'))
    } finally {
      if (request === detailRequest.current) setBusy(false)
    }
  }

  function saved(order: ManagedOrder) {
    setSelectedId(order.id)
    setScreen('board')
    setNotice('Pedido guardado correctamente.')
    refresh()
  }

  function openCancel(order: ManagedOrder) {
    setCancelError('')
    setCancelling(order)
  }

  async function cancel() {
    if (!cancelling || cancelInFlight.current) return
    cancelInFlight.current = true
    setSaving(true)
    setCancelError('')
    try {
      await service.cancel(cancelling)
      setNotice('Pedido cancelado. Su historial se conserva.')
      setCancelling(null)
      refresh()
    } catch (reason) {
      setCancelError(message(reason, 'No se pudo cancelar el pedido.'))
    } finally {
      cancelInFlight.current = false
      setSaving(false)
    }
  }

  const back = () => {
    ++detailRequest.current
    setScreen('board')
    setNotice('')
    refresh()
  }
  const showList = layout !== 'map'
  const showMap = layout !== 'list'
  const filtered = Boolean(query.trim() || tab !== 'ALL' || district)

  const actions = (
    <>
      {demo ? <span className="eco-tag eco-tag--warning">Modo demo · datos ficticios</span> : null}
      {permissions.can_write && screen === 'board' ? (
        <button className="eco-btn eco-btn--secondary" type="button" disabled={loading} onClick={() => { setNotice(''); setScreen('create') }}>
          <PlusIcon />
          Registrar pedido
        </button>
      ) : null}
      <a className="eco-btn" href="/?vista=rutas" onClick={event => { if (onNavigate) { event.preventDefault(); onNavigate('rutas', '/?vista=rutas') } }}>
        <RutaIcon />
        Generar rutas
      </a>
    </>
  )

  return (
    <AppShell role="planner" current="pedidos" user={SESSION_USER} title="Pedidos y rutas" actions={actions} onNavigate={onNavigate}>
      <div ref={heading} tabIndex={-1} className="eco-focus-target">
        <h1 className="eco-h1">{screen === 'board' ? 'Pedidos y rutas' : screen === 'create' ? 'Registrar pedido' : 'Editar pedido'}</h1>
        <p className="eco-sub">Lima Este · horas de Lima</p>
      </div>
      {demo ? (
        <Banner tone="warning" title="Modo demostración.">
          Vista de operador con datos ficticios. Los cambios se reinician al recargar; no hay sesión ni almacenamiento durable.
        </Banner>
      ) : (
        <Banner>La gestión requiere una sesión verificada y la integración de protección de operaciones.</Banner>
      )}
      {notice ? <Banner tone="success">{notice}</Banner> : null}
      {error ? (
        <Banner
          tone="error"
          title="No se pudo completar la operación."
          action={<button className="eco-btn eco-btn--secondary" type="button" onClick={refresh}>Volver a cargar</button>}
        >
          {error}
        </Banner>
      ) : null}

      {screen === 'board' ? (
        <>
          <Panel label="Resumen de pedidos" minCell={190}>
            <PanelCell
              label={<TripStatus status="pending" label="Pendientes" />}
              value={summary.pending}
              unit="sin conductor"
              note="Entran en la próxima generación de rutas"
            />
            <PanelCell
              label={<TripStatus status="transit" label="En camino" />}
              value={summary.inTransit}
              unit={`en ${summary.routes} ${summary.routes === 1 ? 'ruta' : 'rutas'}`}
              note="Con conductor y vehículo asignados"
            />
            <PanelCell
              label={<TripStatus status="delivered" label="Entregados" />}
              value={summary.delivered}
              unit="hoy"
              note={`${summary.cancelled} ${summary.cancelled === 1 ? 'cancelado' : 'cancelados'}`}
            />
            <PanelCell
              label={<><VentanaIcon />Ventana en riesgo</>}
              value={<span className={summary.atRisk.length ? 'eco-panel__value--danger' : undefined}>{summary.atRisk.length}</span>}
              unit="pedidos en camino"
              note={summary.atRisk.length ? summary.atRisk.join(' · ') : 'Ninguno por ahora'}
            />
            <PanelCell
              label={<><HojaCo2Icon />Huella por pedido</>}
              value={summary.averageCo2Kg === null ? '—' : formatDecimal(summary.averageCo2Kg, 2)}
              unit="kg CO₂"
              note={summary.averageCo2Kg === null ? 'Sin datos de ruta' : 'Promedio de los pedidos no cancelados'}
              eco
            />
          </Panel>

          <section className="eco-stack" aria-label="Buscar pedidos">
            <SearchInput
              label="Buscar pedidos"
              value={query}
              onChange={setQuery}
              placeholder="Buscar por pedido, cliente, distrito o placa · ej. «Santa Anita» o «ABC-123»"
              shortcut="/"
              id="order-search"
            />
            <div className="eco-toolbar">
              <div className="eco-tabs" role="tablist" aria-label="Filtrar por estado">
                {TAB_ORDER.map(value => (
                  <button key={value} className="eco-tab" type="button" role="tab" aria-selected={tab === value} onClick={() => setTab(value)}>
                    {TAB_LABELS[value]} <span className="eco-code">{counts[value]}</span>
                  </button>
                ))}
              </div>
              <div className="eco-field eco-field--inline">
                <label htmlFor="filter-district">Distrito</label>
                <select className="eco-select" id="filter-district" value={district} onChange={event => setDistrict(event.target.value)}>
                  <option value="">Todos los distritos</option>
                  {districts.map(value => <option key={value}>{value}</option>)}
                </select>
              </div>
              <span className="eco-search__meta eco-toolbar__end">
                <strong>{visible.length}</strong> de {orders.length} pedidos
              </span>
              <div className="eco-seg-ctrl" role="group" aria-label="Vista">
                <button type="button" aria-pressed={layout === 'list'} onClick={() => setLayout('list')}>Lista</button>
                <button type="button" aria-pressed={layout === 'split'} onClick={() => setLayout('split')}>Lista + mapa</button>
                <button type="button" aria-pressed={layout === 'map'} onClick={() => setLayout('map')}>Mapa</button>
              </div>
            </div>
          </section>

          {loading ? <p role="status" className="eco-muted">Cargando pedidos…</p> : null}

          {!loading && !error ? (
            <div className="eco-board">
              {showList ? (
                <section className="eco-board__list" aria-label="Lista de pedidos">
                  {visible.length === 0 ? (
                    <Banner
                      icon={PaqueteIcon}
                      title={filtered ? 'Sin resultados.' : 'No hay pedidos registrados.'}
                      action={filtered ? <button className="eco-btn eco-btn--secondary" type="button" onClick={() => { setQuery(''); setTab('ALL'); setDistrict('') }}>Limpiar filtros</button> : undefined}
                    >
                      {filtered ? 'Prueba con un distrito, una placa o un número de pedido.' : 'Los pedidos nuevos aparecerán aquí.'}
                    </Banner>
                  ) : null}
                  <div className="eco-list-scroll">
                    <List label="Pedidos por estado">
                      {groups.map(group => (
                        <ListGroup
                          key={group.status}
                          heading={<TripStatus status={tripOf[group.status]} label={statusLabels[group.status]} />}
                          count={group.orders.length}
                          expanded={!closed[group.status]}
                          onToggle={() => setClosed(current => ({ ...current, [group.status]: !current[group.status] }))}
                        >
                          {group.orders.map(order => (
                            <ListRow key={order.id} columns={ROW_COLUMNS} twoLines selected={order.id === selected?.id} onSelect={() => setSelectedId(order.id)}>
                              <span className="eco-code">{order.id}</span>
                              <span className="eco-row__cell">
                                <span className="eco-row__title">{order.customer}</span>
                                <span className="eco-row__sub">
                                  {order.district}
                                  {order.tracking?.note ? ` · ${order.tracking.note}` : ''}
                                </span>
                              </span>
                              <span className="eco-code">{formatWindow(order.window_start, order.window_end)}</span>
                              <span className="eco-code eco-muted">{order.tracking?.plate ?? '—'}</span>
                            </ListRow>
                          ))}
                        </ListGroup>
                      ))}
                    </List>
                  </div>
                </section>
              ) : null}

              <section className="eco-board__side" aria-label="Mapa y detalle">
                {showMap ? <MapPlaceholder /> : null}
                {selected ? (
                  <OrderDetail
                    order={selected}
                    canWrite={permissions.can_write}
                    busy={busy}
                    onEdit={() => { setNotice(''); setSelectedId(selected.id); setScreen('edit') }}
                    onCancel={() => openCancel(selected)}
                    onFollow={() => setLayout(current => (current === 'list' ? 'split' : current))}
                    onRefresh={() => void reconsult(selected)}
                  />
                ) : null}
              </section>
            </div>
          ) : null}
        </>
      ) : null}

      {(screen === 'create' || screen === 'edit') && permissions.can_write ? (
        <OrderForm key={screen === 'edit' ? selected?.id : 'new'} service={service} order={screen === 'edit' ? selected ?? undefined : undefined} onSaved={saved} onBack={back} />
      ) : null}

      <CancelDialog order={cancelling} saving={saving} error={cancelError} onConfirm={() => void cancel()} onClose={() => setCancelling(null)} />
    </AppShell>
  )
}
