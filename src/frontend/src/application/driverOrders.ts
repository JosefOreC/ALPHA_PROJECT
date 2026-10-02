import { canConfirm } from '../domain/order'
import type { OrdersPort } from '../domain/order'
export function createDriverOrders(port: OrdersPort) {
  return {
    view: (id: string) => port.view(id),
    async confirm(id: string) {
      const order = await port.view(id)
      if (order.status === 'ENTREGADO') return order
      if (!canConfirm(order)) throw new Error('Solo puedes confirmar un pedido en camino.')
      return port.confirm(id)
    },
  }
}
export type DriverOrders = ReturnType<typeof createDriverOrders>
