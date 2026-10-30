import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { decodeOrder, HttpManagement } from './httpManagement'
import { HttpSession } from './httpSession'
import { HttpOrders } from './httpOrders'
import { getCsrfToken, requestJson, setCsrfToken } from './httpClient'
import { HttpAlgorithmSettings, HttpDashboardInsights, HttpDriverRoute, HttpIntegrationCatalog, HttpMapData, HttpPlanningSource, HttpRouteOptimizer, HttpSustainabilityReport, HttpUserDirectory } from './httpPortal'
import type { OrderData } from '../domain/managedOrder'

const data: OrderData = { customer: 'Ana', address: 'Calle 1', district: 'Ate', window_start: '2026-10-30T10:00:00-05:00', window_end: '2026-10-30T12:00:00-05:00', weight_kg: 2, instructions: '' }
const order = { ...data, id: 'order/1', status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1 }
const session = { subject_id: 'u1', name: 'Ana', role: 'driver', driver_id: 'd1', plate: 'TST-001', csrf_token: 'csrf-verified' }
const fetchMock = vi.fn<typeof fetch>()
beforeEach(() => { vi.stubGlobal('fetch', fetchMock); fetchMock.mockReset(); setCsrfToken(null) })
afterEach(() => { vi.unstubAllGlobals(); setCsrfToken(null) })

describe('HTTP de gestión de pedidos', () => {
  it('codifica identificadores y filtros y transmite versiones y CSRF solo al escribir', async () => {
    const port = new HttpManagement('https://api.example.invalid/', () => 'csrf')
    fetchMock.mockResolvedValueOnce(Response.json({ can_write: true }))
    expect(await port.permissions()).toEqual({ can_write: true })
    fetchMock.mockResolvedValueOnce(Response.json({ items: [order], limit: 20, offset: 0, has_more: false }))
    expect((await port.list({ limit: 20, offset: 0, status: 'PENDIENTE', district: 'Santa Anita' })).items[0].id).toBe('order/1')
    expect(String(fetchMock.mock.calls[1][0])).toContain('district=Santa+Anita')
    for (const run of [() => port.view('order/1'), () => port.create(data), () => port.update('order/1', data, 3), () => port.cancel('order/1', 4)]) {
      fetchMock.mockResolvedValueOnce(Response.json(order))
      expect((await run()).customer).toBe('Ana')
    }
    expect(String(fetchMock.mock.calls[2][0])).toContain('order%2F1')
    expect(fetchMock.mock.calls[2][1]?.headers).not.toHaveProperty('X-CSRF-Token')
    const options = fetchMock.mock.calls[4][1]!
    expect(options.headers).toHaveProperty('X-CSRF-Token', 'csrf')
    expect(JSON.parse(String(options.body)).expected_version).toBe(3)
    expect(JSON.parse(String(fetchMock.mock.calls[5][1]?.body))).toEqual({ expected_version: 4 })
  })
  it('admite escrituras sin token local sin inventar una identidad', async () => {
    fetchMock.mockResolvedValue(Response.json(order))
    await new HttpManagement('').create(data)
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('X-CSRF-Token')
  })
  it.each([401, 403, 404, 409, 422, 500])('conserva el estado HTTP %i en errores', async status => {
    fetchMock.mockResolvedValue(new Response('', { status }))
    await expect(new HttpManagement('').view('id')).rejects.toMatchObject({ status })
  })
  it('distingue una creación incierta de una lectura sin conexión y rechaza JSON roto', async () => {
    const port = new HttpManagement('')
    fetchMock.mockRejectedValue(new TypeError('offline'))
    await expect(port.create(data)).rejects.toThrow('evitar duplicados')
    await expect(port.view('id')).rejects.toThrow('conectar')
    fetchMock.mockResolvedValue(new Response('{bad'))
    await expect(port.view('id')).rejects.toThrow('respuesta inválida')
  })
  it.each([null, [], {}, { can_write: 'yes' }])('rechaza permisos inválidos %j', async value => {
    fetchMock.mockResolvedValue(Response.json(value))
    await expect(new HttpManagement('').permissions()).rejects.toThrow('Permisos inválidos')
  })
  it.each([null, { items: null }, { items: [], limit: 1, offset: 0, has_more: 'no' }, { items: [], limit: 2, offset: 0, has_more: false }, { items: [], limit: 1, offset: 1, has_more: false }, { items: [order, order], limit: 1, offset: 0, has_more: false }])('rechaza listados incompatibles %j', async value => {
    fetchMock.mockResolvedValue(Response.json(value))
    await expect(new HttpManagement('').list({ limit: 1, offset: 0 })).rejects.toThrow('listado inválido')
  })
  it.each([null, [], { ...order, id: 1 }, { ...order, status: 'unknown' }, { ...order, status: 2 }, { ...order, weight_kg: '2' }, { ...order, weight_kg: Infinity }, { ...order, weight_kg: 0 }, { ...order, assigned: 'false' }, { ...order, version: 0 }, { ...order, version: 1.5 }, { ...order, window_start: 'bad' }, { ...order, window_end: 'bad' }, { ...order, confirmed_at: 1 }, { ...order, confirmed_at: 'bad' }])('rechaza un pedido corrupto %j', value => {
    expect(() => decodeOrder(value)).toThrow('pedido inválido')
  })
  it('acepta ventanas históricas y confirmaciones con fecha', () => {
    expect(decodeOrder({ ...order, window_start: '10:00', window_end: '12:00:00', confirmed_at: '2026-10-30T12:00:00Z' }).confirmed_at).toContain('2026')
  })
})

