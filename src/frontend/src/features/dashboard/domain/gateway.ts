import type { DashboardSummary, District } from './types'

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
