import type { Page } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { ManagedOrder } from '../../src/domain/managedOrder'

/** Identidad ficticia verificada únicamente dentro de las pruebas de navegador. */
export async function mockSession(page: Page, role: string | null) {
  await page.route('**/api/session', route => route.fulfill(role ? {
    status: 200, json: { subject_id: 'test-' + role, name: 'Usuario ficticio', role, driver_id: role === 'driver' ? 'd1' : null, plate: role === 'driver' ? 'ABC-123' : null },
  } : { status: 401, json: { detail: 'Sin sesión' } }))
}

export const orderFixture = (): ManagedOrder => ({
  id: 'PEDIDO-FICTICIO', customer: 'Destinatario ficticio', address: 'Dirección ficticia 123',
  district: 'Santa Anita', window_start: '2026-10-01T10:00:00-05:00',
  window_end: '2026-10-01T12:00:00-05:00', weight_kg: 4.5, instructions: 'Datos exclusivos de prueba.',
  status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1,
})

/** Simulación HTTP aislada por página; no verifica autenticación ni persistencia real. */
export async function mockApi(page: Page, options: { readOnly?: boolean; failRead?: boolean; failWrite?: boolean } = {}) {
  const orders = new Map([[orderFixture().id, orderFixture()]])
  const calls = { create: 0, update: 0, cancel: 0 }
  await page.route('**/api/pedidos**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const id = decodeURIComponent(url.pathname.split('/')[3] ?? '')
    const method = request.method()
    const reply = (status: number, json: unknown) => route.fulfill({ status, json })
    if (options.failRead) return reply(401, { detail: 'Sesión ficticia denegada.' })
    if (method === 'GET') {
      if (id === 'permisos') return reply(200, { can_write: !options.readOnly })
      if (id) return reply(orders.has(id) ? 200 : 404, orders.get(id) ?? {})
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limit = Number(url.searchParams.get('limit') ?? 20)
      const filtered = [...orders.values()].filter(order =>
        (!url.searchParams.get('status') || order.status === url.searchParams.get('status')) &&
        (!url.searchParams.get('district') || order.district === url.searchParams.get('district')))
      return reply(200, { items: filtered.slice(offset, offset + limit), offset, limit, has_more: filtered.length > offset + limit })
    }
    if (method === 'PUT') calls.update++
    else if (id) calls.cancel++
    else calls.create++
    if (options.readOnly) return reply(403, {})
    if (options.failWrite) return reply(503, {})
    const body = request.postDataJSON()
    if (!id) {
      const created: ManagedOrder = { ...body, id: 'NUEVO-FICTICIO', status: 'PENDIENTE', assigned: false, confirmed_at: null, version: 1 }
      orders.set(created.id, created)
      return reply(201, created)
    }
    const current = orders.get(id)
    if (!current) return reply(404, {})
    if (body.expected_version !== current.version) return reply(409, {})
    const { expected_version: _version, ...fields } = body
    const changed: ManagedOrder = { ...current, ...(method === 'PUT' ? fields : { status: 'CANCELADO' }), version: current.version + 1 }
    orders.set(id, changed)
    return reply(200, changed)
  })
  return { calls, orders }
}

export async function fillOrder(page: Page, customer = 'Registro ficticio') {
  await page.getByLabel('Destinatario *', { exact: true }).fill(customer)
  await page.getByLabel('Dirección de entrega *', { exact: true }).fill('Dirección ficticia 456')
  await page.getByLabel('Distrito *', { exact: true }).selectOption('Ate')
  await page.getByLabel('Inicio de ventana · Lima *').fill('2026-10-02T10:00')
  await page.getByLabel('Fin de ventana · Lima *').fill('2026-10-02T12:00')
  await page.getByLabel('Peso del paquete (kg) *').fill('2.5')
  await page.getByLabel('Indicaciones adicionales').fill('Entrega ficticia para pruebas.')
}

/** Capturas solicitadas explícitamente; las ejecuciones habituales no las generan. */
export async function captureEvidence(page: Page, filename: string) {
  const directory = process.env.CRUD_EVIDENCE_DIR
  if (!directory) return
  await mkdir(directory, { recursive: true })
  await page.screenshot({ path: resolve(directory, filename), fullPage: true })
}

// Base vectorial vacía: prueba el renderizador real sin depender de servidores externos.
export async function stubTiles(page: Page, mode: 'ok' | 'fail' = 'ok') {
  await page.route('**/maps/lima-pastel.json', route => mode === 'ok' ? route.fulfill({
    status: 200, json: { version: 8, sources: {}, layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#f4f0e6' } }] },
  }) : route.abort())
}
