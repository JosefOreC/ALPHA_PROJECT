import type { GeoPoint, MapData, MapSelection, MapVehicle } from './mapData'
import { orderMatches, vehiclePosition } from './mapData'
import type { OrderStatus } from './order'

// Ventana de navegación urbana, no frontera administrativa ni cobertura logística.
// WGS84: margen para explorar Lima urbana y su entorno, incluido Callao.
// El encuadre inicial sigue los elementos de interés, no toda esta ventana.
// Ampliación de 10 km por lado sobre [-12.40, -77.25] / [-11.65, -76.60].
// Norte/sur sobre el meridiano WGS84; este/oeste sobre el paralelo medio (-12.025°).
export const LIMA_REGION = {
  south: -12.490395, west: -77.341834, north: -11.559600, east: -76.508166,
  center: { lat: -12.04, lng: -76.96 }, minZoom: 11, maxZoom: 18,
} as const

export type MapLayers = { routes: boolean; pins: boolean; vehicles: boolean; depot: boolean }
export type MapProfile = 'operations' | 'dashboard' | 'driver' | 'routes' | 'vehicles' | 'orders'
export type MapOrderStatus = 'ALL' | OrderStatus
export type MapOrderFilters = { status?: MapOrderStatus; queries?: readonly string[]; orderId?: string; district?: string }
export const MAP_PROFILES: Record<MapProfile, MapLayers> = {
  operations: { routes: true, pins: true, vehicles: true, depot: true },
  dashboard: { routes: true, pins: true, vehicles: true, depot: true },
  driver: { routes: true, pins: true, vehicles: true, depot: true },
  routes: { routes: true, pins: false, vehicles: false, depot: true },
  vehicles: { routes: false, pins: false, vehicles: true, depot: true },
  orders: { routes: false, pins: true, vehicles: false, depot: true },
}

export function inLima(point: GeoPoint): boolean {
  return Number.isFinite(point?.lat) && Number.isFinite(point?.lng)
    && point.lat >= LIMA_REGION.south && point.lat <= LIMA_REGION.north
    && point.lng >= LIMA_REGION.west && point.lng <= LIMA_REGION.east
}

/** Valida geometrías completas: no unir puntos separados al quitar un punto inválido. */
export function prepareMap(data: MapData, scopePlate?: string): { data: MapData & { vehicles: MapVehicle[] }; omitted: number } {
  const routes = data.routes.filter(route => route.path.length >= 2 && route.path.every(inLima)
    && Number.isInteger(route.done_until) && route.done_until >= 0 && route.done_until < route.path.length)
  const orders = data.orders.filter(order => inLima(order.position))
  const sourceVehicles = data.vehicles ?? routes.map(route => ({
    id: `vehicle-${route.id}`, plate: route.plate, position: vehiclePosition(route),
    route_id: route.id, color: route.color, status: 'En ruta' as const,
  }))
  const vehicles = sourceVehicles.filter(vehicle => inLima(vehicle.position))
  const depot = data.depot && inLima(data.depot.position) ? data.depot : null
  const omitted = data.routes.length - routes.length + data.orders.length - orders.length
    + sourceVehicles.length - vehicles.length + (data.depot && !depot ? 1 : 0)
  const scope = scopePlate === undefined ? null : new Set(routes.filter(route => route.plate === scopePlate).map(route => route.id))
  return {
    data: {
      ...data, depot,
      routes: scope ? routes.filter(route => scope.has(route.id)) : routes,
      orders: scope ? orders.filter(order => order.route_id !== null && scope.has(order.route_id)) : orders,
      vehicles: scope ? vehicles.filter(vehicle => vehicle.plate === scopePlate) : vehicles,
    }, omitted,
  }
}

export function visiblePoints(data: MapData, layers: MapLayers): GeoPoint[] {
  return [
    ...(layers.depot && data.depot ? [data.depot.position] : []),
    ...(layers.routes ? data.routes.flatMap(route => route.path) : []),
    ...(layers.pins ? data.orders.map(order => order.position) : []),
    ...(layers.vehicles ? (data.vehicles ?? []).map(vehicle => vehicle.position) : []),
  ]
}

/** Oculta también las rutas y vehículos ajenos a los pedidos que coinciden. */
export function filterMapOrders<T extends MapData>(data: T, filters: MapOrderFilters): T {
  const { status = 'ALL', queries = [], orderId = '', district = '' } = filters
  if (status === 'ALL' && !queries.some(query => query.trim()) && !orderId && !district) return data
  const orders = data.orders.filter(order => (status === 'ALL' || order.status === status)
    && (!orderId || order.id === orderId) && (!district || order.district === district)
    && queries.every(query => orderMatches(order, data.routes, query)))
  const routeIds = new Set(orders.flatMap(order => order.route_id ? [order.route_id] : []))
  return { ...data, orders, routes: data.routes.filter(route => routeIds.has(route.id)),
    vehicles: data.vehicles?.filter(vehicle => vehicle.route_id !== null && routeIds.has(vehicle.route_id)) }
}

export function selectionVisible(selection: MapSelection | null, data: MapData, layers: MapLayers): boolean {
  if (!selection) return false
  if (selection.kind === 'order') return layers.pins && data.orders.some(order => order.id === selection.id)
  if (selection.kind === 'route') return layers.routes && data.routes.some(route => route.id === selection.id)
  return layers.vehicles && (data.vehicles ?? []).some(vehicle => vehicle.id === selection.id)
}
