import type { Map as LeafletMap } from 'leaflet'
import { Suspense, lazy, useEffect, useId, useMemo, useState } from 'react'
import type { MapData, MapSelection } from '../../domain/mapData'
import { MAP_PROFILES, prepareMap, selectionVisible } from '../../domain/mapPresentation'
import { orderMatches } from '../../domain/mapData'
import type { MapLayers, MapProfile } from '../../domain/mapPresentation'
import type { MapDataSource } from '../../domain/ports/mapDataSource'
import { statusLabels } from '../../domain/managedOrder'
import { Banner, CamionetaIcon, EntregaIcon, MinusIcon, PaqueteIcon, PlusIcon, RecenterIcon, RutaIcon, SlidersIcon } from '../../shared/ui'

const LeafletCanvas = lazy(() => import('./LeafletCanvas'))
type Props = {
  source: MapDataSource
  selectedId?: string
  query?: string
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

function MapInstance({ source, selectedId, query = '', onSelect, onSelectElement, profile = 'operations', scopePlate,
  initialLayers, showLayerControls = true, compact = false, card = true, strip = false }: Props) {
  const allowed = MAP_PROFILES[profile]
  const layersPanelId = useId()
  const [layersOpen, setLayersOpen] = useState(false)
  const [layers, setLayers] = useState<MapLayers>(() => Object.fromEntries(Object.entries(allowed).map(([key, value]) =>
    [key, value && (initialLayers?.[key as keyof MapLayers] ?? true)])) as MapLayers)
  const [data, setData] = useState<MapData | null>(null)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const [map, setMap] = useState<LeafletMap | null>(null)
  const [localSelection, setLocalSelection] = useState<{ value: MapSelection; externalId?: string } | null>(null)
  const [dismissedOrder, setDismissedOrder] = useState<string | undefined>()

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
  const context = prepared?.data
  const candidate = (localSelection?.externalId === selectedId ? localSelection?.value : null) ?? (selectedId && selectedId !== dismissedOrder ? { kind: 'order' as const, id: selectedId } : null)
  const selection = context && selectionVisible(candidate, context, layers) ? candidate : null
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
    setData(null); setError(''); setMap(null)
    setLocalSelection(null); setDismissedOrder(undefined)
    setAttempt(value => value + 1)
  }
  const count = context ? (layers.routes ? context.routes.length : 0) + (layers.pins ? context.orders.length : 0) + (layers.vehicles ? context.vehicles.length : 0) : 0
  const matches = context?.orders.some(order => orderMatches(order, context.routes, query))

  return <div className="eco-stack">
    {prepared?.omitted ? <p className="eco-muted" role="status">{prepared.omitted} elementos omitidos por coordenadas o geometrías fuera del área de Lima.</p> : null}
    {fail ? <>
      <Banner tone="warning" title="No se pudo cargar el mapa." action={<button type="button" className="eco-btn eco-btn--secondary" onClick={retry}>Reintentar mapa</button>}>
        {error} Puedes seguir usando la lista de {profile === 'vehicles' ? 'camiones' : profile === 'routes' ? 'rutas' : 'pedidos'}.
      </Banner>
      {context ? <MapFallback data={context} allowed={allowed} select={select} selection={selection} /> : null}
    </> : <div className={'eco-map' + (compact ? ' eco-map--compact' : '') + (strip ? ' eco-map--strip' : '')} role="group" aria-label="Mapa de rutas de Lima Este">
      {context ? <Suspense fallback={<span className="eco-map__note" role="status">Cargando mapa…</span>}>
        <LeafletCanvas data={context} selection={selection} query={query} layers={layers} compact={compact} card={card}
          onSelect={select} onDismiss={dismiss} onReady={setMap} onBasemapError={setError} />
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
      {context && (!count || (query.trim() && layers.pins && !matches)) ? <span className="eco-map__empty" role="status">
        {!layers.routes && !layers.pins && !layers.vehicles ? 'Capas ocultas · activa una capa' : !count ? 'Sin elementos en esta vista' : 'Sin coincidencias'}
      </span> : null}
      {!compact ? <details className="eco-map__legend" aria-label="Leyenda">
        <summary><SlidersIcon />Leyenda</summary>
        <div className="eco-map__legend-items">
          {layers.routes ? <span><i className="eco-map__key eco-map__key--route" />Tramo recorrido sólido · tramo por recorrer punteado</span> : null}
          {layers.vehicles ? <span><CamionetaIcon />Camión · placa y estado</span> : null}
          {layers.pins ? <>
            <span><i className="eco-map__key eco-map__key--pending" />Pendiente · rombo</span>
            <span><i className="eco-map__key eco-map__key--transit" />En camino · anillo</span>
            <span><i className="eco-map__key eco-map__key--delivered" />Entregado · check</span>
            <span><i className="eco-map__key eco-map__key--cancelled" />Cancelado · equis</span>
          </> : null}
        </div>
      </details> : null}
    </div>}
    {!fail && context ? <details className="eco-map-details"><summary>Elementos del mapa</summary><MapFallback data={context} allowed={layers} select={select} selection={selection} all /></details> : null}
    {context?.demo ? <p className="eco-muted eco-note">Mapa de Lima · rutas y posiciones de demostración</p> : null}
  </div>
}

function MapFallback({ data, allowed, select, selection, all = false }: { data: MapData; allowed: MapLayers; select: (selection: MapSelection) => void; selection: MapSelection | null; all?: boolean }) {
  const entries = [
    ...(allowed.pins ? data.orders.map(item => ({ kind: 'order' as const, id: item.id, title: item.customer, detail: item.district + ' · ' + statusLabels[item.status] })) : []),
    ...(allowed.routes && (all || !allowed.pins) ? data.routes.map(item => ({ kind: 'route' as const, id: item.id, title: 'Ruta ' + item.id, detail: item.plate })) : []),
    ...(allowed.vehicles && (all || !allowed.pins) ? (data.vehicles ?? []).map(item => ({ kind: 'vehicle' as const, id: item.id, title: 'Camión ' + item.plate, detail: item.status })) : []),
  ]
  return <ul className="eco-fallback" aria-label={allowed.pins ? 'Pedidos' : allowed.vehicles ? 'Camiones' : 'Rutas'}>
    {entries.map(item => <li key={item.kind + ':' + item.id} className="eco-fallback__row" aria-current={selection?.kind === item.kind && selection.id === item.id ? 'true' : undefined}>
      <button type="button" className="eco-fallback__pick" onClick={() => select({ kind: item.kind, id: item.id })}><span className="eco-code">{item.id}</span><span>{item.title}</span></button>
      <span className="eco-muted">{item.detail}</span>
    </li>)}
  </ul>
}
