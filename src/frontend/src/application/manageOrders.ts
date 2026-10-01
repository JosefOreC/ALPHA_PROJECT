import { canEdit, ManagementError, validateOrder } from '../domain/managedOrder'
import type { ManagedOrder, ManagementPort, OrderData, OrderFilters } from '../domain/managedOrder'

export function createManagement(port: ManagementPort) {
  return {
    permissions: () => port.permissions(),
    list: (filters: OrderFilters) => port.list(filters),
    view: (id: string) => port.view(id),
    create(data: OrderData) { validateOrder(data); return port.create(data) },
    update(order: ManagedOrder, data: OrderData) {
      if (!canEdit(order)) throw new ManagementError('Solo puedes editar pedidos pendientes y sin conductor.', 409)
      validateOrder(data)
      return port.update(order.id, data, order.version)
    },
    cancel(order: ManagedOrder) {
      if (!canEdit(order)) throw new ManagementError('Solo puedes cancelar pedidos pendientes y sin conductor.', 409)
      return port.cancel(order.id, order.version)
    },
  }
}
export type Management = ReturnType<typeof createManagement>
