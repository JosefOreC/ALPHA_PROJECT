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
