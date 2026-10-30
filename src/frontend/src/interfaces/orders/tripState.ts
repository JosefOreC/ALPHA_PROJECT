import type { OrderStatus } from '../../domain/order'
import type { TripState } from '../../shared/ui'

export const tripOf: Record<OrderStatus, TripState> = {
  PENDIENTE: 'pending',
  EN_CAMINO: 'transit',
  ENTREGADO: 'delivered',
  CANCELADO: 'cancelled',
}
