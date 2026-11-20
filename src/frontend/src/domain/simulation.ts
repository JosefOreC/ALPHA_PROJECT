import type { PlannedRoute, RouteSettings } from './routePlan'

export interface SimulationMobile { id: string; x: number; y: number; capacity: number }
export interface SimulationOrder { id: string; x: number; y: number; weight: number; fromMinute: number; toMinute: number }
export interface Scenario { vehicles: SimulationMobile[]; orders: SimulationOrder[]; speedKmh: number; settings: RouteSettings }
export interface SimulationResult {
  simulation: true
  routeCount: number
  ordersAssigned: number
  totalKm: number
  co2Kg: number
  windowCompliance: number
  elapsedSeconds: number
  routes: (PlannedRoute & { points: { x: number; y: number }[] })[]
}
export interface SimulationEngine { calculate(scenario: Scenario, signal?: AbortSignal): Promise<SimulationResult> }

export function exampleScenario(): Scenario {
  return {
    vehicles: [{ id: 'Movil-1', x: 0, y: 0, capacity: 40 }, { id: 'Movil-2', x: 12, y: 8, capacity: 40 }],
    orders: Array.from({ length: 8 }, (_, i) => ({ id: `Pedido-${i + 1}`, x: (i * 7 + 3) % 17, y: (i * 3 + 2) % 13, weight: 8, fromMinute: 0, toMinute: 480 })),
    speedKmh: 25,
    settings: { goal: 'distance', respectWindows: true, prioritizeLowEmission: false, returnToDepot: false },
  }
}
