export interface Depot {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
}
export interface DepotSettings {
  load(signal?: AbortSignal): Promise<Depot | null>
  save(depot: Depot): Promise<Depot>
}
