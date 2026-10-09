import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Fragment, useEffect, useRef } from 'react'
import type { ComponentProps } from 'react'
import { MapContainer, Marker, Pane, Polyline, Popup, useMap, useMapEvents } from 'react-leaflet'
import { doneSegment, orderMatches, pendingSegment } from '../../domain/mapData'
import type { MapData, MapSelection } from '../../domain/mapData'
import { LIMA_REGION } from '../../domain/mapPresentation'
import type { MapLayers } from '../../domain/mapPresentation'
import { formatDecimal } from '../../domain/format'
import { statusLabels } from '../../domain/managedOrder'
import { CloseIcon } from '../../shared/ui'
import { depotHtml, pinHtml, vehicleHtml } from './markers'
import { fitVisible, LIMA_BOUNDS, toTuple } from './viewport'
import VectorBasemap from './VectorBasemap'

type Props = {
  data: MapData; selection: MapSelection | null; query: string; layers: MapLayers
  compact: boolean; card: boolean; onSelect: (selection: MapSelection) => void
  onDismiss: () => void
  onReady: (map: L.Map) => void; onBasemapError: (message: string) => void
}

function MapDismiss({ onDismiss }: Pick<Props, 'onDismiss'>) {
  useMapEvents({
    click: onDismiss,
    keydown: event => { if (event.originalEvent.key === 'Escape') onDismiss() },
  })
  return null
}

function MapPopup(props: ComponentProps<typeof Popup>) {
  const map = useMap()
  const size = map.getSize()
  // Keep the card and its close button inside a measured map container.
  return <Popup {...props} autoPan={size.x > 0 && size.y > 0} autoPanPadding={[16, 16]} />
}

/** Lista/Mapa cambia el contenedor aunque no cambie la ventana. */
function MapLifecycle({ data, layers, onReady }: Pick<Props, 'data' | 'layers' | 'onReady'>) {
  const map = useMap()
  const initial = useRef({ data, layers })
  useEffect(() => {
    const resize = () => {
      map.invalidateSize({ pan: false })
      const size = map.getSize()
      map.setMinZoom(size.x > 0 && size.y > 0 ? Math.max(LIMA_REGION.minZoom, Math.ceil(map.getBoundsZoom(L.latLngBounds(LIMA_BOUNDS), true))) : LIMA_REGION.minZoom)
      map.panInsideBounds(LIMA_BOUNDS, { animate: false })
    }
    const inspect = () => {
      const center = map.getCenter()
      Object.assign(map.getContainer().dataset, { mapLat: String(center.lat), mapLng: String(center.lng), mapZoom: String(map.getZoom()) })
    }
    resize()
    fitVisible(map, initial.current.data, initial.current.layers)
    inspect()
    onReady(map)
    map.on('moveend zoomend', inspect)
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize)
    observer?.observe(map.getContainer())
    return () => { observer?.disconnect(); map.off('moveend zoomend', inspect) }
  }, [map, onReady])
  return null
}

