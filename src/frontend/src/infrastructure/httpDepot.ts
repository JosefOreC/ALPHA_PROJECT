import type { Depot, DepotSettings } from '../domain/depot'
import { requestJson } from './httpClient'

export const httpDepot: DepotSettings = {
  load: signal => requestJson<Depot | null>('/api/admin/depot', { signal }),
  save: depot => requestJson<Depot>('/api/admin/depot', { method: 'PUT', body: depot }),
}
