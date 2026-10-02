export type OrderStatus = 'PENDIENTE' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'
export interface Order {
  id: string; customer: string; address: string; district: string
  window_start: string; window_end: string; weight_kg: number; instructions: string
  status: OrderStatus; confirmed_at: string | null
}
export interface OrdersPort {
  view(id: string): Promise<Order>
  confirm(id: string): Promise<Order>
}
export const canConfirm = (order: Order) => order.status === 'EN_CAMINO'
