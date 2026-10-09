import type { AdminUser, Integration, NewUser, UserPage } from '../domain/admin'
import type { AlgorithmParameters } from '../domain/algorithmSettings'
import type { DriverRoute } from '../domain/driverRoute'
import type { MapData } from '../domain/mapData'
import type { PlanningProgress, PlanningScope, RouteProposal, RouteSettings } from '../domain/routePlan'
import type { ReportPeriod, SustainabilityReport } from '../domain/sustainability'
import type { DashboardInsights } from '../features/dashboard/domain/types'
import type { SummaryParams } from '../features/dashboard/domain/gateway'
import { requestJson } from './httpClient'

export class HttpUserDirectory {
  list(signal?: AbortSignal) { return requestJson<UserPage>('/api/admin/users', { signal }) }
  create(data: NewUser) { return requestJson<AdminUser>('/api/admin/users', { method: 'POST', body: data }) }
}
export class HttpAlgorithmSettings {
  load() { return requestJson<AlgorithmParameters>('/api/admin/parameters') }
  save(data: AlgorithmParameters) { return requestJson<AlgorithmParameters>('/api/admin/parameters', { method: 'PUT', body: data }) }
}
export class HttpIntegrationCatalog {
  list(signal?: AbortSignal) { return requestJson<Integration[]>('/api/admin/integrations', { signal }) }
}
export class HttpMapData {
  load() { return requestJson<MapData>('/api/map') }
}
export class HttpDriverRoute {
  route() { return requestJson<DriverRoute>('/api/conductor/ruta') }
}
export class HttpSustainabilityReport {
  getReport(period: ReportPeriod, signal?: AbortSignal) { return requestJson<SustainabilityReport>(`/api/reports/sustainability?period=${period}`, { signal }) }
}
export class HttpPlanningSource {
  scope() { return requestJson<PlanningScope>('/api/routes/scope') }
}
export class HttpRouteOptimizer {
  async optimize(_scope: PlanningScope, settings: RouteSettings, onProgress?: (progress: PlanningProgress) => void) {
    onProgress?.({ step: 0, fraction: 0 })
    const result = await requestJson<RouteProposal>('/api/routes/proposal', { method: 'POST', body: settings })
    onProgress?.({ step: 3, fraction: 1 })
    return result
  }
}
export class HttpDashboardInsights {
  getInsights(params: SummaryParams, signal?: AbortSignal) {
    const query = new URLSearchParams()
    if (params.date) query.set('date', params.date)
    if (params.districtId) query.set('district', params.districtId)
    return requestJson<DashboardInsights>(`/api/dashboard/insights?${query}`, { signal })
  }
}
