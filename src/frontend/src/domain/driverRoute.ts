/** entregada, actual, agregada por reoptimización o pendiente. */
export type StopKind = 'done' | 'now' | 'new' | 'next'

export interface RouteStop {
  order_id: string
  customer: string
  address: string
  /** Hora en Lima, 24 h: «11:05». */
  time: string
  kind: StopKind
}

/** Aviso de que la ruta cambió por reoptimización. */
export interface RouteChange {
  /** Hora del cambio en Lima, 24 h. */
  at: string
  message: string
}

export interface DriverRoute {
  plate: string
  driver: string
  initials: string
  delivered: number
  total: number
  co2_saved_percent: number
  co2_saved_kg: number
  km_remaining: number
  stops: RouteStop[]
  remaining_stops: number
  return_time: string
  depot: string
  change: RouteChange | null
}

export interface DriverRoutePort {
  route(): Promise<DriverRoute>
}

export const routeProgress = (route: DriverRoute) => (route.total > 0 ? route.delivered / route.total : 0)

/** Parada del pedido dentro de la ruta (1 = primera) o null si no figura. */
export function stopNumber(route: DriverRoute, orderId: string): number | null {
  const index = route.stops.findIndex(stop => stop.order_id === orderId)
  return index < 0 ? null : index + 1
}

export const currentStop = (route: DriverRoute) => route.stops.find(stop => stop.kind === 'now') ?? null
