import type { Map as LeafletMap } from 'leaflet'
import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import type { MapData } from '../../domain/mapData'
import { ORDER_STATUS_CLASS } from '../../domain/mapData'
import type { MapDataSource } from '../../domain/ports/mapDataSource'
import { statusLabels } from '../../domain/managedOrder'
import { Banner, TripStatus } from '../../shared/ui'
import type { MapLayers } from './LeafletCanvas'

// Leaflet pesa bastante: se descarga solo cuando hay un mapa que dibujar.
const LeafletCanvas = lazy(() => import('./LeafletCanvas'))

/** Tiles fallidos sin ninguno cargado antes de dar el mapa por caído. */
const TILE_FAILURES = 4

type RouteMapProps = {
  source: MapDataSource
  selectedId?: string
  /** Atenúa los pedidos que no coinciden con la búsqueda. */
  query?: string
  onSelect?: (id: string) => void
  /** Solo lectura: sin leyenda, botones de zoom ni zoom con rueda (no secuestra el scroll de la página). */
  compact?: boolean
  /** Tarjeta emergente del pedido elegido; se apaga en mapas muy pequeños. */
  card?: boolean
  /** Proporción panorámica baja (390 × 220) para el móvil del conductor. */
  strip?: boolean
}

const LEGEND = [
  { label: 'Pendiente', svg: '<rect x="-5" y="-5" width="10" height="10" rx="1.5" transform="rotate(45)" fill="var(--warning)"></rect>' },
  { label: 'En camino', svg: '<circle r="5" fill="var(--surface)" stroke="var(--info-ink)" stroke-width="2.6"></circle>' },
  { label: 'Entregado', svg: '<circle r="6" fill="var(--success-ink)"></circle>' },
  { label: 'Cancelado', svg: '<circle r="5" fill="var(--surface-sunken)" stroke="var(--ink-muted)" stroke-width="2"></circle>' },
  { label: 'Tramo por recorrer', svg: '<path d="M-7 0H7" stroke="var(--ink-muted)" stroke-width="2.5" stroke-dasharray="0.1 4" stroke-linecap="round"></path>' },
]

export function RouteMap({ source, selectedId, query = '', onSelect, compact = false, card = true, strip = false }: RouteMapProps) {
  const [data, setData] = useState<MapData | null>(null)
  const [error, setError] = useState('')
  const [tilesFailed, setTilesFailed] = useState(false)
  const [layers, setLayers] = useState<MapLayers>({ routes: true, pins: true, vehicles: true })
  const [map, setMap] = useState<LeafletMap | null>(null)
  const counts = useRef({ failed: 0, loaded: 0 })

  useEffect(() => {
    let active = true
    source
      .load()
      .then(value => {
        if (active) setData(value)
      })
      .catch(reason => {
        if (active) setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los datos del mapa.')
      })
    return () => {
      active = false
    }
  }, [source])

  const toggle = (layer: keyof MapLayers) => setLayers(current => ({ ...current, [layer]: !current[layer] }))

  // US-006: si el mapa no carga se avisa y se sigue pudiendo trabajar con la lista de pedidos.
  if (error || tilesFailed) {
    return (
      <div className="eco-stack" aria-label="Mapa de rutas">
        <Banner tone="warning" title="No se pudo cargar el mapa.">
          {error || 'No se descargaron los tiles de OpenStreetMap. Revisa tu conexión.'} Puedes seguir usando la lista de pedidos.
        </Banner>
        {data ? <OrderFallback data={data} selectedId={selectedId} onSelect={onSelect} /> : null}
      </div>
    )
  }

  return (
    <div className={`eco-map${compact ? ' eco-map--compact' : ''}${strip ? ' eco-map--strip' : ''}`} role="group" aria-label="Mapa de rutas de Lima Este">
      {data ? (
        <Suspense fallback={<span className="eco-map__note" role="status">Cargando mapa…</span>}>
          <LeafletCanvas
            data={data}
            selectedId={selectedId}
            query={query}
            layers={layers}
            compact={compact}
            card={card}
            onSelect={onSelect}
            onReady={setMap}
            onTileLoad={() => {
              counts.current.loaded += 1
            }}
            onTileError={() => {
              counts.current.failed += 1
              if (counts.current.loaded === 0 && counts.current.failed >= TILE_FAILURES) setTilesFailed(true)
            }}
          />
        </Suspense>
      ) : (
        <span className="eco-map__note" role="status">Cargando mapa…</span>
      )}

      <div className="eco-map__ctrl eco-map__ctrl--tl" role="group" aria-label="Capas del mapa">
        <button type="button" aria-pressed={layers.routes} onClick={() => toggle('routes')}>Rutas</button>
        <button type="button" aria-pressed={layers.pins} onClick={() => toggle('pins')}>Pedidos</button>
        <button type="button" aria-pressed={layers.vehicles} onClick={() => toggle('vehicles')}>Vehículos</button>
      </div>
      {!compact ? (
        <div className="eco-map__ctrl eco-map__ctrl--tr" role="group" aria-label="Zoom">
          <button type="button" aria-label="Acercar" onClick={() => map?.zoomIn()}>+</button>
          <button type="button" aria-label="Alejar" onClick={() => map?.zoomOut()}>−</button>
        </div>
      ) : null}
      {!compact ? (
        <div className="eco-map__legend" aria-label="Leyenda">
          {LEGEND.map(item => (
            <span key={item.label}>
              <svg viewBox="-8 -8 16 16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: item.svg }} />
              {item.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function OrderFallback({ data, selectedId, onSelect }: { data: MapData; selectedId?: string; onSelect?: (id: string) => void }) {
  return (
    <ul className="eco-fallback" aria-label="Pedidos">
      {data.orders.map(order => (
        <li key={order.id} className="eco-fallback__row" aria-current={order.id === selectedId ? 'true' : undefined}>
          <button type="button" className="eco-fallback__pick" onClick={() => onSelect?.(order.id)}>
            <span className="eco-code">{order.id}</span>
            <span className="eco-row__title">{order.customer}</span>
          </button>
          <span className="eco-muted">{order.district}</span>
          <TripStatus status={ORDER_STATUS_CLASS[order.status]} label={statusLabels[order.status]} />
        </li>
      ))}
    </ul>
  )
}
