import type { ApprovedRoutes, PlanningProgress, PlanningScope, RouteProposal, RouteSettings } from '../routePlan'

/** Puerto del motor de optimización (VRPTW / Green VRP). El adaptador real es EN-01. */
export interface RouteOptimizer {
  optimize(scope: PlanningScope, settings: RouteSettings, onProgress?: (progress: PlanningProgress) => void): Promise<RouteProposal>
  approve?(settings: RouteSettings, fingerprint: string): Promise<ApprovedRoutes>
}
