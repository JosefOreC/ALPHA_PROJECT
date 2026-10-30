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

/** Parada de la propuesta, en el orden en que se visita. */
export interface PlannedStop {
  id: string
  customer: string | null
  district: string
  /** Hora estimada de llegada (HH:MM, Lima). */
  eta: string
  onTime: boolean
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
  /** Duración estimada de la ruta, ida y vuelta al almacén. */
  minutes?: number
  /** Huella por km del vehículo: consumo × factor de emisión. */
  co2PerKm?: number
  fuelUsed?: { amount: number; unit: string }
  sequence?: PlannedStop[]
}

export interface RouteProposal {
  routeCount: number
  ordersAssigned: number
  totalKm: number
  kmSaved: number | null
  co2Kg: number
  co2SavedPercent: number | null
  /** CO₂ de la línea base: mismas paradas en orden de ventana con diésel; null sin factor diésel. */
  baselineCo2Kg?: number | null
  /** Porcentaje de pedidos que llegan dentro de su ventana. */
  windowCompliance: number
  windowTarget: number
  elapsedSeconds: number
  routes: PlannedRoute[]
}

/** Pasos informativos del cálculo, en orden. */
export const PLANNING_STEPS = [
  'Ordenar pedidos por cierre de ventana',
  'Insertar cada pedido donde menos cuesta',
  'Mejorar el orden de paradas (2-opt)',
  'Calcular combustible y CO₂',
] as const

export interface PlanningProgress {
  /** Índice del paso en curso dentro de PLANNING_STEPS. */
  step: number
  /** Avance total, de 0 a 1; null cuando la fuente no informa su avance. */
  fraction: number | null
}

/** Duración legible: «45 min» o «1 h 35 min». */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = Math.round(minutes % 60)
  return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${rest} min`
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
