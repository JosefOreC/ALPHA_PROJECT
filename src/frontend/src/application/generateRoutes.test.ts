import { describe, expect, it, vi } from 'vitest'
import type { PlanningSource } from '../domain/ports/planningSource'
import type { RouteOptimizer } from '../domain/ports/routeOptimizer'
import { DEFAULT_ROUTE_SETTINGS, NO_VEHICLES_MESSAGE, NoVehiclesAvailableError, PLANNING_STEPS } from '../domain/routePlan'
import type { PlanningScope } from '../domain/routePlan'
import { DemoPlanningSource, DemoRouteOptimizer, UnavailableRouteOptimizer } from '../infrastructure/demoRoutePlanning'
import { createLivePlanningSource } from '../infrastructure/livePlanningSource'
import type { Vehicle } from '../types/vehicle'
import { createGenerateRoutes } from './generateRoutes'

const scope = (over: Partial<PlanningScope> = {}): PlanningScope => ({ pendingOrders: 10, districts: 2, availableVehicles: 3, totalVehicles: 4, vehiclesInService: 1, ...over })
const planning = (value: PlanningScope): PlanningSource => ({ scope: async () => value })
const proposal = await new DemoRouteOptimizer({ stepMs: 0 }).optimize(scope(), DEFAULT_ROUTE_SETTINGS)

describe('GenerateRoutes', () => {
  it('sin vehículos disponibles no ejecuta el motor y avisa con el mensaje de US-005', async () => {
    const optimize = vi.fn()
    const service = createGenerateRoutes({ optimizer: { optimize }, planning: planning(scope({ availableVehicles: 0 })) })
    await expect(service.generate(DEFAULT_ROUTE_SETTINGS)).rejects.toBeInstanceOf(NoVehiclesAvailableError)
    await expect(service.generate(DEFAULT_ROUTE_SETTINGS)).rejects.toThrow(NO_VEHICLES_MESSAGE)
    expect(optimize).not.toHaveBeenCalled()
  })

  it('sin pedidos pendientes tampoco ejecuta el motor', async () => {
    const optimize = vi.fn()
    const service = createGenerateRoutes({ optimizer: { optimize }, planning: planning(scope({ pendingOrders: 0 })) })
    await expect(service.generate(DEFAULT_ROUTE_SETTINGS)).rejects.toThrow('No hay pedidos pendientes')
    expect(optimize).not.toHaveBeenCalled()
  })

  it('entrega al motor el alcance y la configuración, y devuelve su propuesta', async () => {
    const optimize = vi.fn(async () => proposal)
    const current = scope()
    const settings = { goal: 'time', respectWindows: false, prioritizeLowEmission: false } as const
    const service = createGenerateRoutes({ optimizer: { optimize }, planning: planning(current) })
    await expect(service.generate(settings)).resolves.toBe(proposal)
    expect(optimize).toHaveBeenCalledWith(current, settings, undefined)
  })

  it('corta el cálculo al superar el tiempo máximo', async () => {
    const slow: RouteOptimizer = { optimize: () => new Promise(() => {}) }
    const service = createGenerateRoutes({ optimizer: slow, planning: planning(scope()), timeoutMs: 20 })
    await expect(service.generate(DEFAULT_ROUTE_SETTINGS)).rejects.toThrow('tiempo máximo')
  })

  it('expone el alcance de la planificación', async () => {
    const service = createGenerateRoutes({ optimizer: new UnavailableRouteOptimizer(), planning: planning(scope()) })
    expect((await service.scope()).availableVehicles).toBe(3)
  })
})

describe('adaptadores', () => {
  it('el motor demo reporta los 4 pasos en orden y devuelve la propuesta del diseño', async () => {
    const seen: number[] = []
    const result = await new DemoRouteOptimizer({ stepMs: 0 }).optimize(scope(), DEFAULT_ROUTE_SETTINGS, p => seen.push(p.step))
    expect(seen.slice(0, PLANNING_STEPS.length)).toEqual([0, 1, 2, 3])
    expect(result).toMatchObject({ routeCount: 13, ordersAssigned: 39, totalKm: 1284, co2Kg: 95, windowCompliance: 96 })
    expect(result.routes).toHaveLength(6)
  })

  it('el motor no integrado avisa en lugar de inventar rutas', async () => {
    await expect(new UnavailableRouteOptimizer().optimize()).rejects.toThrow('EN-01')
  })

  it('el alcance demo admite sobrescrituras', async () => {
    expect(await new DemoPlanningSource({ availableVehicles: 0 }).scope()).toMatchObject({ availableVehicles: 0, pendingOrders: 39 })
  })

  it('el alcance real combina pedidos pendientes y flota operativa', async () => {
    const vehicle = (placa: string, estado: Vehicle['estado']): Vehicle => ({ vehiculo_id: placa, placa, capacidad_kg: 1, tipo_combustible: 'GNV', estado, disponible: estado === 'DISPONIBLE', activo: true, creado_en: '' })
    const order = (id: string, district: string) => ({ id, district }) as never
    const list = vi.fn(async () => ({ items: [order('1', 'Ate'), order('2', 'Ate'), order('3', 'Santa Anita')], limit: 100, offset: 0, has_more: false }))
    const source = createLivePlanningSource(
      { list },
      { getVehicles: async () => ({ data: { vehiculos: [vehicle('A', 'DISPONIBLE'), vehicle('B', 'EN_RUTA'), vehicle('C', 'MANTENIMIENTO'), vehicle('D', 'INACTIVO')] } }) },
    )
    expect(await source.scope()).toEqual({ pendingOrders: 3, districts: 2, availableVehicles: 1, totalVehicles: 3, vehiclesInService: 1 })
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ status: 'PENDIENTE' }))
  })
})
