import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { emptySummary, makeControlledGateway, makeScriptedGateway, makeSummary } from '../test/fakes'
import { useDashboard } from './useDashboard'

describe('useDashboard initial load', () => {
  it('starts loading and becomes ready with the summary and its update time', async () => {
    const { gateway, calls } = makeControlledGateway()
    const { result } = renderHook(() => useDashboard(gateway))

    expect(result.current.status).toBe('loading')
    expect(result.current.summary).toBeNull()

    await act(async () => calls[0].resolve(makeSummary()))

    expect(result.current.status).toBe('ready')
    expect(result.current.summary?.orders.total).toBe(1248)
    expect(result.current.lastUpdatedAt).toBeInstanceOf(Date)
  })

  it('reports empty when the day has no routes', async () => {
    const { gateway } = makeScriptedGateway([emptySummary()])
    const { result } = renderHook(() => useDashboard(gateway))

    await act(async () => {})

    expect(result.current.status).toBe('empty')
  })

  it('reports error when the first load fails and recovers on retry', async () => {
    const { gateway } = makeScriptedGateway([new Error('boom'), makeSummary()])
    const { result } = renderHook(() => useDashboard(gateway))

    await act(async () => {})
    expect(result.current.status).toBe('error')
    expect(result.current.summary).toBeNull()

    act(() => result.current.retry())
    expect(result.current.status).toBe('loading')
    await act(async () => {})

    expect(result.current.status).toBe('ready')
  })
})

describe('useDashboard polling and staleness', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('refreshes every refreshMs without going back to loading', async () => {
    const { gateway, calls } = makeScriptedGateway([
      makeSummary(),
      makeSummary({ co2Kg: 1000 }),
    ])
    const { result } = renderHook(() => useDashboard(gateway, { refreshMs: 60_000 }))
    await act(async () => {})
    expect(calls).toHaveLength(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000)
    })

    expect(calls).toHaveLength(2)
    expect(result.current.status).toBe('ready')
    expect(result.current.summary?.co2Kg).toBe(1000)
  })

  it('keeps the last good data and turns stale when a refresh fails', async () => {
    const { gateway } = makeScriptedGateway([makeSummary(), new Error('down')])
    const { result } = renderHook(() => useDashboard(gateway, { refreshMs: 1_000 }))
    await act(async () => {})
    const firstUpdate = result.current.lastUpdatedAt

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })

    expect(result.current.status).toBe('stale')
    expect(result.current.summary?.orders.total).toBe(1248)
    expect(result.current.lastUpdatedAt).toBe(firstUpdate)
  })

  it('leaves stale after a successful retry', async () => {
    const { gateway } = makeScriptedGateway([makeSummary(), new Error('down'), makeSummary()])
    const { result } = renderHook(() => useDashboard(gateway, { refreshMs: 1_000 }))
    await act(async () => {})
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })
    expect(result.current.status).toBe('stale')

    await act(async () => result.current.retry())

    expect(result.current.status).toBe('ready')
  })

  it('stops polling after unmount and aborts the in-flight request', async () => {
    const { gateway, calls } = makeControlledGateway()
    const { unmount } = renderHook(() => useDashboard(gateway, { refreshMs: 1_000 }))
    await act(async () => calls[0].resolve(makeSummary()))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000)
    })
    expect(calls).toHaveLength(2)

    unmount()
    await vi.advanceTimersByTimeAsync(5_000)

    expect(calls[1].signal?.aborted).toBe(true)
    expect(calls).toHaveLength(2)
  })
})

describe('useDashboard district selection', () => {
  it('loads the district list for the filter', async () => {
    const { gateway } = makeScriptedGateway([makeSummary()])
    const { result } = renderHook(() => useDashboard(gateway))
    await act(async () => {})

    expect(result.current.districts.map((d) => d.name)).toEqual(['Ate', 'Miraflores'])
  })

  it('shows loading, requests that district and announces the result', async () => {
    const { gateway, calls } = makeControlledGateway()
    const { result } = renderHook(() => useDashboard(gateway))
    await act(async () => calls[0].resolve(makeSummary()))
    expect(result.current.liveMessage).toBe('')

    act(() => result.current.selectDistrict('150103'))

    expect(result.current.status).toBe('loading')
    expect(result.current.districtId).toBe('150103')
    expect(calls[0].signal?.aborted).toBe(true)
    expect(calls[1].params).toEqual({ districtId: '150103' })

    await act(async () => calls[1].resolve(makeSummary({ districtId: '150103' })))

    expect(result.current.status).toBe('ready')
    expect(result.current.liveMessage).toBe('Indicadores actualizados para Ate.')
  })

  it('ignores a response that arrives after the district changed', async () => {
    const { gateway, calls } = makeControlledGateway()
    const { result } = renderHook(() => useDashboard(gateway))
    await act(async () => {})

    act(() => result.current.selectDistrict('150122'))
    await act(async () => calls[0].resolve(makeSummary({ co2Kg: 1 })))

    expect(result.current.status).toBe('loading')
    expect(result.current.summary).toBeNull()
  })
})
