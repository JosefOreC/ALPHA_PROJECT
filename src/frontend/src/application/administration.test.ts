import { describe, expect, it, vi } from 'vitest'
import { EMISSION_FUELS, SettingsValidationError, sameParameters, validateParameters } from '../domain/algorithmSettings'
import type { AlgorithmParameters } from '../domain/algorithmSettings'
import type { AlgorithmSettings } from '../domain/ports/algorithmSettings'
import { DEFAULT_PARAMETERS, DemoAlgorithmSettings, DemoIntegrationCatalog, DemoUserDirectory, UnavailableAlgorithmSettings } from '../infrastructure/demoAdmin'
import { DemoPlanningSource, DemoRouteOptimizer } from '../infrastructure/demoRoutePlanning'
import { createAdministration } from './administration'
import { MAX_PLANNING_MS, createGenerateRoutes } from './generateRoutes'
import { DEFAULT_ROUTE_SETTINGS } from '../domain/routePlan'

const withChange = (change: Partial<AlgorithmParameters>): AlgorithmParameters => ({ ...DEFAULT_PARAMETERS, emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors }, ...change })

describe('valores de arranque', () => {
  it('son los del diseño y no inventan factores de emisión', () => {
    expect(DEFAULT_PARAMETERS).toMatchObject({ co2Weight: 70, maxSeconds: 45, maxLoadPercent: 95, windowSlackMinutes: 10, autoReoptimize: true })
    expect(DEFAULT_PARAMETERS.emissionFactors.DIESEL).toBe(2.68)
    expect(DEFAULT_PARAMETERS.emissionFactors.GASOLINA).toBe(2.31)
    // GNV y eléctrico (y los demás sin dato) quedan sin definir hasta que el proyecto confirme la fuente.
    for (const fuel of ['GLP', 'GNV', 'ELECTRICO', 'HIBRIDO'] as const) expect(DEFAULT_PARAMETERS.emissionFactors[fuel]).toBeNull()
    expect(Object.keys(DEFAULT_PARAMETERS.emissionFactors)).toEqual([...EMISSION_FUELS])
  })
})

describe('validateParameters', () => {
  it('acepta los valores de arranque y los extremos permitidos', () => {
    expect(validateParameters(DEFAULT_PARAMETERS)).toEqual({})
    expect(validateParameters(withChange({ co2Weight: 0, maxSeconds: 5, maxLoadPercent: 50, windowSlackMinutes: 0 }))).toEqual({})
    expect(validateParameters(withChange({ co2Weight: 100, maxSeconds: 120, maxLoadPercent: 100, windowSlackMinutes: 60 }))).toEqual({})
  })

  it('señala cada campo fuera de rango, con decimales o ilegible', () => {
    const errors = validateParameters(withChange({ co2Weight: 101, maxSeconds: 4, maxLoadPercent: 49.5, windowSlackMinutes: Number.NaN }))
    expect(Object.keys(errors).sort()).toEqual(['co2Weight', 'maxLoadPercent', 'maxSeconds', 'windowSlackMinutes'])
    expect(errors.maxSeconds).toBe('Indica un entero de 5 a 120 segundos.')
    expect(validateParameters(withChange({ co2Weight: -1 })).co2Weight).toBeDefined()
  })

  it('un factor sin definir es válido; cero, negativo o ilegible no', () => {
    expect(validateParameters(withChange({ emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors, GNV: null } }))).toEqual({})
    expect(validateParameters(withChange({ emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors, GNV: 1.9 } }))).toEqual({})
    for (const bad of [0, -2, Number.NaN, 101]) {
      const errors = validateParameters(withChange({ emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors, ELECTRICO: bad } }))
      expect(errors['factor:ELECTRICO'], String(bad)).toBeDefined()
    }
  })

  it('compara parámetros por valor, incluidos los factores', () => {
    expect(sameParameters(DEFAULT_PARAMETERS, withChange({}))).toBe(true)
    expect(sameParameters(DEFAULT_PARAMETERS, withChange({ maxSeconds: 46 }))).toBe(false)
    expect(sameParameters(DEFAULT_PARAMETERS, withChange({ emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors, GNV: 1 } }))).toBe(false)
    expect(sameParameters(DEFAULT_PARAMETERS, withChange({ autoReoptimize: false }))).toBe(false)
  })
})

