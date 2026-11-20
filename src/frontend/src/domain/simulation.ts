import type { PlannedRoute, RouteSettings } from './routePlan'
import type { GeoPoint } from './mapData'

export interface SimulationMobile extends GeoPoint { id: string; capacity: number }
export interface SimulationOrder extends GeoPoint { id: string; weight: number; fromMinute: number; toMinute: number }
export interface Scenario { vehicles: SimulationMobile[]; orders: SimulationOrder[]; settings: RouteSettings }
export interface SimulationResult {
  simulation: true
  routeCount: number
  ordersAssigned: number
  totalKm: number
  co2Kg: number
  windowCompliance: number
  elapsedSeconds: number
  routes: (PlannedRoute & { path: GeoPoint[] })[]
}
export interface SimulationEngine { calculate(scenario: Scenario, signal?: AbortSignal): Promise<SimulationResult> }

export function exampleScenario(): Scenario {
  return {
    vehicles: [{ id: 'Movil-1', lat: -12.043, lng: -76.95, capacity: 40 }, { id: 'Movil-2', lat: -12.054, lng: -76.972, capacity: 40 }],
    orders: [
      { lat: -12.045, lng: -76.956 }, { lat: -12.048, lng: -76.96 },
      { lat: -12.052, lng: -76.966 }, { lat: -12.056, lng: -76.974 },
    ].map((point, i) => ({ ...point, id: `Pedido-${i + 1}`, weight: 8, fromMinute: 0, toMinute: 480 })),
    settings: { goal: 'distance', respectWindows: true, prioritizeLowEmission: false, returnToDepot: false },
  }
}

export function emptyScenario(): Scenario {
  return { ...exampleScenario(), vehicles: [], orders: [] }
}
