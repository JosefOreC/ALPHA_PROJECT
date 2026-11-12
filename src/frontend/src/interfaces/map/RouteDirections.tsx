import L from 'leaflet'
import { useMemo, useState } from 'react'
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { MapRoute } from '../../domain/mapData'
import { traceDirections } from './routeTrace'
import { toTuple } from './viewport'

export function RouteDirections({ route, dimmed, showLabel }: { route: MapRoute; dimmed: boolean; showLabel: boolean }) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const marks = useMemo(() => traceDirections(route.path, point => map.project(toTuple(point), zoom)), [route.path, map, zoom])
  // A label on the outbound path avoids piling it over the last stops of a return trip.
  const labelPoint = marks[Math.floor(marks.length / 4)]?.position ?? route.path[Math.floor(route.path.length / 4)]
  const size = map.getSize()
  return <>{marks.map((mark, index) => <Marker key={index} position={toTuple(mark.position)} pane="map-directions"
    interactive={false} keyboard={false} icon={L.divIcon({ className: 'eco-map__direction-marker', iconSize: [20, 20], iconAnchor: [10, 10],
      html: `<svg class="route-direction r${route.color}${dimmed ? ' is-dim' : ''}" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path transform="rotate(${mark.angle} 10 10)" d="M7 5l5 5-5 5" /></svg>` })} />)}
    {showLabel && size.x > 0 && size.y > 0 ? <Marker position={toTuple(labelPoint)} pane="map-directions" interactive={false} keyboard={false}
      icon={L.divIcon({className:'eco-map__direction-marker',html:'',iconSize:[1,1]})}>
      <Tooltip permanent direction="center" className={`eco-map__route-label r${route.color}`}><span>Vehículo</span> <strong>{route.plate}</strong></Tooltip>
    </Marker> : null}
  </>
}
