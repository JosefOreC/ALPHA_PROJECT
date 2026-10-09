import L from 'leaflet'
import type { GeoPoint, MapData } from '../../domain/mapData'
import { LIMA_REGION, visiblePoints } from '../../domain/mapPresentation'
import type { MapLayers } from '../../domain/mapPresentation'

export const LIMA_BOUNDS: L.LatLngTuple[] = [[LIMA_REGION.south, LIMA_REGION.west], [LIMA_REGION.north, LIMA_REGION.east]]
export const toTuple = (point: GeoPoint): [number, number] => [point.lat, point.lng]
export function fitVisible(map: L.Map, data: MapData, layers: MapLayers) {
  const points = visiblePoints(data, layers)
  if (points.length) map.fitBounds(L.latLngBounds(points.map(toTuple)), { padding: [32, 64], maxZoom: 15, animate: false })
  else map.setView(toTuple(LIMA_REGION.center), 12, { animate: false })
  map.panInsideBounds(LIMA_BOUNDS, { animate: false })
}
