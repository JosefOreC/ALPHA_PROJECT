import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Fragment, useMemo } from 'react'
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet'
import { doneSegment, orderMatches, pendingSegment, vehiclePosition } from '../../domain/mapData'
import type { GeoPoint, MapData, MapOrder } from '../../domain/mapData'
import { formatDecimal } from '../../domain/format'
import { statusLabels } from '../../domain/managedOrder'
import { depotHtml, pinHtml, vehicleHtml } from './markers'

export interface MapLayers {
  routes: boolean
  pins: boolean
  vehicles: boolean
}

type LeafletCanvasProps = {
  data: MapData
  selectedId?: string
  query: string
  layers: MapLayers
  compact: boolean
  card: boolean
  onSelect?: (id: string) => void
  onReady: (map: L.Map) => void
  onTileError: () => void
  onTileLoad: () => void
}

const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
const toTuple = (point: GeoPoint): [number, number] => [point.lat, point.lng]
const reducedMotion = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Mapa de Lima Este sobre OpenStreetMap con las capas, colores y formas de pin del diseño.
export default function LeafletCanvas({ data, selectedId, query, layers, compact, card, onSelect, onReady, onTileError, onTileLoad }: LeafletCanvasProps) {
  const selected = data.orders.find(order => order.id === selectedId) ?? null
  const focus = selected?.route_id ?? null
  const bounds = useMemo(() => L.latLngBounds([data.depot.position, ...data.orders.map(order => order.position)].map(toTuple)).pad(0.12), [data])
  const motion = useMemo(() => !reducedMotion(), [])

  return (
    <MapContainer
      className="eco-map__leaflet"
      bounds={bounds}
      zoomControl={false}
      scrollWheelZoom={!compact}
      zoomAnimation={motion}
      markerZoomAnimation={motion}
      ref={map => {
        if (map) onReady(map)
      }}
    >
      <TileLayer url={TILES} attribution={ATTRIBUTION} eventHandlers={{ tileerror: onTileError, tileload: onTileLoad }} />

      {layers.routes
        ? data.routes.map(route => {
            const dim = focus !== null && route.id !== focus ? ' is-dim' : ''
            // className solo se aplica al crear la línea (react-leaflet usa setStyle después): se recrea al atenuar.
            const pending = `route r${route.color}${dim}`
            const done = `route route--done r${route.color}${dim}`
            return (
              <Fragment key={route.id}>
                <Polyline key={pending} positions={pendingSegment(route).map(toTuple)} className={pending} interactive={false} />
                <Polyline key={done} positions={doneSegment(route).map(toTuple)} className={done} interactive={false} />
              </Fragment>
            )
          })
        : null}

      <Marker position={toTuple(data.depot.position)} icon={L.divIcon({ className: 'eco-map__marker', html: depotHtml(data.depot.name), iconSize: [120, 28], iconAnchor: [14, 14] })} interactive={false} keyboard={false} />

      {layers.pins
        ? data.orders.map(order => (
            <OrderPin key={order.id} order={order} selected={order.id === selected?.id} dimmed={!orderMatches(order, data.routes, query)} onSelect={onSelect} />
          ))
        : null}

      {layers.vehicles
        ? data.routes.map(route => (
            <Marker
              key={route.id}
              position={toTuple(vehiclePosition(route))}
              icon={L.divIcon({ className: 'eco-map__marker', html: vehicleHtml(route, focus !== null && route.id !== focus), iconSize: [68, 52], iconAnchor: [34, 38] })}
              interactive={false}
              keyboard={false}
              zIndexOffset={200}
            />
          ))
        : null}

      {selected && card ? (
        <Popup key={selected.id} position={toTuple(selected.position)} offset={[0, -18]} closeButton={false} autoClose={false} closeOnClick={false} autoPanPaddingTopLeft={[16, 64]} autoPanPaddingBottomRight={[16, 16]} className="eco-map__popup">
          <div className="eco-map__card" role="status">
            <span className="eco-code">
              {selected.id} · {selected.district}
            </span>
            <strong>{selected.customer}</strong>
            <div className="eco-map__pop-row">
              <span>{statusLabels[selected.status]}</span>
              <span className="eco-code">{selected.window}</span>
            </div>
            <div className="eco-map__pop-row">
              <span>{vehicleLabel(data, selected)}</span>
              {selected.co2_kg !== null ? <span className="eco-eco eco-strong">{formatDecimal(selected.co2_kg, 0, 2)} kg CO₂</span> : null}
            </div>
          </div>
        </Popup>
      ) : null}
    </MapContainer>
  )
}

function vehicleLabel(data: MapData, order: MapOrder) {
  const plate = data.routes.find(route => route.id === order.route_id)?.plate
  return plate ? `Vehículo ${plate}` : 'Sin vehículo asignado'
}

function OrderPin({ order, selected, dimmed, onSelect }: { order: MapOrder; selected: boolean; dimmed: boolean; onSelect?: (id: string) => void }) {
  const icon = useMemo(
    () => L.divIcon({ className: 'eco-map__marker', html: pinHtml(order.status, selected, dimmed), iconSize: [36, 36], iconAnchor: [18, 18] }),
    [order.status, selected, dimmed],
  )
  return (
    <Marker
      position={toTuple(order.position)}
      icon={icon}
      title={`${order.id} · ${order.customer} · ${statusLabels[order.status]}`}
      alt={`${order.id}, ${order.customer}, ${statusLabels[order.status]}`}
      keyboard
      zIndexOffset={selected ? 500 : 0}
      eventHandlers={{ click: () => onSelect?.(order.id) }}
    />
  )
}
