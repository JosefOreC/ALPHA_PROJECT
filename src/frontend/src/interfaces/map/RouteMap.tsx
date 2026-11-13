import type { Map as LeafletMap } from 'leaflet'
import { Suspense, lazy, useEffect, useId, useMemo, useState } from 'react'
import type { MapData, MapSelection } from '../../domain/mapData'
import { filterMapOrders, MAP_PROFILES, prepareMap, selectionVisible } from '../../domain/mapPresentation'
import type { MapLayers, MapOrderStatus, MapProfile } from '../../domain/mapPresentation'
import type { MapDataSource } from '../../domain/ports/mapDataSource'
import { statusLabels } from '../../domain/managedOrder'
import { Banner, CamionetaIcon, EntregaIcon, MinusIcon, PaqueteIcon, PlusIcon, RecenterIcon, RutaIcon, SlidersIcon } from '../../shared/ui'
import { MapFilters } from './MapFilters'

const LeafletCanvas = lazy(() => import('./LeafletCanvas'))
type Props = {
  source: MapDataSource
  selectedId?: string
  query?: string
  onQueryChange?: (query: string) => void
  orderStatus?: MapOrderStatus
  orderStatuses?: MapOrderStatus[]
  onOrderStatusChange?: (status: MapOrderStatus) => void
  district?: string
  onClearFilters?: () => void
  showFilters?: boolean
  onSelect?: (id: string) => void
  onSelectElement?: (selection: MapSelection) => void
  profile?: MapProfile
  scopePlate?: string
  initialLayers?: Partial<MapLayers>
  showLayerControls?: boolean
  compact?: boolean
  card?: boolean
  strip?: boolean
}
const LABELS: Record<keyof MapLayers, string> = { routes: 'Rutas', pins: 'Pedidos', vehicles: 'Camiones', depot: 'Almacén' }
const LAYER_ICONS = { routes: RutaIcon, pins: EntregaIcon, vehicles: CamionetaIcon, depot: PaqueteIcon }
const sourceKeys = new WeakMap<MapDataSource, number>()
let sourceSequence = 0

export function RouteMap(props: Props) {
  if (!sourceKeys.has(props.source)) sourceKeys.set(props.source, ++sourceSequence)
  return <MapInstance key={sourceKeys.get(props.source) + ':' + (props.profile ?? 'operations') + ':' + (props.scopePlate ?? '')} {...props} />
}

