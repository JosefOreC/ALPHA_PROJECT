import type { PlanningSource } from '../domain/ports/planningSource'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { PLANNING_STEPS, RoutePlanningError } from '../domain/routePlan'
import type { PlanningProgress, PlanningScope, RouteProposal } from '../domain/routePlan'

// Datos ficticios de la pantalla de diseño (Rutas.dc.html).
const DEMO_SCOPE: PlanningScope = { pendingOrders: 39, districts: 4, availableVehicles: 13, totalVehicles: 15, vehiclesInService: 2 }

const DEMO_PROPOSAL: RouteProposal = {
  routeCount: 13,
  ordersAssigned: 39,
  totalKm: 1284,
  kmSaved: 212,
  co2Kg: 95,
  co2SavedPercent: 19,
  windowCompliance: 96,
  windowTarget: 90,
  elapsedSeconds: 31,
  routes: [
    { plate: 'ABC-123', driver: 'Luis Huamán', zone: 'San Juan de Lurigancho', fuel: 'GNV', stops: 18, km: 96, load: 0.82, co2Kg: 7.1 },
    { plate: 'BCD-456', driver: 'Rosa Mendoza', zone: 'El Agustino', fuel: 'DIESEL', stops: 21, km: 88, load: 0.91, co2Kg: 8.9 },
    { plate: 'EGH-567', driver: 'Carmen Ríos', zone: 'Santa Anita', fuel: 'HIBRIDO', stops: 16, km: 74, load: 0.7, co2Kg: 5.8 },
    { plate: 'FHJ-890', driver: 'Jorge Salas', zone: 'Ate', fuel: 'GNV', stops: 19, km: 102, load: 0.88, co2Kg: 7.6 },
    { plate: 'DFG-234', driver: 'Pedro Quispe', zone: 'San Juan de Lurigancho', fuel: 'GNV', stops: 20, km: 110, load: 0.85, co2Kg: 6.4 },
    { plate: 'HKL-345', driver: 'Ana Torres', zone: 'Santa Anita', fuel: 'ELECTRICO', stops: 15, km: 61, load: 0.64, co2Kg: 0 },
  ],
}

/** Solo demostración: lo que se planifica es ficticio y nada se guarda. */
export class DemoPlanningSource implements PlanningSource {
  private readonly value: PlanningScope
  constructor(overrides: Partial<PlanningScope> = {}) {
    this.value = { ...DEMO_SCOPE, ...overrides }
  }
  async scope() {
    return { ...this.value }
  }
}

/** Sustituye al motor real (EN-01) con la propuesta del diseño; no calcula nada. */
export class DemoRouteOptimizer implements RouteOptimizer {
  private readonly stepMs: number
  constructor(options: { stepMs?: number } = {}) {
    this.stepMs = options.stepMs ?? 450
  }
  async optimize(_scope: PlanningScope, _settings: unknown, onProgress?: (progress: PlanningProgress) => void): Promise<RouteProposal> {
    for (let step = 0; step < PLANNING_STEPS.length; step++) {
      onProgress?.({ step, fraction: step / PLANNING_STEPS.length })
      if (this.stepMs > 0) await new Promise(resolve => setTimeout(resolve, this.stepMs))
    }
    onProgress?.({ step: PLANNING_STEPS.length - 1, fraction: 1 })
    return { ...DEMO_PROPOSAL, routes: DEMO_PROPOSAL.routes.map(route => ({ ...route })) }
  }
}

/** Fuera del modo demostración aún no hay motor: se avisa en lugar de inventar rutas. */
export class UnavailableRouteOptimizer implements RouteOptimizer {
  async optimize(): Promise<RouteProposal> {
    throw new RoutePlanningError('El motor de optimización aún no está integrado (EN-01). Usa el modo demostración para ver una propuesta de ejemplo.')
  }
}