describe('Sesiones HTTP y cookies', () => {
  it('carga identidad y CSRF, limpia ambos ante una sesión vencida', async () => {
    const port = new HttpSession('https://api.example.invalid/')
    fetchMock.mockResolvedValueOnce(Response.json(session))
    expect((await port.load())?.subjectId).toBe('u1')
    expect(getCsrfToken()).toBe('csrf-verified')
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
    expect(await port.load()).toBeNull()
    expect(getCsrfToken()).toBeNull()
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 503 }))
    await expect(port.load()).rejects.toThrow('verificar')
    fetchMock.mockResolvedValueOnce(Response.json({ ...session, csrf_token: undefined }))
    await port.load()
    expect(getCsrfToken()).toBeNull()
  })
  it('inicia y cierra sesión con el token del servidor', async () => {
    const port = new HttpSession('')
    fetchMock.mockResolvedValueOnce(Response.json(session))
    expect((await port.login('ana@example.invalid', 'password')).driverId).toBe('d1')
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({ email: 'ana@example.invalid', password: 'password' })
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    await port.logout()
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({ 'X-CSRF-Token': 'csrf-verified' })
    expect(getCsrfToken()).toBeNull()
    document.querySelector('meta[name="csrf-token"]')?.remove()
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }))
    await port.logout()
    expect(fetchMock.mock.calls[2][1]?.headers).toEqual({})
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }))
    await expect(port.logout()).rejects.toThrow('cerrar')
  })
  it('maneja error de red, detalle del servidor, cuerpo inválido y sesión sin CSRF', async () => {
    const port = new HttpSession('')
    fetchMock.mockRejectedValueOnce(new TypeError('offline'))
    await expect(port.login('a', 'b')).rejects.toThrow('conectar')
    fetchMock.mockResolvedValueOnce(Response.json({ detail: 'Credenciales inválidas' }, { status: 401 }))
    await expect(port.login('a', 'b')).rejects.toThrow('Credenciales inválidas')
    fetchMock.mockResolvedValueOnce(new Response('bad', { status: 500 }))
    await expect(port.login('a', 'b')).rejects.toThrow('iniciar sesión')
    fetchMock.mockResolvedValueOnce(Response.json({ ...session, csrf_token: undefined }))
    await port.login('a', 'b')
    expect(getCsrfToken()).toBeNull()
  })
})

describe('Pedidos del conductor y cliente común', () => {
  it.each([401, 403, 404, 409, 500])('rechaza la consulta del conductor ante HTTP %i', async status => {
    fetchMock.mockResolvedValue(new Response(null, { status }))
    await expect(new HttpOrders('').view('id')).rejects.toThrow()
  })
  it('codifica pedidos y usa CSRF para confirmar, con o sin token disponible', async () => {
    const port = new HttpOrders('/backend/')
    setCsrfToken('verified')
    fetchMock.mockImplementation(async () => Response.json(order))
    await port.view('id/1'); await port.confirm('id/1')
    expect(String(fetchMock.mock.calls[0][0])).toBe('/backend/api/conductor/pedidos/id%2F1')
    expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty('X-CSRF-Token')
    expect(fetchMock.mock.calls[1][1]?.headers).toHaveProperty('X-CSRF-Token', 'verified')
    setCsrfToken(null); await port.confirm('id')
    expect(fetchMock.mock.calls[2][1]?.headers).not.toHaveProperty('X-CSRF-Token')
  })
  it.each([401, 403, 500])('usa mensajes seguros sin un detalle válido ante HTTP %i', async status => {
    fetchMock.mockResolvedValue(new Response('invalid-json', { status }))
    await expect(requestJson('/api/test')).rejects.toThrow(/sesión|permiso|operación/)
  })
  it('conserva AbortError y acepta respuestas vacías', async () => {
    const controller = new AbortController(); controller.abort()
    const reason = new DOMException('aborted', 'AbortError')
    fetchMock.mockRejectedValueOnce(reason)
    await expect(requestJson('/api/test', { signal: controller.signal })).rejects.toBe(reason)
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }))
    expect(await requestJson('/api/test', { method: 'DELETE' })).toBeUndefined()
  })
})

it('los adaptadores del portal respetan rutas, verbos, filtros y señales', async () => {
  fetchMock.mockImplementation(async () => Response.json({ ok: true }))
  const signal = new AbortController().signal
  await new HttpUserDirectory().list(signal)
  await new HttpUserDirectory().create({ name: 'Ana', email: 'a@example.invalid', password: 'secure password', role: 'driver' })
  await new HttpAlgorithmSettings().load()
  await new HttpAlgorithmSettings().save({ co2Weight: 50 } as never)
  await new HttpIntegrationCatalog().list(signal)
  await new HttpMapData().load()
  await new HttpDriverRoute().route()
  await new HttpSustainabilityReport().getReport('month', signal)
  await new HttpPlanningSource().scope()
  const progress = vi.fn()
  const settings = { goal: 'co2', respectWindows: true, prioritizeLowEmission: true } as const
  await new HttpRouteOptimizer().optimize({} as never, settings, progress)
  expect(progress.mock.calls.map(([value]) => value.fraction)).toEqual([null, 1])
  await new HttpRouteOptimizer().optimize({} as never, settings)
  await new HttpDashboardInsights().getInsights({ date: '2026-10-30', districtId: '150103' }, signal)
  await new HttpDashboardInsights().getInsights({})
  expect(fetchMock.mock.calls.map(([url]) => url)).toContain('/api/dashboard/insights?date=2026-10-30&district=150103')
  expect(fetchMock.mock.calls[0][1]?.signal).toBe(signal)
  expect(fetchMock.mock.calls[1][1]?.method).toBe('POST')
  expect(fetchMock.mock.calls[3][1]?.method).toBe('PUT')
})
