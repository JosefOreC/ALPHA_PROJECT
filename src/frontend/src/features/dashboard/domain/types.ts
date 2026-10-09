export interface OrdersBreakdown {
  delivered: number
  inTransit: number
  pending: number
  cancelled: number
  total: number
}

export interface WindowCompliance {
  evaluated: number
  withinWindow: number
  percentage: number | null
  target: number | null
}

export interface OperatingHours {
  start: string
  end: string
}

export interface DashboardSummary {
  day: string
  districtId: string | null
  hasRoutes: boolean
  orders: OrdersBreakdown
  windowCompliance: WindowCompliance
  fleetDistanceKm: number
  co2Kg: number
  operatingHours: OperatingHours
  inProgress: boolean
  generatedAt: string
}

export interface District {
  id: string
  name: string
}

/** Pseudo-district used by the filter to mean "no district restriction". */
export const ALL_DISTRICTS: District = { id: '', name: 'Todos los distritos' }

/** Un día de la semana en el gráfico de CO₂ evitado. */
export interface AvoidedDay {
  /** Inicial del día: L M X J V S D. */
  label: string
  avoidedKg: number
  today: boolean
}

/** CO₂ evitado frente a rutas sin optimizar. */
export interface Co2Avoided {
  avoidedKg: number
  avoidedPercent: number
  fuelSavedLiters: number | null
  kmSaved: number | null
  /** Últimos siete días, el último es hoy. */
  weekly: AvoidedDay[]
}

/** Pedido cuya ventana horaria está por vencer. */
export interface RiskOrder {
  id: string
  customer: string
  district: string
  /** «09:00–11:00», hora de Lima. */
  window: string
  status: 'inTransit' | 'pending'
  /** «llega 10:55», «sin conductor». */
  note: string
}

export interface DashboardInsights {
  co2Avoided: Co2Avoided | null
  atRisk: RiskOrder[]
  /** Minutos que se considera «en riesgo» (ventana por vencer). */
  riskMinutes: number
  suggestion: string | null
}
