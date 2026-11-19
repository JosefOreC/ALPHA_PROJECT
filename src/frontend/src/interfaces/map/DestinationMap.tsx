import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'
import { MapContainer, Marker, useMapEvents } from 'react-leaflet'
import type { GeoPoint } from '../../domain/mapData'
import { LIMA_REGION } from '../../domain/mapPresentation'
import { MinusIcon, PlusIcon } from '../../shared/ui'
import VectorBasemap from './VectorBasemap'
import { pinHtml } from './markers'

type Props = { value: GeoPoint | null; disabled: boolean; onChange: (point: GeoPoint) => void; onError: (message: string) => void }
const icon = L.divIcon({className:'eco-map__marker',html:pinHtml('PENDIENTE',true,false),iconSize:[36,44],iconAnchor:[18,38]})

function MapEvents({ value, disabled, onChange, onReady }: Omit<Props,'onError'> & { onReady: (map: L.Map) => void }) {
  const lat = value?.lat
  const lng = value?.lng
  const map = useMapEvents({ click: event => { if (!disabled) { const point=event.latlng.wrap(); onChange({lat:point.lat,lng:point.lng}) } } })
  useEffect(() => {
    const container = map.getContainer()
    container.setAttribute('aria-label','Seleccionar destino: usa las flechas para mover el mapa')
    const resize = () => map.invalidateSize({pan:false})
    const observer = typeof ResizeObserver==='undefined' ? null : new ResizeObserver(resize)
    observer?.observe(container)
    onReady(map)
    return () => { observer?.disconnect() }
  }, [map,onReady])
  useEffect(() => {
    if (lat!==undefined && lng!==undefined) map.setView([lat,lng],Math.max(map.getZoom(),15),{animate:false})
  }, [map,lat,lng])
  return null
}

export default function DestinationMap({ value, disabled, onChange, onError }: Props) {
  const [map,setMap] = useState<L.Map | null>(null)
  const center = value ?? LIMA_REGION.center
  return <div className="eco-map eco-destination-map" role="group" aria-label="Mapa para seleccionar destino" aria-disabled={disabled}>
    <MapContainer className="eco-map__leaflet" center={[center.lat,center.lng]} zoom={value ? 15 : 12}
      minZoom={3} maxZoom={18} zoomControl={false} scrollWheelZoom={false} doubleClickZoom={false}
      zoomAnimation={false} markerZoomAnimation={false} fadeAnimation={false}>
      <MapEvents value={value} disabled={disabled} onChange={onChange} onReady={setMap} />
      <VectorBasemap onError={onError} />
      {value ? <Marker position={[value.lat,value.lng]} icon={icon} draggable={!disabled} keyboard
        title="Destino del pedido: arrastra para ajustar" alt="Destino del pedido"
        eventHandlers={{ dragend:event => {
          if (!disabled) { const point=(event.target as L.Marker).getLatLng().wrap(); onChange({lat:point.lat,lng:point.lng}) }
        } }} /> : null}
    </MapContainer>
    <div className="eco-map__ctrl eco-map__ctrl--tr" role="group" aria-label="Zoom del destino">
      <button type="button" disabled={disabled || !map} aria-label="Acercar destino" onClick={() => map?.zoomIn()}><PlusIcon /></button>
      <button type="button" disabled={disabled || !map} aria-label="Alejar destino" onClick={() => map?.zoomOut()}><MinusIcon /></button>
    </div>
    <div className="eco-destination-map__confirm">
      <button className="eco-btn eco-btn--secondary" type="button" disabled={disabled || !map} onClick={() => {
        const point = map?.getCenter().wrap()
        if (point) onChange({lat:point.lat,lng:point.lng})
      }}>Usar centro del mapa</button>
    </div>
  </div>
}
