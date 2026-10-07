import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { DashboardInsightsGateway, SummaryParams } from '../domain/gateway'
import type { DashboardInsights } from '../domain/types'
import { DemoDashboardInsights } from '../infrastructure/DemoDashboardInsights'
import { useDashboardInsights } from './useDashboardInsights'

const insights = (over: Partial<DashboardInsights> = {}): DashboardInsights => ({ co2Avoided: null, atRisk: [], riskMinutes: 60, suggestion: null, ...over })

describe('DemoDashboardInsights', () => {
  it('returns the design example with today as the last bar', async () => {
    const data = await new DemoDashboardInsights().getInsights()

    expect(data.co2Avoided).toMatchObject({ avoidedKg: 22, avoidedPercent: 19, fuelSavedLiters: 9, kmSaved: 212 })
    expect(data.co2Avoided?.weekly).toHaveLength(7)
    expect(data.co2Avoided?.weekly.filter((day) => day.today).map((day) => day.avoidedKg)).toEqual([22])
    expect(data.atRisk.map((order) => order.id)).toEqual(['PED-0022', 'PED-0044', 'PED-0052'])
    expect(data.riskMinutes).toBe(60)
  })
})

describe('useDashboardInsights', () => {
  it('reports unavailable when there is no source and never calls anything', () => {
    const { result } = renderHook(() => useDashboardInsights(undefined, ''))

    expect(result.current).toEqual({ status: 'unavailable', insights: null })
  })

  it('loads the insights for the chosen district', async () => {
    const getInsights = vi.fn(async (_params: SummaryParams) => insights({ suggestion: 'x' }))
    const gateway: DashboardInsightsGateway = { getInsights }
    const { result, rerender } = renderHook(({ district }) => useDashboardInsights(gateway, district), { initialProps: { district: '' } })
    expect(result.current.status).toBe('loading')

    await act(async () => {})
    expect(result.current.status).toBe('ready')
    expect(result.current.insights?.suggestion).toBe('x')
    expect(getInsights.mock.calls[0][0]).toEqual({ districtId: '' })

    rerender({ district: '150103' })
    await act(async () => {})
    expect(getInsights.mock.calls.at(-1)?.[0]).toEqual({ districtId: '150103' })
  })

  it('reports error when the first load fails', async () => {
    const gateway: DashboardInsightsGateway = { getInsights: async () => { throw new Error('down') } }
    const { result } = renderHook(() => useDashboardInsights(gateway, ''))

    await act(async () => {})

    expect(result.current).toEqual({ status: 'error', insights: null })
  })

  describe('polling', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('refreshes on the interval and keeps the last data when a refresh fails', async () => {
      const getInsights = vi.fn().mockResolvedValueOnce(insights({ suggestion: 'first' })).mockRejectedValueOnce(new Error('down'))
      const gateway: DashboardInsightsGateway = { getInsights }
      const { result } = renderHook(() => useDashboardInsights(gateway, '', { refreshMs: 1_000 }))
      await act(async () => {})
      expect(result.current.insights?.suggestion).toBe('first')

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1_000)
      })

      expect(getInsights).toHaveBeenCalledTimes(2)
      expect(result.current.status).toBe('ready')
      expect(result.current.insights?.suggestion).toBe('first')
    })

    it('stops polling and aborts the request after unmount', async () => {
      const signals: AbortSignal[] = []
      const gateway: DashboardInsightsGateway = {
        getInsights: (_params, signal) => {
          if (signal) signals.push(signal)
          return new Promise(() => {})
        },
      }
      const { unmount } = renderHook(() => useDashboardInsights(gateway, '', { refreshMs: 1_000 }))
      await act(async () => {})

      unmount()
      await vi.advanceTimersByTimeAsync(5_000)

      expect(signals).toHaveLength(1)
      expect(signals[0].aborted).toBe(true)
    })
  })
})
