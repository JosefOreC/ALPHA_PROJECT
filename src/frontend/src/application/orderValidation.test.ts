import { afterEach, expect, it, vi } from 'vitest'
import { formatLima, validTimestamp, validateOrder } from '../domain/managedOrder'
import { createManagement } from './manageOrders'
import { DemoManagement } from '../infrastructure/demoManagement'
import { DEMO_ACCOUNTS, readDemoSession, saveDemoSession } from '../infrastructure/demoSession'
import { authorizeAdministration, authorizeDriver, authorizeManagement, authorizePlanning, authorizeSustainability } from './authorizedServices'
import type { SessionUser } from '../domain/session'

const data = { customer: 'Ana', address: 'Calle 1', district: 'Ate', window_start: '2026-10-30T10:00:00-05:00', window_end: '2026-10-30T12:00:00-05:00', weight_kg: 2, instructions: '' }
afterEach(() => { vi.restoreAllMocks(); sessionStorage.clear() })

it.each(['0000-01-01T10:00:00Z','2026-02-30T10:00:00Z','2026-10-30T24:00:00Z','2026-10-30T10:00:00+15:00','2026-10-30T10:00:00+00:61'])('rechaza la fecha límite %s', value => {
  expect(validTimestamp(value)).toBe(false)
})
it.each([{ customer: ' ' }, { address: 'a'.repeat(501) }, { instructions: 'a'.repeat(1001) }, { district: 'outside' }, { window_end: data.window_start }, { window_start: 'bad' }, { weight_kg: 0 }, { weight_kg: 1.001 }, { weight_kg: Infinity }])('rechaza datos de pedido inválidos %j', change => {
  expect(() => validateOrder({ ...data, ...change })).toThrow()
})
it('formatea ventanas históricas y rechaza fechas sin hora disponible', () => {
  expect(formatLima('10:00')).toContain('fecha no registrada')
  expect(formatLima('bad')).toBe('Horario no disponible')
  expect(formatLima(data.window_start)).toContain('2026')
})
it('edita pedidos con control de versiones y rechaza desconocidos y cambios protegidos', async () => {
  const port = new DemoManagement(); const service = createManagement(port)
  const order = await service.create(data)
  const updated = await service.update(order, { ...data, customer: 'Luis' })
  expect(updated.version).toBe(2)
  await expect(port.update(order.id, data, 1)).rejects.toMatchObject({ status: 409 })
  await expect(port.update('missing', data, 1)).rejects.toMatchObject({ status: 404 })
  await expect(port.view('missing')).rejects.toMatchObject({ status: 404 })
  expect(() => service.update({ ...order, assigned: true }, data)).toThrow('pendientes')
  expect(() => service.cancel({ ...order, status: 'ENTREGADO' })).toThrow('pendientes')
  await service.cancel(updated)
  const page = await port.list({ limit: 100, offset: 0, status: 'CANCELADO', district: 'Ate' })
  expect(page.items.some(item => item.id === order.id)).toBe(true)
})
it('la sesión de demostración tolera almacenamiento vacío, cerrado o bloqueado', () => {
  expect(readDemoSession()).toEqual(DEMO_ACCOUNTS[0])
  saveDemoSession(DEMO_ACCOUNTS[2]); expect(readDemoSession()).toEqual(DEMO_ACCOUNTS[2])
  saveDemoSession(null); expect(readDemoSession()).toBeNull()
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked') })
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked') })
  expect(readDemoSession()).toEqual(DEMO_ACCOUNTS[0])
  expect(() => saveDemoSession(null)).not.toThrow()
})
it('los permisos permiten delegar cada operación autorizada y conservan sus argumentos', async () => {
  const management = { permissions: vi.fn(async () => ({ can_write: true })), list: vi.fn(), view: vi.fn(), create: vi.fn(), update: vi.fn(), cancel: vi.fn() }
  const secured = authorizeManagement(management as never, 'planner')
  expect((await secured.permissions()).can_write).toBe(true)
  await secured.view('id'); await secured.create(data); await secured.update({} as never, data); await secured.cancel({} as never)
  expect(management.view).toHaveBeenCalledWith('id')
  const admin = { users: vi.fn(), createUser: vi.fn(), integrations: vi.fn(), parameters: vi.fn(), saveParameters: vi.fn() }
  const access = authorizeAdministration(admin as never, 'admin')
  await access.users(); await access.createUser({} as never); await access.integrations(); await access.parameters(); await access.saveParameters({} as never)
  expect(admin.createUser).toHaveBeenCalledOnce()
  const planning = { scope: vi.fn(), limitSeconds: vi.fn(), generate: vi.fn() }
  const routes = authorizePlanning(planning as never, 'planner')
  await routes.scope(); await routes.limitSeconds(); await routes.generate({} as never, vi.fn())
  const reports = { get: vi.fn(), exportCsv: vi.fn() }
  const report = authorizeSustainability(reports as never, 'logistics')
  await report.get('week'); report.exportCsv({} as never)
  expect(reports.exportCsv).toHaveBeenCalledOnce()
})
it('el conductor solo consulta su ruta y confirma sus propios pedidos', async () => {
  const user: SessionUser = { subjectId:'u1',name:'Ana',role:'driver',driverId:'d1',plate:'TST-001' }
  const orders = { view: vi.fn(), confirm: vi.fn() }
  const route = { route: vi.fn(async () => ({ plate:'TST-001',stops:[{ order_id:'own' }] })) }
  const service = authorizeDriver(orders as never, route as never, user)
  await service.route.route(); await service.orders.view('own'); await service.orders.confirm('own')
  expect(orders.confirm).toHaveBeenCalledWith('own')
  route.route.mockResolvedValueOnce({ plate:'OTHER',stops:[] })
  await expect(service.route.route()).rejects.toThrow('vehículo')
  await expect(authorizeDriver(orders as never, route as never, { ...user, plate:null }).route.route()).rejects.toThrow('asignación')
  await authorizeDriver(orders as never, route as never, user, false).orders.view('server-validated')
})
