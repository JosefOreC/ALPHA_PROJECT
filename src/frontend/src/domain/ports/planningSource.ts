import type { PlanningScope } from '../routePlan'

/** Fuente de lo que se va a planificar: pedidos pendientes y vehículos disponibles. */
export interface PlanningSource {
  scope(): Promise<PlanningScope>
}
