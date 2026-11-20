import { expect, it, vi } from 'vitest'
import { requestJson } from './httpClient'
import { httpSimulation } from './httpSimulation'
import { httpDepot } from './httpDepot'
import { exampleScenario } from '../domain/simulation'

vi.mock('./httpClient', () => ({ requestJson: vi.fn().mockResolvedValue({}) }))
it('envía escenarios al endpoint independiente y conserva la cancelación', async () => {
  const scenario = exampleScenario(), signal = new AbortController().signal
  await httpSimulation.calculate(scenario, signal)
  expect(requestJson).toHaveBeenCalledWith('/api/routes/simulate', { method: 'POST', body: scenario, signal })
})
it('consulta y guarda el almacén por el adaptador HTTP', async () => {
  const signal = new AbortController().signal
  await httpDepot.load(signal)
  expect(requestJson).toHaveBeenCalledWith('/api/admin/depot', { signal })
  const depot = { name: 'Central', address: 'Dirección', latitude: -12, longitude: -77 }
  await httpDepot.save(depot)
  expect(requestJson).toHaveBeenCalledWith('/api/admin/depot', { method: 'PUT', body: depot })
})
