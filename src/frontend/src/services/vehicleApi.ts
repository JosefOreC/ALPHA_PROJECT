import type { CreateVehicleInput, UpdateVehicleInput, Vehicle, VehicleListResponse } from '../types/vehicle'
import { requestJson } from '../infrastructure/httpClient'
class VehicleApiService {
  async getVehicles(status?: string, onlyAvailable?: boolean) {
    const query = new URLSearchParams()
    if (status) query.set('status', status)
    if (onlyAvailable) query.set('only_available', 'true')
    return { data: await requestJson<VehicleListResponse>(`/api/v1/vehicles?${query}`), isLocal: false }
  }
  async createVehicle(input: CreateVehicleInput) {
    return { data: await requestJson<Vehicle>('/api/v1/vehicles', { method: 'POST', body: { ...input, placa: input.placa.trim().toUpperCase() } }), isLocal: false }
  }
  async updateVehicle(id: string, input: UpdateVehicleInput) {
    return { data: await requestJson<Vehicle>(`/api/v1/vehicles/${encodeURIComponent(id)}`, { method: 'PUT', body: input }), isLocal: false }
  }
  isUsingLocalFallback() { return false }
}
export const vehicleApi = new VehicleApiService()