function MapInstance({ source, selectedId, query = '', onQueryChange, orderStatus, orderStatuses, onOrderStatusChange, district = '', onClearFilters,
  onSelect, onSelectElement, profile = 'operations', scopePlate,
  initialLayers, showLayerControls = true, showFilters = showLayerControls, compact = false, card = true, strip = false }: Props) {
  const allowed = MAP_PROFILES[profile]
  const layersPanelId = useId()
  const [layersOpen, setLayersOpen] = useState(false)
  const [layers, setLayers] = useState<MapLayers>(() => Object.fromEntries(Object.entries(allowed).map(([key, value]) =>
    [key, value && (initialLayers?.[key as keyof MapLayers] ?? true)])) as MapLayers)
  const [data, setData] = useState<MapData | null>(null)
  const [error, setError] = useState('')
  const [basemapError, setBasemapError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [localSelection, setLocalSelection] = useState<{ value: MapSelection; externalId?: string } | null>(null)
  const [dismissedOrder, setDismissedOrder] = useState<string | undefined>()
  const [mapQuery, setMapQuery] = useState('')
  const [mapStatus, setMapStatus] = useState<MapOrderStatus>('ALL')
  const [orderFilter, setOrderFilter] = useState('')
  const search = onQueryChange ? query : mapQuery
  const status = orderStatus ?? mapStatus
  const filterScope = JSON.stringify([status, query, search, district])
  const [previousFilters, setPreviousFilters] = useState(filterScope)
  if (previousFilters !== filterScope) {
    setPreviousFilters(filterScope)
    setOrderFilter('')
  }

  const [previousSelectedId, setPreviousSelectedId] = useState(selectedId)
  if (previousSelectedId !== selectedId) {
    setPreviousSelectedId(selectedId)
    setDismissedOrder(undefined)
  }

  useEffect(() => {
    let active = true
    Promise.resolve().then(() => source.load()).then(value => { if (active) setData(value) })
      .catch(reason => { if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los datos del mapa.') })
    return () => { active = false }
  }, [source, attempt])

  const prepared = useMemo(() => data ? prepareMap(data, profile === 'driver' ? (scopePlate ?? '') : scopePlate) : null, [data, profile, scopePlate])
  const options = useMemo(() => prepared ? filterMapOrders(prepared.data, { status, queries: [query, search], district }) : null,
    [prepared, status, query, search, district])
  // Si otro filtro excluye el pedido elegido, vuelve al conjunto que sí coincide.
  const activeOrderFilter = options?.orders.some(order => order.id === orderFilter) ? orderFilter : ''
  const context = useMemo(() => options ? filterMapOrders(options, { orderId: activeOrderFilter }) : null, [options, activeOrderFilter])
  const otherStops = useMemo(() => {
    if (!prepared || !context) return []
    const routeIds = new Set(context.routes.map(route => route.id))
    const visibleIds = new Set(context.orders.map(order => order.id))
    return prepared.data.orders.filter(order => order.route_id !== null && routeIds.has(order.route_id) && !visibleIds.has(order.id))
  }, [prepared, context])
  const filtered = status !== 'ALL' || !!query.trim() || !!search.trim() || !!activeOrderFilter || !!district
  const clearFilters = () => {
    setMapQuery(''); setMapStatus('ALL'); setOrderFilter('')
    onQueryChange?.(''); onOrderStatusChange?.('ALL'); onClearFilters?.()
  }
  const candidate = (localSelection?.externalId === selectedId ? localSelection?.value : null) ?? (selectedId && selectedId !== dismissedOrder ? { kind: 'order' as const, id: selectedId } : null)
  const selection = context && selectionVisible(candidate, context, layers) ? candidate : null
  const focusedId = selection?.kind === 'route' ? selection.id : selection?.kind === 'order'
    ? context?.orders.find(item => item.id === selection.id)?.route_id
    : selection?.kind === 'vehicle' ? context?.vehicles?.find(item => item.id === selection.id)?.route_id : null
  const focusedRoute = context?.routes.find(item => item.id === focusedId)
  const select = (value: MapSelection) => {
    setLocalSelection({ value, externalId: value.kind === 'order' && onSelect ? value.id : selectedId }); setDismissedOrder(undefined)
    if (value.kind === 'order') onSelect?.(value.id)
    onSelectElement?.(value)
  }
  const dismiss = () => {
    setLocalSelection(null)
    setDismissedOrder(selectedId)
    setLayersOpen(false)
    map?.getContainer().focus({ preventScroll: true })
  }
  const toggle = (key: keyof MapLayers) => {
    const next = { ...layers, [key]: !layers[key] }
    if (context && candidate && !selectionVisible(candidate, context, next)) {
      setLocalSelection(null)
      if (candidate.kind === 'order') setDismissedOrder(candidate.id)
    }
    setLayers(next)
  }
  const fail = !!error
  const retry = () => {
    setData(null); setError(''); setBasemapError(''); setMap(null)
    setLocalSelection(null); setDismissedOrder(undefined)
    setAttempt(value => value + 1)
  }
  const count = context ? (layers.routes ? context.routes.length : 0) + (layers.pins ? context.orders.length : 0) + (layers.vehicles ? context.vehicles.length : 0) : 0

  return <div className="eco-stack eco-map-workspace">
    {showFilters && (allowed.pins || allowed.routes) && (!error || prepared) ? <MapFilters query={search} status={status} orderId={activeOrderFilter} statuses={orderStatuses}
      orders={options?.orders ?? []} visibleOrders={context?.orders.length ?? 0} totalOrders={prepared?.data.orders.length ?? 0}
      visibleRoutes={context?.routes.length ?? 0} loading={!prepared} filtered={filtered}
      onQuery={value => { setOrderFilter(''); if (onQueryChange) onQueryChange(value); else setMapQuery(value) }}
      onStatus={value => { setOrderFilter(''); if (onOrderStatusChange) onOrderStatusChange(value); else setMapStatus(value) }}
      onOrder={value => { setOrderFilter(value); if (value) select({ kind: 'order', id: value }) }} onClear={clearFilters} /> : null}
    {prepared?.omitted ? <p className="eco-muted" role="status">{prepared.omitted} elementos omitidos por coordenadas o geometrías fuera del área de Lima.</p> : null}
    {!compact && context && layers.routes && context.routes.length ? <div className="eco-map-routes">
      <div className="eco-map-routes__heading"><strong>Rutas por vehículo</strong><span>El color une el recorrido y sus paradas · los números indican el orden de entrega</span></div>
      {context.orders.some(item => item.route_id === null) ? <p className="eco-map-routes__unassigned">{context.orders.filter(item => item.route_id === null).length} pedidos sin ruta · puntos grises</p> : null}
      <div className="eco-map-routes__choices" role="group" aria-label="Rutas por vehículo">
        <button type="button" className="eco-map-route-choice" aria-label="Todas las rutas" aria-pressed={!focusedRoute} onClick={() => {
          dismiss()
          if (map) void import('./viewport').then(({ fitVisible }) => fitVisible(map, context, layers))
        }}><RutaIcon /><strong>Todas las rutas</strong><span>{context.routes.length} vehículos</span></button>
        {context.routes.map(item => <button key={item.id} type="button" className="eco-map-route-choice" aria-label={'Ruta ' + item.plate}
          aria-pressed={focusedRoute?.id === item.id} onClick={() => {
            select({ kind: 'route', id: item.id })
            if (map) void import('./viewport').then(({ fitVisible }) => fitVisible(map, {
              ...context, routes: [item], orders: context.orders.filter(order => order.route_id === item.id),
              vehicles: context.vehicles?.filter(vehicle => vehicle.route_id === item.id),
            }, layers))
          }}>
          <i className="eco-map-route-choice__line" style={{ backgroundColor: `var(--map-route-${item.color})` }} aria-hidden="true" />
          <strong>{item.plate}</strong><span title={item.driver}>{item.driver ?? 'Vehículo asignado'}</span>
          <small>{context.orders.filter(order => order.route_id === item.id).length} pedidos visibles</small>
        </button>)}
      </div>
    </div> : null}
    {basemapError && !fail ? <Banner tone="warning" title="No se pudo cargar el mapa base."
      action={<button type="button" className="eco-btn eco-btn--secondary" onClick={retry}>Reintentar mapa</button>}>
      {basemapError} Los trazos y las ubicaciones siguen visibles. Puedes seguir usando la lista de {profile === 'vehicles' ? 'camiones' : profile === 'routes' ? 'rutas' : 'pedidos'}.
    </Banner> : null}
    {fail ? <>
      <Banner tone="warning" title="No se pudo cargar el mapa." action={<button type="button" className="eco-btn eco-btn--secondary" onClick={retry}>Reintentar mapa</button>}>
        {error} Puedes seguir usando la lista de {profile === 'vehicles' ? 'camiones' : profile === 'routes' ? 'rutas' : 'pedidos'}.
      </Banner>
      {context ? <MapFallback data={context} allowed={allowed} select={select} selection={selection} /> : null}
    </> : <div className={'eco-map' + (compact ? ' eco-map--compact' : '') + (strip ? ' eco-map--strip' : '')} role="group" aria-label="Mapa de rutas de Lima Este">
      {context ? <Suspense fallback={<span className="eco-map__note" role="status">Cargando mapa…</span>}>
        <LeafletCanvas data={context} otherStops={otherStops} selection={selection} layers={layers} compact={compact} card={card}
          onSelect={select} onDismiss={dismiss} onReady={setMap} onBasemapError={setBasemapError} />
      </Suspense> : <span className="eco-map__note" role="status">Cargando mapa…</span>}
      {showLayerControls ? <div className="eco-map__layers" onKeyDown={event => {
        if (event.key === 'Escape') { setLayersOpen(false); event.currentTarget.querySelector('button')?.focus() }
      }}>
        <button className="eco-map__layers-toggle" type="button" aria-expanded={layersOpen} aria-controls={layersPanelId}
          onClick={() => setLayersOpen(value => !value)}><SlidersIcon />Capas</button>
        {layersOpen ? <div id={layersPanelId} className="eco-map__layer-options" role="group" aria-label="Capas del mapa">
          {(Object.keys(LABELS) as (keyof MapLayers)[]).filter(key => allowed[key]).map(key => {
            const Icon = LAYER_ICONS[key]
            return <button key={key} type="button" aria-pressed={layers[key]} onClick={() => toggle(key)}><Icon />{LABELS[key]}<i aria-hidden="true" /></button>
          })}
        </div> : null}
      </div> : null}
      {!compact ? <div className="eco-map__ctrl eco-map__ctrl--tr" role="group" aria-label="Zoom">
        <button type="button" aria-label="Acercar" title="Acercar" onClick={() => map?.zoomIn()}><PlusIcon /></button>
        <button type="button" aria-label="Alejar" title="Alejar" onClick={() => map?.zoomOut()}><MinusIcon /></button>
      </div> : null}
      <div className="eco-map__ctrl eco-map__ctrl--reset">
        <button type="button" aria-label="Ver Lima" title="Ver Lima" disabled={!map} onClick={() => { if (map && context) void import('./viewport').then(({ fitVisible }) => fitVisible(map, context, layers)) }}><RecenterIcon /></button>
      </div>
      {context && !count ? <span className="eco-map__empty" role="status">
        {!layers.routes && !layers.pins && !layers.vehicles ? 'Capas ocultas · activa una capa' : filtered ? 'Sin pedidos que coincidan con los filtros' : 'Sin elementos en esta vista'}
      </span> : null}
      {!compact ? <details className="eco-map__legend" aria-label="Leyenda">
        <summary><SlidersIcon />Leyenda</summary>
        <div className="eco-map__legend-items">
          {layers.routes ? <><span><i className="eco-map__key eco-map__key--route" />Línea de color: tramo por recorrer · flechas: dirección</span>
            <span><i className="eco-map__key eco-map__key--done" />Gris: tramo recorrido</span>
            <span><span aria-hidden="true">↩</span>Acceso de ida y vuelta</span></> : null}
          {layers.vehicles ? <span><CamionetaIcon />Camión · placa y estado</span> : null}
          {layers.pins ? <>
            {layers.routes && otherStops.length ? <span><i className="eco-map__key eco-map__key--other-stop" />Círculo pequeño: otra parada de la misma ruta</span> : null}
            <span><i className="eco-map__key eco-map__key--pending" />Pendiente · rombo</span>
            <span><i className="eco-map__key eco-map__key--transit" />En camino · anillo</span>
            <span><i className="eco-map__key eco-map__key--delivered" />Entregado · check</span>
            <span><i className="eco-map__key eco-map__key--cancelled" />Cancelado · equis</span>
          </> : null}
        </div>
      </details> : null}
    </div>}
    {!compact && focusedRoute && context && layers.pins ? <details className="eco-map-itinerary" key={focusedRoute.id} open>
      <summary>Paradas de {focusedRoute.plate}{focusedRoute.driver ? ` · ${focusedRoute.driver}` : ''}</summary>
      <ol aria-label={'Paradas de ' + focusedRoute.plate}>
        {context.orders.filter(item => item.route_id === focusedRoute.id).sort((a,b) => (a.stop_number ?? Infinity) - (b.stop_number ?? Infinity)).map(item =>
          <li key={item.id}><button type="button" aria-label={`${item.stop_number ? `Parada ${item.stop_number}: ` : ''}${item.customer}`}
            aria-current={selection?.kind === 'order' && selection.id === item.id ? 'step' : undefined} onClick={() => {
              select({ kind: 'order', id: item.id })
              map?.setView([item.position.lat,item.position.lng],Math.max(map.getZoom(),16),{animate:false})
            }}>
            <span className="eco-map-itinerary__number" style={{backgroundColor: `var(--map-route-${focusedRoute.color})`}}>{item.stop_number ?? '·'}</span>
            <span><strong>{item.customer}</strong><small>{item.district} · {statusLabels[item.status]} · {item.window}</small></span>
          </button></li>)}
      </ol>
    </details> : null}
    {!fail && context ? basemapError ? <MapFallback data={context} allowed={allowed} select={select} selection={selection} />
      : <details className="eco-map-details"><summary>Elementos del mapa</summary><MapFallback data={context} allowed={layers} select={select} selection={selection} all /></details> : null}
  </div>
}

function MapFallback({ data, allowed, select, selection, all = false }: { data: MapData; allowed: MapLayers; select: (selection: MapSelection) => void; selection: MapSelection | null; all?: boolean }) {
  const entries = [
    ...(allowed.pins ? data.orders.map(item => ({ kind: 'order' as const, id: item.id, title: item.customer, detail: item.district + ' · ' + statusLabels[item.status]
      + (data.routes.some(route => route.id === item.route_id) ? ' · Vehículo ' + data.routes.find(route => route.id === item.route_id)!.plate : ' · Sin ruta asignada')
      + (item.stop_number ? ' · Parada ' + item.stop_number : '') })) : []),
    ...(allowed.routes && (all || !allowed.pins) ? data.routes.map(item => ({ kind: 'route' as const, id: item.id, title: 'Ruta ' + item.plate, detail: item.driver ?? item.plate })) : []),
    ...(allowed.vehicles && (all || !allowed.pins) ? (data.vehicles ?? []).map(item => ({ kind: 'vehicle' as const, id: item.id, title: 'Camión ' + item.plate, detail: item.status })) : []),
  ]
  return <ul className="eco-fallback" aria-label={allowed.pins ? 'Pedidos' : allowed.vehicles ? 'Camiones' : 'Rutas'}>
    {entries.map(item => <li key={item.kind + ':' + item.id} className="eco-fallback__row" aria-current={selection?.kind === item.kind && selection.id === item.id ? 'true' : undefined}>
      <button type="button" className="eco-fallback__pick" onClick={() => select({ kind: item.kind, id: item.id })}><span className="eco-code">{item.id}</span><span>{item.title}</span></button>
      <span className="eco-muted">{item.detail}</span>
    </li>)}
  </ul>
}
