import type { AlgorithmSettings } from '../domain/ports/algorithmSettings'
import type { PlanningSource } from '../domain/ports/planningSource'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { NoVehiclesAvailableError, RoutePlanningError } from '../domain/routePlan'
import type { PlanningProgress, PlanningScope, RouteProposal, RouteSettings } from '../domain/routePlan'

/** Tiempo máximo de cálculo (US-005): 45 s. */
export const MAX_PLANNING_MS = 45_000

export function createGenerateRoutes(deps: { optimizer: RouteOptimizer; planning: PlanningSource; settings?: AlgorithmSettings; timeoutMs?: number }) {
  /** Tope de cálculo: el de los parámetros del algoritmo si se pueden leer; si no, el de la norma (45 s). */
  async function limitMs(): Promise<number> {
    if (deps.timeoutMs !== undefined) return deps.timeoutMs
    if (deps.settings) {
      try {
        return (await deps.settings.load()).maxSeconds * 1000
      } catch {
        // Sin parámetros legibles se usa el valor por defecto.
      }
    }
    return MAX_PLANNING_MS
  }
  return {
    scope: (): Promise<PlanningScope> => deps.planning.scope(),
    limitSeconds: async () => Math.round((await limitMs()) / 1000),

    /** Calcula la propuesta. Sin vehículos disponibles no ejecuta el motor (criterio Gherkin de US-005). */
    async generate(settings: RouteSettings, onProgress?: (progress: PlanningProgress) => void): Promise<RouteProposal> {
      const scope = await deps.planning.scope()
      const timeoutMs = await limitMs()
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
