export type TripState = 'pending' | 'transit' | 'delivered' | 'cancelled'
export type UnitState = 'ready' | 'moving' | 'service' | 'off'

export const TRIP_LABELS: Record<TripState, string> = {
  pending: 'Pendiente',
  transit: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const UNIT_LABELS: Record<UnitState, string> = {
  ready: 'Disponible',
  moving: 'En ruta',
  service: 'Mantenimiento',
  off: 'Inactivo',
}
