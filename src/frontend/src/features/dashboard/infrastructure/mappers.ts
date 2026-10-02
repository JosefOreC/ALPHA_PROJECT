import type { DashboardSummary, District } from '../domain/types'

export interface DashboardSummaryDto {
  day: string
  district_id: string | null
  has_routes: boolean
  orders: {
    delivered: number
    in_transit: number
    pending: number
    cancelled: number
    total: number
  }
  window_compliance: {
    evaluated: number
    within_window: number
    percentage: number | null
    target: number | null
  }
  fleet_distance_km: number
  co2_kg: number
  operating_hours: { start: string; end: string }
  in_progress: boolean
  generated_at: string
}

export interface DistrictDto {
  id: string
  name: string
}

export function toDashboardSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    day: dto.day,
    districtId: dto.district_id,
    hasRoutes: dto.has_routes,
    orders: {
      delivered: dto.orders.delivered,
      inTransit: dto.orders.in_transit,
      pending: dto.orders.pending,
      cancelled: dto.orders.cancelled,
      total: dto.orders.total,
    },
    windowCompliance: {
      evaluated: dto.window_compliance.evaluated,
      withinWindow: dto.window_compliance.within_window,
      percentage: dto.window_compliance.percentage,
      target: dto.window_compliance.target,
    },
    fleetDistanceKm: dto.fleet_distance_km,
    co2Kg: dto.co2_kg,
    operatingHours: { start: dto.operating_hours.start, end: dto.operating_hours.end },
    inProgress: dto.in_progress,
    generatedAt: dto.generated_at,
  }
}

export function toDistrict(dto: DistrictDto): District {
  return { id: dto.id, name: dto.name }
}
