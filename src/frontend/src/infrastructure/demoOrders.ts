import type { Order, OrdersPort } from '../domain/order'
export class DemoOrders implements OrdersPort {
  private order: Order = {
    id: 'PED-0024', customer: 'María Torres', address: 'Av. Los Chancas 124',
    district: 'Santa Anita, Lima', window_start: '2026-10-01T10:00:00-05:00',
    window_end: '2026-10-01T12:00:00-05:00', weight_kg: 4.5,
    instructions: 'Entregar en recepción. Consultar por la destinataria al llegar.',
    status: 'EN_CAMINO', confirmed_at: null,
  }
  async view(id: string) {
    if (id !== this.order.id) throw new Error('Pedido no encontrado.')
    return { ...this.order }
  }
  async confirm(id: string) {
    await this.view(id)
    if (this.order.status !== 'ENTREGADO') this.order = { ...this.order, status: 'ENTREGADO', confirmed_at: new Date().toISOString() }
    return { ...this.order }
  }
}
