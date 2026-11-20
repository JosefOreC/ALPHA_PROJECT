import type { Scenario, SimulationEngine } from '../domain/simulation'

export function createSimulateRoutes(engine: SimulationEngine) {
  return async (scenario: Scenario, signal?: AbortSignal) => {
    if (!scenario.vehicles.length || !scenario.orders.length) throw new Error('Agrega al menos un móvil y un pedido.')
    return engine.calculate(scenario, signal)
  }
}
