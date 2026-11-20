import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, Polyline, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { GeoPoint } from '../../domain/mapData'
import { inLima, LIMA_REGION } from '../../domain/mapPresentation'
import type { Scenario, SimulationResult } from '../../domain/simulation'
import { Banner, MinusIcon, PlusIcon } from '../../shared/ui'
import { pinHtml, vehicleHtml } from '../map/markers'
import { LIMA_BOUNDS, toTuple } from '../map/viewport'
import VectorBasemap from '../map/VectorBasemap'

export type Selection = { kind: 'vehicle' | 'order'; id: string }
type Props = {
  scenario: Scenario; result: SimulationResult | null; selection: Selection | null; disabled: boolean
  onPlace: (point: GeoPoint) => void; onSelect: (selection: Selection) => void
  onMove: (selection: Selection, point: GeoPoint) => void
}

function Lifecycle({ onPlace, disabled, onReady }: Pick<Props, 'onPlace' | 'disabled'> & { onReady: (map: L.Map) => void }) {
  const map = useMapEvents({
    click: event => { if (!disabled && inLima(event.latlng)) onPlace(event.latlng) },
    keydown: event => {
      if (event.originalEvent.key === 'Enter' && !disabled && event.originalEvent.target === map.getContainer()) {
        event.originalEvent.preventDefault()
        if (inLima(map.getCenter())) onPlace(map.getCenter())
      }
    },
  })
  useEffect(() => {
    const container = map.getContainer()
    container.setAttribute('aria-label', 'Mapa de Lima: mueve con las flechas y pulsa Enter para colocar un punto')
    const resize = () => map.invalidateSize({ pan: false })
    const observer = new ResizeObserver(resize)
    observer.observe(container)
    onReady(map)
    return () => observer.disconnect()
  }, [map, onReady])
  return null
}

function FitScenario({ scenario, result }: Pick<Props, 'scenario' | 'result'>) {
  const map = useMap()
  useEffect(() => {
    if (!result) return
    const points = result.routes.flatMap(route => route.path).filter(inLima)
    if (points.length) map.fitBounds(L.latLngBounds(points.map(toTuple)), { padding: [40, 40], maxZoom: 15, animate: false })
  }, [map, result])
  // The user keeps control of the camera while placing or moving individual points.
  useEffect(() => {
    if (scenario.vehicles.length + scenario.orders.length === 0) map.setView(toTuple(LIMA_REGION.center), 13, { animate: false })
  }, [map, scenario.vehicles.length, scenario.orders.length])
  return null
}

export default function SimulationMap({ scenario, result, selection, disabled, onPlace, onSelect, onMove }: Props) {
  const [map, setMap] = useState<L.Map | null>(null)
  const [mapError, setMapError] = useState('')
  const [attempt, setAttempt] = useState(0)
  const placeAtCenter = () => { if (map && inLima(map.getCenter())) onPlace(map.getCenter()) }
  return <div className="eco-stack">
    <div className="eco-map eco-simulation-map" role="group" aria-label="Mapa de Lima para la simulación" aria-disabled={disabled}>
      <MapContainer key={attempt} className="eco-map__leaflet" center={toTuple(LIMA_REGION.center)} zoom={13}
        minZoom={LIMA_REGION.minZoom} maxZoom={18} maxBounds={LIMA_BOUNDS} maxBoundsViscosity={1}
        zoomControl={false} doubleClickZoom={false} zoomAnimation={false} markerZoomAnimation={false} fadeAnimation={false}>
        <Lifecycle onPlace={onPlace} disabled={disabled} onReady={setMap} />
        <FitScenario scenario={scenario} result={result} />
        <VectorBasemap onError={setMapError} />
        {result?.routes.map((route, i) => <Polyline key={route.plate} positions={route.path.map(toTuple)}
          pathOptions={{ className: `route route--pending r${i % 4 + 1}`, weight: 5, opacity: .9 }}>
          <Tooltip>{route.plate} · {route.km} km</Tooltip>
        </Polyline>)}
        {scenario.vehicles.map((point, i) => <Marker key={`vehicle-${point.id}`} position={toTuple(point)} keyboard
          draggable={!disabled} title={`${point.id}: origen del móvil`} alt={point.id}
          icon={L.divIcon({ className: 'eco-map__marker', html: vehicleHtml({ plate: point.id, color: (i % 4 + 1) as 1 | 2 | 3 | 4 }, false, selection?.kind === 'vehicle' && selection.id === point.id), iconSize: [44, 44], iconAnchor: [22, 22] })}
          eventHandlers={{ click: () => { if (!disabled) onSelect({ kind: 'vehicle', id: point.id }) },
            dragend: event => { if (!disabled) onMove({ kind: 'vehicle', id: point.id }, (event.target as L.Marker).getLatLng()) } }}>
          <Tooltip>{point.id} · {point.capacity} kg de capacidad</Tooltip>
        </Marker>)}
        {scenario.orders.map(point => {
          const routeIndex = result?.routes.findIndex(route => route.sequence?.some(stop => stop.id === point.id)) ?? -1
          const stopIndex = routeIndex >= 0 ? result!.routes[routeIndex].sequence?.findIndex(stop => stop.id === point.id) ?? -1 : -1
          return <Marker key={`order-${point.id}`} position={toTuple(point)} keyboard draggable={!disabled}
            title={`${point.id}: destino del pedido`} alt={point.id}
            icon={L.divIcon({ className: 'eco-map__marker', html: pinHtml('PENDIENTE', selection?.kind === 'order' && selection.id === point.id, false,
              routeIndex >= 0 ? { color: (routeIndex % 4 + 1) as 1 | 2 | 3 | 4, stop: stopIndex + 1 } : undefined), iconSize: [36, 44], iconAnchor: [18, 38] })}
            eventHandlers={{ click: () => { if (!disabled) onSelect({ kind: 'order', id: point.id }) },
              dragend: event => { if (!disabled) onMove({ kind: 'order', id: point.id }, (event.target as L.Marker).getLatLng()) } }}>
            <Tooltip>{point.id} · {point.weight} kg</Tooltip>
          </Marker>
        })}
      </MapContainer>
      <div className="eco-map__ctrl eco-map__ctrl--tr" role="group" aria-label="Zoom del laboratorio">
        <button type="button" aria-label="Acercar mapa" disabled={!map} onClick={() => map?.zoomIn()}><PlusIcon /></button>
        <button type="button" aria-label="Alejar mapa" disabled={!map} onClick={() => map?.zoomOut()}><MinusIcon /></button>
      </div>
    </div>
    {mapError ? <Banner tone="warning" title="Cartografía no disponible">{mapError} Comprueba tu conexión. Los puntos seleccionados se conservan.
      <button className="eco-btn eco-btn--secondary" type="button" disabled={disabled} onClick={() => { setMapError(''); setMap(null); setAttempt(value => value + 1) }}>Reintentar mapa</button>
    </Banner> : null}
    <div className="eco-toolbar"><button type="button" className="eco-btn eco-btn--secondary" disabled={disabled || !map} onClick={placeAtCenter}>Colocar en el centro del mapa</button><span className="eco-muted">También puedes mover el mapa con las flechas y pulsar Enter. Arrastra un marcador para ajustar su posición.</span></div>
  </div>
}
