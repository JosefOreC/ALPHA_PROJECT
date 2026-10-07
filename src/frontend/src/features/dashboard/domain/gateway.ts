import type { DashboardInsights, DashboardSummary, District } from './types'

export interface SummaryParams {
  /** YYYY-MM-DD; omitted = today (server decides). */
  date?: string
  /** Empty or omitted = all districts. */
  districtId?: string
}

/** Port: how the dashboard obtains its data. */
export interface DashboardGateway {
  getSummary(params: SummaryParams, signal?: AbortSignal): Promise<DashboardSummary>
  listDistricts(signal?: AbortSignal): Promise<District[]>
}

/** Port: lo que el tablero muestra además de los indicadores (CO₂ evitado y pedidos en riesgo). */
export interface DashboardInsightsGateway {
  getInsights(params: SummaryParams, signal?: AbortSignal): Promise<DashboardInsights>
}
