import L from 'leaflet'
import { useMemo, useState } from 'react'
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import type { MapRoute } from '../../domain/mapData'
import { findAccessBranches } from './routeTrace'
import { toTuple } from './viewport'

/** A small return symbol at the entrance; remains available when order pins are filtered out. */
export function RouteAccessMarkers({route,dimmed}: {route:MapRoute;dimmed:boolean}) {
  const map=useMap()
  const [zoom,setZoom]=useState(()=>map.getZoom())
  useMapEvents({zoomend:()=>setZoom(map.getZoom())})
  const branches=useMemo(()=>findAccessBranches(route.path),[route.path])
  return branches.filter(branch => map.project(toTuple(branch.entrance),zoom).distanceTo(map.project(toTuple(branch.tip),zoom)) >= 14)
    .map((branch,index) => <Marker key={index} pane="map-accesses" position={toTuple(branch.entrance)}
      title={`Acceso de ida y vuelta · Vehículo ${route.plate}`} alt={`Acceso de ida y vuelta · Vehículo ${route.plate}`}
      keyboard bubblingMouseEvents={false} eventHandlers={{click:event=>event.target.openTooltip()}}
      icon={L.divIcon({className:'eco-map__access-marker',iconSize:[28,28],iconAnchor:[14,14],
        html:`<svg class="route-access-icon r${route.color}${dimmed ? ' is-dim' : ''}" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5"/><path d="M6 7h5a3 3 0 0 1 0 6H8M6 7l2-2M6 7l2 2"/></svg>`})}>
      <Tooltip direction="top" offset={[0,-12]} className="eco-map__access-tooltip"><strong>Acceso de ida y vuelta</strong>
        <span>Vehículo {route.plate}</span><span>La ruta entra por este ramal y vuelve al mismo cruce.</span>
      </Tooltip>
    </Marker>)
}
