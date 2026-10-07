import type { OrderStatus } from './order'

export interface GeoPoint {
  lat: number
  lng: number
}

export interface MapOrder {
  id: string
  customer: string
  district: string
  status: OrderStatus
  position: GeoPoint
  /** Ventana en hora de Lima, 24 h: «10:30–12:30». */
  window: string
  /** Ruta a la que pertenece, o null si aún no tiene vehículo. */
  route_id: string | null
  co2_kg: number | null
}

export interface MapRoute {
  id: string
  plate: string
  /** Color de la ruta: 1 a 4 (`--route-1…4`). */
  color: 1 | 2 | 3 | 4
  /** Recorrido completo, del almacén a la última parada. */
  path: GeoPoint[]
  /** Posición del vehículo dentro de `path`: hasta ahí el tramo está recorrido. */
  done_until: number
}

export interface MapData {
  depot: { name: string; position: GeoPoint }
  orders: MapOrder[]
  routes: MapRoute[]
}

export const ORDER_STATUS_CLASS: Record<OrderStatus, 'pending' | 'transit' | 'delivered' | 'cancelled'> = {
  PENDIENTE: 'pending',
  EN_CAMINO: 'transit',
  ENTREGADO: 'delivered',
  CANCELADO: 'cancelled',
}

export const vehiclePosition = (route: MapRoute): GeoPoint => route.path[Math.min(route.done_until, route.path.length - 1)]
export const doneSegment = (route: MapRoute): GeoPoint[] => route.path.slice(0, route.done_until + 1)
export const pendingSegment = (route: MapRoute): GeoPoint[] => route.path.slice(route.done_until)

const fold = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** ¿El pedido coincide con la búsqueda? Mira pedido, cliente, distrito y placa del vehículo. */
export function orderMatches(order: MapOrder, routes: MapRoute[], query: string): boolean {
  const needle = fold(query.trim())
  if (!needle) return true
  const plate = routes.find(route => route.id === order.route_id)?.plate ?? ''
  return fold(`${order.id} ${order.customer} ${order.district} ${plate}`).includes(needle)
}
