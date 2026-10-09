import type { DashboardGateway, SummaryParams } from '../domain/gateway'
import type { DashboardSummary, District } from '../domain/types'
import {
  toDashboardSummary,
  toDistrict,
  type DashboardSummaryDto,
  type DistrictDto,
} from './mappers'

export interface HttpDashboardGatewayOptions {
  baseUrl?: string
  fetchImpl?: typeof fetch
}

export class HttpDashboardGateway implements DashboardGateway {
  private readonly baseUrl: string
  private readonly fetchImpl: typeof fetch

  constructor(options: HttpDashboardGatewayOptions = {}) {
    this.baseUrl = options.baseUrl ?? import.meta.env.VITE_API_BASE_URL ?? ''
    this.fetchImpl = options.fetchImpl ?? ((...args) => fetch(...args))
  }

  async getSummary(params: SummaryParams, signal?: AbortSignal): Promise<DashboardSummary> {
    const query = new URLSearchParams()
    if (params.date) query.set('date', params.date)
    if (params.districtId) query.set('district', params.districtId)
    const qs = query.toString()
    const dto = await this.getJson<DashboardSummaryDto>(
      `/api/v1/dashboard${qs ? `?${qs}` : ''}`,
      signal,
    )
    return toDashboardSummary(dto)
  }

  async listDistricts(signal?: AbortSignal): Promise<District[]> {
    const dtos = await this.getJson<DistrictDto[]>('/api/v1/dashboard/districts', signal)
    return dtos.map(toDistrict)
  }

  private async getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
    const response = await this.fetchImpl(`${this.baseUrl}${path}`, { signal, credentials: 'include' })
    if (!response.ok) {
      throw new Error(`Dashboard request failed with status ${response.status}`)
    }
    return (await response.json()) as T
  }
}
