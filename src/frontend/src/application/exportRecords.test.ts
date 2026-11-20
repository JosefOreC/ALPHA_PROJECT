import { expect, it, vi } from 'vitest'
import { createExportRecords } from './exportRecords'
import { createSimulateRoutes } from './simulateRoutes'

it('exporta columnas completas y protege fórmulas y comillas de CSV', () => {
  const save = vi.fn()
  createExportRecords({ save })([{ nombre: '=SUM(1)', detalle: { a: 1 }, valor: null }, { nombre: 'a"b', extra: 3 }])
  const [filename, content, mime] = save.mock.calls[0]
  expect(filename).toBe('auditoria.csv')
  expect(content).toContain("'=SUM(1)")
  expect(content).toContain('a""b')
  expect(content).toContain('extra')
  expect(mime).toContain('text/csv')
})
it('requiere entradas y propaga la señal al motor de simulación', async () => {
  const calculate = vi.fn().mockResolvedValue({ simulation: true })
  const execute = createSimulateRoutes({ calculate })
  await expect(execute({ vehicles: [], orders: [] } as never)).rejects.toThrow('Agrega')
  const scenario = { vehicles: [{}], orders: [{}] } as never
  const signal = new AbortController().signal
  expect(await execute(scenario, signal)).toEqual({ simulation: true })
  expect(calculate).toHaveBeenCalledWith(scenario, signal)
})
