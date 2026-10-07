import type { PlanningSource } from '../domain/ports/planningSource'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { NoVehiclesAvailableError, RoutePlanningError } from '../domain/routePlan'
import type { PlanningProgress, PlanningScope, RouteProposal, RouteSettings } from '../domain/routePlan'

/** Tiempo máximo de cálculo (US-005): 45 s. */
export const MAX_PLANNING_MS = 45_000

export function createGenerateRoutes(deps: { optimizer: RouteOptimizer; planning: PlanningSource; timeoutMs?: number }) {
  const timeoutMs = deps.timeoutMs ?? MAX_PLANNING_MS
  return {
    scope: (): Promise<PlanningScope> => deps.planning.scope(),

    /** Calcula la propuesta. Sin vehículos disponibles no ejecuta el motor (criterio Gherkin de US-005). */
    async generate(settings: RouteSettings, onProgress?: (progress: PlanningProgress) => void): Promise<RouteProposal> {
      const scope = await deps.planning.scope()
      if (scope.availableVehicles <= 0) throw new NoVehiclesAvailableError()
      if (scope.pendingOrders <= 0) throw new RoutePlanningError('No hay pedidos pendientes para planificar.')
      let timer: ReturnType<typeof setTimeout> | undefined
      const limit = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new RoutePlanningError(`El cálculo superó el tiempo máximo de ${Math.round(timeoutMs / 1000)} s. Prueba con otra configuración.`)), timeoutMs)
      })
      try {
        return await Promise.race([deps.optimizer.optimize(scope, settings, onProgress), limit])
      } finally {
        clearTimeout(timer)
      }
    },
  }
}
export type GenerateRoutes = ReturnType<typeof createGenerateRoutes>
