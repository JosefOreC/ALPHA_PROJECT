import type { DashboardGateway, SummaryParams } from '../domain/gateway'
import type { DashboardSummary, District } from '../domain/types'

export function makeSummary(overrides: Partial<DashboardSummary> = {}): DashboardSummary {
  return {
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
    ...overrides,
  }
}

export const emptySummary = (): DashboardSummary =>
  makeSummary({
    hasRoutes: false,
    orders: { delivered: 0, inTransit: 0, pending: 0, cancelled: 0, total: 0 },
    windowCompliance: { evaluated: 0, withinWindow: 0, percentage: null, target: null },
    fleetDistanceKm: 0,
    co2Kg: 0,
  })

export const districts: District[] = [
  { id: '150103', name: 'Ate' },
  { id: '150122', name: 'Miraflores' },
]

export interface PendingCall {
  params: SummaryParams
  signal?: AbortSignal
  resolve: (summary: DashboardSummary) => void
  reject: (error: unknown) => void
}

/** Gateway whose summary calls stay pending until the test settles them. */
export function makeControlledGateway() {
  const calls: PendingCall[] = []
  const gateway: DashboardGateway = {
    getSummary(params, signal) {
      return new Promise<DashboardSummary>((resolve, reject) => {
        calls.push({ params, signal, resolve, reject })
      })
    },
    listDistricts: async () => districts,
  }
  return { gateway, calls }
}

/** Gateway that answers each call from a script of results (value or Error). */
export function makeScriptedGateway(script: Array<DashboardSummary | Error>) {
  const calls: SummaryParams[] = []
  let index = 0
  const gateway: DashboardGateway = {
    async getSummary(params) {
      calls.push(params)
      const next = script[Math.min(index++, script.length - 1)]
      if (next instanceof Error) throw next
      return next
    },
    listDistricts: async () => districts,
  }
  return { gateway, calls }
}
