import { useEffect, useState } from 'react'
import type { DashboardInsightsGateway } from '../domain/gateway'
import type { DashboardInsights } from '../domain/types'

export type InsightsStatus = 'unavailable' | 'loading' | 'ready' | 'error'

/** CO₂ evitado y pedidos en riesgo; sin gateway no hay fuente y el tablero lo indica. */
export function useDashboardInsights(
  gateway: DashboardInsightsGateway | undefined,
  districtId: string,
  { refreshMs = 60_000 }: { refreshMs?: number } = {},
) {
  const [state, setState] = useState<{ status: InsightsStatus; insights: DashboardInsights | null }>({
    status: 'loading',
    insights: null,
  })

  useEffect(() => {
    if (!gateway) return
    let controller: AbortController | null = null
    const load = () => {
      controller?.abort()
      const current = new AbortController()
      controller = current
      gateway.getInsights({ districtId }, current.signal).then(
        (insights) => {
          if (!current.signal.aborted) setState({ status: 'ready', insights })
        },
        () => {
          if (!current.signal.aborted) setState((prev) => ({ status: prev.insights ? 'ready' : 'error', insights: prev.insights }))
        },
      )
    }
    load()
    const timer = setInterval(load, refreshMs)
    return () => {
      clearInterval(timer)
      controller?.abort()
    }
  }, [gateway, districtId, refreshMs])

  return gateway ? state : { status: 'unavailable' as const, insights: null }
}
