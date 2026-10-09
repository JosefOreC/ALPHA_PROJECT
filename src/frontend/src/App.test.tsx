import { render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import App from './App'

afterEach(() => vi.unstubAllGlobals())

it('renders the dashboard fed by the HTTP backend', async () => {
  const fetchStub = vi.fn(async (url: string) =>
    Response.json(
      url.endsWith('/api/session') ? { subject_id: 'user-1', name: 'Administrador', role: 'admin', driver_id: null, plate: null, csrf_token: 'verified-token' }
      : url.includes('/api/dashboard/insights') ? { co2Avoided: null, atRisk: [], riskMinutes: 30, suggestion: null }
      : url.endsWith('/api/map') ? { depot: null, orders: [], routes: [], vehicles: [] }
      : url.endsWith('/districts')
        ? [{ id: '150103', name: 'Ate' }]
        : {
            day: '2026-10-01',
            district_id: null,
            has_routes: true,
            orders: { delivered: 1, in_transit: 0, pending: 0, cancelled: 0, total: 1 },
            window_compliance: { evaluated: 1, within_window: 1, percentage: 100, target: 90 },
            fleet_distance_km: 5,
            co2_kg: 1,
            operating_hours: { start: '05:00:00', end: '22:00:00' },
            in_progress: true,
            generated_at: '2026-10-01T12:00:00-05:00',
          },
    ),
  )
  vi.stubGlobal('fetch', fetchStub)

  render(<App />)

  expect(await screen.findByText('Entregados')).toBeInTheDocument()
  expect(screen.getByRole('heading', { level: 1, name: 'Dashboard del día' })).toBeInTheDocument()
  expect(fetchStub.mock.calls.map(([url]) => url)).toContain('/api/v1/dashboard')
})
