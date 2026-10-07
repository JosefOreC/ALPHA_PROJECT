export type RouteGoal = 'co2' | 'balanced' | 'time'

export interface RouteSettings {
  goal: RouteGoal
  respectWindows: boolean
  prioritizeLowEmission: boolean
}

export const DEFAULT_ROUTE_SETTINGS: RouteSettings = { goal: 'co2', respectWindows: true, prioritizeLowEmission: true }

/** Qué se va a planificar: pedidos pendientes y flota disponible. */
export interface PlanningScope {
  pendingOrders: number
  districts: number
  availableVehicles: number
  totalVehicles: number
  vehiclesInService: number
}

export interface PlannedRoute {
  plate: string
  driver: string
  zone: string
  fuel: string
  stops: number
  km: number
  /** Ocupación de la carga, de 0 a 1. */
  load: number
  co2Kg: number
}

export interface RouteProposal {
  routeCount: number
  ordersAssigned: number
  totalKm: number
  kmSaved: number
  co2Kg: number
  co2SavedPercent: number
  /** Porcentaje de pedidos que llegan dentro de su ventana. */
  windowCompliance: number
  windowTarget: number
  elapsedSeconds: number
  routes: PlannedRoute[]
}

/** Pasos informativos del cálculo, en orden. */
export const PLANNING_STEPS = [
  'Agrupar pedidos por distrito y ventana',
  'Asignar vehículos según capacidad',
  'Ordenar paradas (VRPTW)',
  'Calcular combustible y CO₂',
] as const

export interface PlanningProgress {
  /** Índice del paso en curso dentro de PLANNING_STEPS. */
  step: number
  /** Avance total, de 0 a 1. */
  fraction: number
}

export const NO_VEHICLES_MESSAGE = 'No hay vehículos disponibles para generar rutas en este momento'

export class RoutePlanningError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RoutePlanningError'
  }
}

export class NoVehiclesAvailableError extends RoutePlanningError {
  constructor() {
    super(NO_VEHICLES_MESSAGE)
    this.name = 'NoVehiclesAvailableError'
  }
}
