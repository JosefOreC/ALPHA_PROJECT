import { describe, expect, it } from 'vitest'
import { toDashboardSummary } from './mappers'

const dto = {
  day: '2026-10-01',
  district_id: null,
  has_routes: true,
  orders: { delivered: 812, in_transit: 96, pending: 312, cancelled: 28, total: 1248 },
  window_compliance: { evaluated: 813, within_window: 751, percentage: 92.4, target: 90.0 },
  fleet_distance_km: 3482.6,
  co2_kg: 912.4,
  operating_hours: { start: '05:00:00', end: '22:00:00' },
  in_progress: true,
  generated_at: '2026-10-01T12:00:00-05:00',
}

describe('toDashboardSummary', () => {
  it('maps the snake_case backend payload to the camelCase domain summary', () => {
    expect(toDashboardSummary(dto)).toEqual({
      day: '2026-10-01',
      districtId: null,
      hasRoutes: true,
      orders: { delivered: 812, inTransit: 96, pending: 312, cancelled: 28, total: 1248 },
      windowCompliance: { evaluated: 813, withinWindow: 751, percentage: 92.4, target: 90 },
      fleetDistanceKm: 3482.6,
      co2Kg: 912.4,
      operatingHours: { start: '05:00:00', end: '22:00:00' },
      inProgress: true,
      generatedAt: '2026-10-01T12:00:00-05:00',
    })
  })

  it('keeps a null compliance percentage when there are no routes', () => {
    const empty = {
      ...dto,
      has_routes: false,
      window_compliance: { evaluated: 0, within_window: 0, percentage: null, target: null },
    }
    const summary = toDashboardSummary(empty)
    expect(summary.hasRoutes).toBe(false)
    expect(summary.windowCompliance.percentage).toBeNull()
    expect(summary.windowCompliance.target).toBeNull()
  })
})
