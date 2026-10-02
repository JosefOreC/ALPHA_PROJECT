import { canEdit, ManagementError, validateOrder } from '../domain/managedOrder'
import type { ManagedOrder, ManagementPort, OrderData, OrderFilters } from '../domain/managedOrder'

const fixture: ManagedOrder = { id: 'DEMO-PENDIENTE', customer: 'Destinatario ficticio', address: 'Dirección ficticia 123',
  district: 'Santa Anita', window_start: '2026-10-01T10:00:00-05:00', window_end: '2026-10-01T12:00:00-05:00',
  weight_kg: 4.5, instructions: 'Pedido de demostración, sin entrega real.', status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1 }

/** Solo demostración explícita de interfaz. Nada se guarda en disco o en una API. */
export class DemoManagement implements ManagementPort {
  private readonly orders = new Map<string, ManagedOrder>([
    [fixture.id, { ...fixture }],
    ['DEMO-ENTREGADO', { ...fixture, id: 'DEMO-ENTREGADO', customer: 'Segundo destinatario ficticio',
      status: 'ENTREGADO', assigned: true, confirmed_at: '2026-10-01T16:00:00Z', version: 2 }],
  ])
  async permissions() { return { can_write: true } }
  async list(filters: OrderFilters) {
    const items = [...this.orders.values()].filter(order => (!filters.status || order.status === filters.status) && (!filters.district || order.district === filters.district)).sort((a, b) => a.id.localeCompare(b.id))
    return { items: items.slice(filters.offset, filters.offset + filters.limit).map(order => ({ ...order })),
      limit: filters.limit, offset: filters.offset, has_more: items.length > filters.offset + filters.limit }
  }
  async view(id: string) {
    const order = this.orders.get(id)
    if (!order) throw new ManagementError('Pedido no encontrado.', 404)
    return { ...order }
  }
  async create(data: OrderData) {
    validateOrder(data)
    const order: ManagedOrder = { ...data, customer: data.customer.trim(), address: data.address.trim(), instructions: data.instructions.trim(),
      id: `DEMO-${crypto.randomUUID()}`, status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1 }
    this.orders.set(order.id, order)
    return { ...order }
  }
  private current(id: string, version: number): ManagedOrder {
    const order = this.orders.get(id)
    if (!order) throw new ManagementError('Pedido no encontrado.', 404)
    if (!canEdit(order) || order.version !== version) throw new ManagementError('El pedido cambió o no admite modificación.', 409)
    return order
  }
  async update(id: string, data: OrderData, version: number) {
    validateOrder(data)
    const order = { ...this.current(id, version), ...data, version: version + 1 }
    this.orders.set(id, order)
    return { ...order }
  }
  async cancel(id: string, version: number) {
    const order: ManagedOrder = { ...this.current(id, version), status: 'CANCELADO', version: version + 1 }
    this.orders.set(id, order)
    return { ...order }
  }
}
