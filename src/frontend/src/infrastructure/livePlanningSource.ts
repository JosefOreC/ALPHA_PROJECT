import type { ManagedOrder, OrderFilters, OrderPage } from '../domain/managedOrder'
import type { PlanningSource } from '../domain/ports/planningSource'
import type { Vehicle } from '../types/vehicle'

const PAGE_SIZE = 100
const MAX_PAGES = 20

/** Une lo que ya existe: pedidos pendientes (gestión de pedidos) y vehículos (gestión de flota). */
export function createLivePlanningSource(
  orders: { list(filters: OrderFilters): Promise<OrderPage> },
  fleet: { getVehicles(): Promise<{ data: { vehiculos: Vehicle[] } }> },
): PlanningSource {
  return {
    async scope() {
      const pending: ManagedOrder[] = []
      for (let page = 0; page < MAX_PAGES; page++) {
        const result = await orders.list({ limit: PAGE_SIZE, offset: page * PAGE_SIZE, status: 'PENDIENTE' })
        pending.push(...result.items)
        if (!result.has_more) break
      }
      const { vehiculos } = (await fleet.getVehicles()).data
      const operational = vehiculos.filter(vehicle => vehicle.estado !== 'INACTIVO')
      return {
        pendingOrders: pending.length,
        districts: new Set(pending.map(order => order.district)).size,
        availableVehicles: operational.filter(vehicle => vehicle.estado === 'DISPONIBLE').length,
        totalVehicles: operational.length,
        vehiclesInService: operational.filter(vehicle => vehicle.estado === 'MANTENIMIENTO').length,
      }
    },
  }
}
