import { can, requirePermission } from '../domain/accessControl'
import type { Role } from '../domain/role'
import type { SessionUser } from '../domain/session'
import type { Management } from './manageOrders'
import type { Administration } from './administration'
import type { GenerateRoutes } from './generateRoutes'
import type { SustainabilityService } from './getSustainabilityReport'
import type { DriverOrders as DriverOrdersService } from './driverOrders'
import type { DriverRouteService } from './driverRoute'

export function authorizeManagement(service: Management, role: Role): Management {
  return {
    async permissions() { requirePermission(role, 'orders.read'); const permissions = await service.permissions(); return { can_write: permissions.can_write && can(role, 'orders.update') } },
    async list(filters) { requirePermission(role, 'orders.read'); return service.list(filters) },
    async view(id) { requirePermission(role, 'orders.read'); return service.view(id) },
    async create(data) { requirePermission(role, 'orders.create'); return service.create(data) },
    async update(order, data) { requirePermission(role, 'orders.update'); return service.update(order, data) },
    async cancel(order) { requirePermission(role, 'orders.delete'); return service.cancel(order) },
  }
}
export function authorizeAdministration(service: Administration, role: Role): Administration {
  return {
    async users(signal) { requirePermission(role, 'users.read'); return service.users(signal) },
    async integrations(signal) { requirePermission(role, 'users.read'); return service.integrations(signal) },
    async parameters() { requirePermission(role, 'settings.read'); return service.parameters() },
    async saveParameters(parameters) { requirePermission(role, 'settings.update'); return service.saveParameters(parameters) },
  }
}
export function authorizePlanning(service: GenerateRoutes, role: Role): GenerateRoutes {
  return {
    async scope() { requirePermission(role, 'routes.read'); return service.scope() },
    async limitSeconds() { requirePermission(role, 'routes.read'); return service.limitSeconds() },
    async generate(settings, onProgress) { requirePermission(role, 'routes.generate'); return service.generate(settings, onProgress) },
  }
}
export function authorizeSustainability(service: SustainabilityService, role: Role): SustainabilityService {
  return {
    async get(period, signal) { requirePermission(role, 'reports.read'); return service.get(period, signal) },
    exportCsv(report) { requirePermission(role, 'reports.export'); return service.exportCsv(report) },
  }
}
export function authorizeDriver(orders: DriverOrdersService, route: DriverRouteService, user: SessionUser, verifyDemoRoute = true) {
  const ownRoute = async () => {
    requirePermission(user.role, 'routes.read')
    if (user.role !== 'driver' || !user.driverId || !user.plate) throw new Error('Tu usuario no tiene una asignación de conductor verificada.')
    const value = await route.route()
    if (value.plate !== user.plate) throw new Error('La ruta no corresponde a tu vehículo asignado.')
    return value
  }
  const ownOrder = async (id: string) => {
    if (user.role !== 'driver' || !user.driverId) throw new Error('Tu usuario no tiene una asignación de conductor verificada.')
    // In HTTP mode ownership is checked by the authenticated API, even without a route API.
    if (verifyDemoRoute && !(await ownRoute()).stops.some(stop => stop.order_id === id)) throw new Error('Pedido no encontrado o no asignado a tu usuario.')
  }
  return {
    route: { route: ownRoute } as DriverRouteService,
    orders: {
      async view(id: string) { await ownOrder(id); return orders.view(id) },
      async confirm(id: string) { requirePermission(user.role, 'deliveries.update'); await ownOrder(id); return orders.confirm(id) },
    } as DriverOrdersService,
  }
}