describe('Administration', () => {
  const build = (settings: AlgorithmSettings) => createAdministration({ settings, users: new DemoUserDirectory(), integrations: new DemoIntegrationCatalog() })

  it('guarda los parámetros válidos mediante el puerto y devuelve lo almacenado', async () => {
    const settings = new DemoAlgorithmSettings()
    const service = build(settings)

    const stored = await service.saveParameters(withChange({ co2Weight: 40, emissionFactors: { ...DEFAULT_PARAMETERS.emissionFactors, GNV: 1.95 } }))

    expect(stored.co2Weight).toBe(40)
    expect(stored.emissionFactors.GNV).toBe(1.95)
    expect((await service.parameters()).co2Weight).toBe(40)
    expect((await settings.load()).emissionFactors.GNV).toBe(1.95)
  })

  it('con parámetros inválidos no llama al puerto y reporta qué campo falla', async () => {
    const save = vi.fn()
    const service = build({ load: async () => DEFAULT_PARAMETERS, save })

    const attempt = service.saveParameters(withChange({ maxSeconds: 500 }))

    await expect(attempt).rejects.toBeInstanceOf(SettingsValidationError)
    await attempt.catch((error: SettingsValidationError) => expect(Object.keys(error.errors)).toEqual(['maxSeconds']))
    expect(save).not.toHaveBeenCalled()
  })

  it('el demo no comparte estado entre instancias ni con quien lo lee', async () => {
    const settings = new DemoAlgorithmSettings()
    const loaded = await settings.load()
    loaded.co2Weight = 1
    loaded.emissionFactors.DIESEL = 9
    expect((await settings.load()).co2Weight).toBe(70)
    expect((await settings.load()).emissionFactors.DIESEL).toBe(2.68)
    expect((await new DemoAlgorithmSettings().load()).co2Weight).toBe(70)
  })

  it('sin almacenamiento en la API avisa en lugar de aparentar que guardó', async () => {
    const service = build(new UnavailableAlgorithmSettings())
    await expect(service.parameters()).rejects.toThrow('aún no tienen almacenamiento')
    await expect(service.saveParameters(DEFAULT_PARAMETERS)).rejects.toThrow('aún no tienen almacenamiento')
  })

  it('entrega usuarios con el conteo por rol y las integraciones', async () => {
    const service = build(new DemoAlgorithmSettings())
    const page = await service.users()
    expect(page.total).toBe(19)
    expect(page.roleCounts).toEqual({ admin: 1, planner: 3, driver: 13, logistics: 2 })
    expect(Object.values(page.roleCounts).reduce((sum, count) => sum + count, 0)).toBe(page.total)
    expect((await service.integrations()).map((item) => item.status)).toEqual(['connected', 'connected', 'pending'])
  })
})

describe('el tiempo máximo del algoritmo gobierna GenerateRoutes', () => {
  const routes = (settings?: AlgorithmSettings, timeoutMs?: number) =>
    createGenerateRoutes({ optimizer: new DemoRouteOptimizer({ stepMs: 0 }), planning: new DemoPlanningSource(), settings, timeoutMs })

  it('usa los segundos guardados y, sin parámetros legibles, los 45 s de la norma', async () => {
    const settings = new DemoAlgorithmSettings()
    expect(await routes(settings).limitSeconds()).toBe(45)
    await settings.save(withChange({ maxSeconds: 30 }))
    expect(await routes(settings).limitSeconds()).toBe(30)
    expect(await routes().limitSeconds()).toBe(MAX_PLANNING_MS / 1000)
    expect(await routes(new UnavailableAlgorithmSettings()).limitSeconds()).toBe(45)
  })

  it('corta el cálculo al llegar al tope configurado', async () => {
    const slow = { optimize: () => new Promise<never>(() => {}) }
    const service = createGenerateRoutes({
      optimizer: slow,
      planning: new DemoPlanningSource(),
      settings: { load: async () => withChange({ maxSeconds: 0.02 as unknown as number }), save: async (value) => value },
    })
    await expect(service.generate(DEFAULT_ROUTE_SETTINGS)).rejects.toThrow('tiempo máximo')
  })
})
