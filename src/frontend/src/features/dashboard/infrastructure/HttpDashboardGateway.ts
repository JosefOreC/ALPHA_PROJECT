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
    if (params.date && !/^\d{4}-\d{2}-\d{2}$/.test(params.date)) throw new Error('La fecha del dashboard no es válida.')
    if (params.districtId && !/^\d{6}$/.test(params.districtId)) throw new Error('El distrito del dashboard no es válido.')
    const query = new URLSearchParams()
    if (params.date) query.set('date', params.date)
    if (params.districtId) query.set('district', params.districtId)
    const qs = query.toString()
    const dto = await this.getJson<DashboardSummaryDto>(
      'summary',
      signal,
      qs,
    )
    return toDashboardSummary(dto)
  }

  async listDistricts(signal?: AbortSignal): Promise<District[]> {
    const dtos = await this.getJson<DistrictDto[]>('districts', signal)
    return dtos.map(toDistrict)
  }

  private async getJson<T>(resource: 'summary' | 'districts', signal?: AbortSignal, query = ''): Promise<T> {
    const path = resource === 'summary' ? '/api/v1/dashboard' : '/api/v1/dashboard/districts'
    const response = await this.fetchImpl(`${this.baseUrl}${path}${query ? '?' + query : ''}`, { signal, credentials: 'include' })
    if (!response.ok) {
      throw new Error(`Dashboard request failed with status ${response.status}`)
    }
    return (await response.json()) as T
  }
}