export default function LeafletCanvas({ data, selection, query, layers, compact, card, onSelect, onDismiss, onReady, onBasemapError }: Props) {
  const order = selection?.kind === 'order' ? data.orders.find(item => item.id === selection.id) : undefined
  const vehicle = selection?.kind === 'vehicle' ? data.vehicles?.find(item => item.id === selection.id) : undefined
  const route = selection?.kind === 'route' ? data.routes.find(item => item.id === selection.id) : undefined
  const focus = order?.route_id ?? vehicle?.route_id ?? route?.id ?? null
  const popupPosition = order?.position ?? vehicle?.position ?? route?.path[0]
  const plate = data.routes.find(item => item.id === order?.route_id)?.plate
  return (
    <MapContainer className="eco-map__leaflet" center={toTuple(LIMA_REGION.center)} zoom={12}
      minZoom={LIMA_REGION.minZoom} maxZoom={LIMA_REGION.maxZoom} maxBounds={LIMA_BOUNDS} maxBoundsViscosity={1}
      zoomControl={false} scrollWheelZoom={!compact} zoomAnimation={false} markerZoomAnimation={false} fadeAnimation={false}>
      <MapLifecycle data={data} layers={layers} onReady={onReady} />
      <MapDismiss onDismiss={onDismiss} />
      <VectorBasemap onError={onBasemapError} />
      <Pane name="map-route-casing" style={{ zIndex: 400 }} />
      <Pane name="map-routes" style={{ zIndex: 410 }} />
      <Pane name="map-depot" style={{ zIndex: 520 }} />
      <Pane name="map-orders" style={{ zIndex: 540 }} />
      <Pane name="map-vehicles" style={{ zIndex: 560 }} />
      <Pane name="map-selection" style={{ zIndex: 610 }} />

      {layers.routes ? data.routes.map(item => {
        const dim = focus !== null && item.id !== focus ? ' is-dim' : ''
        const active = route?.id === item.id ? ' is-sel' : ''
        const focused = focus === item.id ? ' is-focus' : ''
        const pending = 'route r' + item.color + dim + active + focused
        const done = 'route route--done r' + item.color + dim + active + focused
        return <Fragment key={item.id}>
          <Polyline key={'casing' + dim} pane="map-route-casing" positions={item.path.map(toTuple)}
            className={'route-casing' + dim} interactive={false} />
          <Polyline key={pending} pane="map-routes" positions={pendingSegment(item).map(toTuple)} className={pending} bubblingMouseEvents={false}
            eventHandlers={{ click: () => onSelect({ kind: 'route', id: item.id }) }} />
          <Polyline key={done} pane="map-routes" positions={doneSegment(item).map(toTuple)} className={done} bubblingMouseEvents={false}
            eventHandlers={{ click: () => onSelect({ kind: 'route', id: item.id }) }} />
        </Fragment>
      }) : null}

      {layers.depot && data.depot ? <Marker pane="map-depot" position={toTuple(data.depot.position)}
        icon={L.divIcon({ className: 'eco-map__marker', html: depotHtml(data.depot.name), iconSize: [120, 28], iconAnchor: [14, 14] })}
        interactive={false} keyboard={false} /> : null}

      {layers.pins ? data.orders.map(item => <Marker key={item.id + '-' + (order?.id === item.id)}
        pane={order?.id === item.id ? 'map-selection' : 'map-orders'} position={toTuple(item.position)}
        icon={L.divIcon({ className: 'eco-map__marker', html: pinHtml(item.status, order?.id === item.id, !orderMatches(item, data.routes, query)), iconSize: [36, 44], iconAnchor: [18, 38] })}
        title={item.id + ' · ' + item.customer + ' · ' + statusLabels[item.status]} alt={item.id + ', ' + item.customer + ', ' + statusLabels[item.status]}
        keyboard eventHandlers={{ click: () => onSelect({ kind: 'order', id: item.id }) }} />) : null}

      {layers.vehicles ? data.vehicles?.map(item => <Marker key={item.id + '-' + (vehicle?.id === item.id)}
        pane={vehicle?.id === item.id ? 'map-selection' : 'map-vehicles'} position={toTuple(item.position)}
        icon={L.divIcon({ className: 'eco-map__marker', html: vehicleHtml(item, focus !== null && item.route_id !== focus, vehicle?.id === item.id), iconSize: [44, 44], iconAnchor: [22, 22] })}
        title={'Camión ' + item.plate + ' · ' + item.status} alt={'Camión ' + item.plate + ', ' + item.status} keyboard
        eventHandlers={{ click: () => onSelect({ kind: 'vehicle', id: item.id }) }} />) : null}

      {popupPosition && card ? <MapPopup key={selection?.kind + '-' + selection?.id} position={toTuple(popupPosition)} offset={[0, -38]}
        closeButton={false} autoClose={false} closeOnClick={false} closeOnEscapeKey={false} className="eco-map__popup">
        <div className="eco-map__card" role="status">
          <button type="button" className="eco-map__card-close" aria-label="Cerrar tarjeta" title="Cerrar tarjeta" onClick={onDismiss}><CloseIcon /></button>
          {order ? <>
            <span className="eco-code">{order.id} · {order.district}</span><strong>{order.customer}</strong>
            <div className="eco-map__pop-row"><span>{statusLabels[order.status]}</span><span className="eco-code">{order.window}</span></div>
            <div className="eco-map__pop-row"><span>{plate ? 'Vehículo ' + plate : 'Sin vehículo asignado'}</span>
              {order.co2_kg !== null ? <span className="eco-eco eco-strong">{formatDecimal(order.co2_kg, 0, 2)} kg CO₂</span> : null}</div>
          </> : vehicle ? <><strong>Camión {vehicle.plate}</strong><span>{vehicle.status}</span><p>{data.routes.some(item => item.id === vehicle.route_id) ? 'Ruta ' + vehicle.route_id : 'Sin ruta asignada'}</p></>
            : route ? <><strong>Ruta {route.id} · {route.plate}</strong><span>{data.orders.filter(item => item.route_id === route.id).length} pedidos</span></> : null}
          {data.demo ? <span className="eco-muted">Posiciones de demostración</span> : null}
        </div>
      </MapPopup> : null}
    </MapContainer>
  )
}
