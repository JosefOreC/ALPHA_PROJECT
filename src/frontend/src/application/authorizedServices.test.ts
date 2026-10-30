import { describe, expect, it, vi } from 'vitest'
import { authorizeDriver, authorizeManagement, authorizePlanning, authorizeSustainability } from './authorizedServices'
import { createManagement } from './manageOrders'
import { DemoManagement } from '../infrastructure/demoManagement'
import { createDriverOrders } from './driverOrders'
import { createDriverRoute } from './driverRoute'
import { DemoOrders } from '../infrastructure/demoOrders'
import type { GenerateRoutes } from './generateRoutes'
import type { SustainabilityService } from './getSustainabilityReport'
import type { SessionUser } from '../domain/session'

describe('Autorización antes de invocar adaptadores', () => {
  it('impide escrituras a un auditor aunque el adaptador permita editar', async () => {
    const base = createManagement(new DemoManagement())
    const cancel = vi.spyOn(base, 'cancel')
    const secured = authorizeManagement(base, 'auditor')
    expect(await secured.permissions()).toEqual({ can_write: false })
    const page = await secured.list({ limit: 20, offset: 0 })
    await expect(secured.cancel(page.items[0])).rejects.toThrow('permiso')
    expect(cancel).not.toHaveBeenCalled()
  })
  it('impide generar y exportar a un administrador según la matriz', async () => {
    const generate = vi.fn()
    const exportCsv = vi.fn()
    const planning = authorizePlanning({ generate } as unknown as GenerateRoutes, 'admin')
    await expect(planning.generate({} as never, vi.fn())).rejects.toThrow('permiso')
    const reports = authorizeSustainability({ exportCsv } as unknown as SustainabilityService, 'admin')
    expect(() => reports.exportCsv({} as never)).toThrow('permiso')
    expect(generate).not.toHaveBeenCalled()
    expect(exportCsv).not.toHaveBeenCalled()
  })
  it('rechaza pedidos fuera de la ruta demo y conductores sin asignación', async () => {
    const source = new DemoOrders()
    const orders = createDriverOrders(source)
    const confirm = vi.spyOn(orders, 'confirm')
    const user: SessionUser = { subjectId: 'd1', name: 'Ficticio', role: 'driver', driverId: 'd1', plate: 'ABC-123' }
    const secured = authorizeDriver(orders, createDriverRoute(source), user)
    await expect(secured.orders.confirm('AJENO')).rejects.toThrow()
    const unlinked = authorizeDriver(orders, createDriverRoute(source), { ...user, driverId: null }, false)
    await expect(unlinked.orders.confirm('PED-0026')).rejects.toThrow('asignación')
    expect(confirm).not.toHaveBeenCalled()
  })
})
