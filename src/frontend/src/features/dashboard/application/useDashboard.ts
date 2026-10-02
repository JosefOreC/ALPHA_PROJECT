import { useCallback, useEffect, useRef, useState } from 'react'
import type { DashboardGateway } from '../domain/gateway'
import { ALL_DISTRICTS, type DashboardSummary, type District } from '../domain/types'

export type DashboardStatus = 'loading' | 'ready' | 'empty' | 'error' | 'stale'

interface State {
  status: DashboardStatus
  summary: DashboardSummary | null
  lastUpdatedAt: Date | null
}

const LOADING: State = { status: 'loading', summary: null, lastUpdatedAt: null }

export interface UseDashboardOptions {
  refreshMs?: number
}

export function useDashboard(
  gateway: DashboardGateway,
  { refreshMs = 60_000 }: UseDashboardOptions = {},
) {
  const [districtId, setDistrictId] = useState(ALL_DISTRICTS.id)
  const [districts, setDistricts] = useState<District[]>([])
  const [state, setState] = useState<State>(LOADING)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [districtChanged, setDistrictChanged] = useState(false)
  const refreshRef = useRef<() => void>(() => {})

  useEffect(() => {
    const controller = new AbortController()
    gateway.listDistricts(controller.signal).then(
      (list) => {
        if (!controller.signal.aborted) setDistricts(list)
      },
      () => {
        // The filter degrades to "Todos los distritos" only.
      },
    )
    return () => controller.abort()
  }, [gateway])

  useEffect(() => {
    let controller: AbortController | null = null

    const load = () => {
      controller?.abort()
      const current = new AbortController()
      controller = current
      setIsRefreshing(true)
      gateway.getSummary({ districtId }, current.signal).then(
        (summary) => {
          if (current.signal.aborted) return
          setIsRefreshing(false)
          setState({
            status: summary.hasRoutes ? 'ready' : 'empty',
            summary,
            lastUpdatedAt: new Date(),
          })
        },
        () => {
          if (current.signal.aborted) return
          setIsRefreshing(false)
          // Keep the last good data (stale) when there is some; otherwise it is a hard error.
          setState((prev) =>
            prev.summary ? { ...prev, status: 'stale' } : { ...LOADING, status: 'error' },
          )
        },
      )
    }

    refreshRef.current = load
    load()
    const timer = setInterval(load, refreshMs)
    return () => {
      clearInterval(timer)
      controller?.abort()
    }
  }, [gateway, districtId, refreshMs])

  const selectDistrict = useCallback((id: string) => {
    setDistrictChanged(true)
    setDistrictId(id)
    setState(LOADING)
  }, [])

  const retry = useCallback(() => {
    setState((prev) => (prev.summary ? prev : LOADING))
    refreshRef.current()
  }, [])

  const districtName =
    districtId === ALL_DISTRICTS.id
      ? ALL_DISTRICTS.name
      : (districts.find((d) => d.id === districtId)?.name ?? districtId)
  const settled = state.status !== 'loading' && state.status !== 'error'
  const liveMessage =
    districtChanged && settled ? `Indicadores actualizados para ${districtName}.` : ''

  return {
    ...state,
    isRefreshing,
    districts,
    districtId,
    districtName,
    liveMessage,
    selectDistrict,
    retry,
  }
}
