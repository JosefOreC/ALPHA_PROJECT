import { describe, expect, it } from 'vitest'
import { HttpDashboardGateway } from './HttpDashboardGateway'

interface Call {
  url: string
  init?: RequestInit
}

function stubFetch(body: unknown, status = 200) {
  const calls: Call[] = []
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, init })
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    })
  }) as typeof fetch
  return { calls, fetchImpl }
}

const summaryBody = {
  day: '2026-10-01',
  district_id: '150103',
  has_routes: true,
  orders: { delivered: 1, in_transit: 2, pending: 3, cancelled: 4, total: 10 },
  window_compliance: { evaluated: 5, within_window: 4, percentage: 80, target: 90 },
  fleet_distance_km: 10.5,
  co2_kg: 2.5,
  operating_hours: { start: '05:00:00', end: '22:00:00' },
  in_progress: false,
  generated_at: '2026-10-01T12:00:00-05:00',
}

describe('HttpDashboardGateway.getSummary', () => {
  it('requests the dashboard endpoint with date and district and returns the mapped summary', async () => {
    const { calls, fetchImpl } = stubFetch(summaryBody)
    const gateway = new HttpDashboardGateway({ baseUrl: 'http://api.test', fetchImpl })
    const controller = new AbortController()

    const summary = await gateway.getSummary(
      { date: '2026-10-01', districtId: '150103' },
      controller.signal,
    )

    expect(calls[0].url).toBe('http://api.test/api/v1/dashboard?date=2026-10-01&district=150103')
    expect(calls[0].init?.signal).toBe(controller.signal)
    expect(summary.districtId).toBe('150103')
    expect(summary.orders.inTransit).toBe(2)
  })

  it('omits query parameters that are empty', async () => {
    const { calls, fetchImpl } = stubFetch(summaryBody)
    const gateway = new HttpDashboardGateway({ baseUrl: '', fetchImpl })

    await gateway.getSummary({ districtId: '' })

    expect(calls[0].url).toBe('/api/v1/dashboard')
  })

  it('throws when the server answers with a non-2xx status', async () => {
    const { fetchImpl } = stubFetch({ detail: 'Distrito no encontrado' }, 404)
    const gateway = new HttpDashboardGateway({ baseUrl: '', fetchImpl })

    await expect(gateway.getSummary({ districtId: 'zzz' })).rejects.toThrow(/404/)
  })
})

describe('HttpDashboardGateway.listDistricts', () => {
  it('returns the districts from the backend', async () => {
    const { calls, fetchImpl } = stubFetch([{ id: '150103', name: 'Ate' }])
    const gateway = new HttpDashboardGateway({ baseUrl: '', fetchImpl })

    await expect(gateway.listDistricts()).resolves.toEqual([{ id: '150103', name: 'Ate' }])
    expect(calls[0].url).toBe('/api/v1/dashboard/districts')
  })

  it('throws when the districts request fails', async () => {
    const { fetchImpl } = stubFetch({}, 500)
    const gateway = new HttpDashboardGateway({ baseUrl: '', fetchImpl })

    await expect(gateway.listDistricts()).rejects.toThrow(/500/)
  })
})
