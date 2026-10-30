import type { DriverRoutePort } from '../domain/driverRoute'

export function createDriverRoute(port: DriverRoutePort) {
  return { route: () => port.route() }
}
export type DriverRouteService = ReturnType<typeof createDriverRoute>
