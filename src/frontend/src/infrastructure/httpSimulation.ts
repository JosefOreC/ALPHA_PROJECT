import type { SimulationEngine, SimulationResult } from '../domain/simulation'
import { requestJson } from './httpClient'

export const httpSimulation: SimulationEngine = {
  calculate: (scenario, signal) => requestJson<SimulationResult>('/api/routes/simulate', { method: 'POST', body: scenario, signal }),
}
