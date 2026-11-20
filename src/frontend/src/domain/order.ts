export type OrderStatus = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'
export interface Order {
  id: string; customer: string; address: string; district: string
  window_start: string; window_end: string; weight_kg: number; instructions: string
  status: OrderStatus; confirmed_at: string | null
  latitude?: number | null; longitude?: number | null
}
export interface OrdersPort {
  view(id: string): Promise<Order>
  confirm(id: string): Promise<Order>
}
export const canConfirm = (order: Order) => order.status === 'EN_CAMINO'

/** Los UUID de persistencia se usan internamente. Las referencias legibles se pueden mostrar. */
export function orderReference(id: string): string | null {
  return /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id) ? null : id
}
