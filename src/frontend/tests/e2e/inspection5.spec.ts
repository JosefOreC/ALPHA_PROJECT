import { randomUUID } from 'node:crypto'
import { performance as nodePerformance } from 'node:perf_hooks'
import { expect, test } from '@playwright/test'

test('acceso, permisos, validación y persistencia de pedidos', async ({ page, baseURL }, testInfo) => {
  const password = process.env.E2E_PASSWORD
  if (!password || !baseURL || !['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname)) {
    throw new Error('La prueba de escritura requiere una instancia local aislada y E2E_PASSWORD.')
  }

  const response = await page.goto('/?vista=pedidos')
  expect(response?.status()).toBe(200)
  const email = page.getByLabel('Correo electrónico')
  const passwordInput = page.getByLabel('Contraseña', { exact: true })
  const submit = page.getByRole('button', { name: 'Ingresar' })
  await expect(email).toBeEnabled()
  expect(await email.evaluate(input => (input as HTMLInputElement).validity.valueMissing)).toBe(true)
  await email.fill('operador@example.invalid')
  await passwordInput.fill('contraseña-incorrecta')
  const rejection = page.waitForResponse(result => result.url().endsWith('/api/session') && result.request().method() === 'POST')
  await submit.click()
  expect((await rejection).status()).toBe(401)

  await passwordInput.fill(password)
  const unavailableMessage = 'El servicio no está disponible temporalmente.'
  await page.route('**/api/session', route => route.fulfill({
    status: 503,
    json: { detail: unavailableMessage },
  }), { times: 1 })
  const unavailable = page.waitForResponse(result => result.url().endsWith('/api/session') && result.request().method() === 'POST')
  await submit.click()
  expect((await unavailable).status()).toBe(503)
  await expect(page.getByRole('alert')).toHaveText(unavailableMessage)
  await expect(submit).toBeEnabled()
  await expect(passwordInput).toHaveValue('')
  await passwordInput.fill(password)

  const accepted = page.waitForResponse(result => result.url().endsWith('/api/session') && result.request().method() === 'POST')
  await submit.click()
  expect((await accepted).status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Gestión de pedidos', exact: true })).toBeVisible()

  const session = await page.request.get('/api/session')
  const identity = await session.json()
  expect(identity.role).toBe('planner')
  expect((await page.request.get('/api/admin/users')).status()).toBe(403)
  const headers = { 'X-CSRF-Token': identity.csrf_token }
  const customer = 'Inspección 5 ' + randomUUID()
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const order = {
    customer,
    address: 'Dirección de prueba',
    district: 'Ate',
    window_start: date + "T08:00:00-05:00",
    window_end: date + "T18:00:00-05:00",
    weight_kg: 2.5,
  }
  expect((await page.request.post('/api/pedidos', { headers, data: { ...order, weight_kg: 0 } })).status()).toBe(422)
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await page.getByLabel('Destinatario *', { exact: true }).fill(customer)
  await page.getByLabel('Dirección de entrega *', { exact: true }).fill(order.address)
  await page.getByLabel('Distrito *', { exact: true }).selectOption(order.district)
  await page.getByLabel('Entrega desde (hora de Lima) *').fill(date + 'T08:00')
  await page.getByLabel('Entrega hasta (hora de Lima) *').fill(date + 'T18:00')
  await page.getByLabel('Peso del paquete (kg) *').fill('2.5')
  const creation = page.waitForResponse(result => result.url().endsWith('/api/pedidos') && result.request().method() === 'POST')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  const created = await creation
  expect(created.status()).toBe(201)
  const saved = await created.json()
  await expect(page.getByText('Pedido guardado correctamente.')).toBeVisible()
  await testInfo.attach('pedido-registrado', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  expect(saved.id).toEqual(expect.any(String))

  const persisted = await page.request.get('/api/pedidos/' + encodeURIComponent(saved.id))
  expect(persisted.status()).toBe(200)
  expect(await persisted.json()).toMatchObject({
    id: saved.id, customer, address: order.address, district: order.district,
    weight_kg: order.weight_kg, status: 'PENDIENTE',
  })

  const listStart = nodePerformance.now()
  const listed = await page.request.get('/api/pedidos', {
    params: { district: order.district, status: 'PENDIENTE', limit: 12 },
  })
  const orderListMs = nodePerformance.now() - listStart
  expect(listed.status()).toBe(200)
  const firstPage = await listed.json()
  expect(firstPage).toMatchObject({ limit: 12, offset: 0, has_more: expect.any(Boolean) })
  expect(firstPage.items.length).toBeGreaterThan(0)
  expect(firstPage.items.length).toBeLessThanOrEqual(12)
  for (const item of firstPage.items) {
    expect(item).toMatchObject({ district: order.district, status: 'PENDIENTE' })
  }

  await testInfo.attach('rendimiento-api-pedidos', {
    body: JSON.stringify({ orderListMs }),
    contentType: 'application/json',
  })
  expect.soft(orderListMs, 'GET /api/pedidos debe responder en menos de 500 ms').toBeLessThan(500)
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(submit).toBeVisible()
  expect((await page.request.get('/api/session')).status()).toBe(401)
})

test('consulta la ruta asignada y confirma una entrega como conductor', async ({ page, baseURL }, testInfo) => {
  const password = process.env.E2E_PASSWORD
  if (!password || !baseURL || !['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname)) {
    throw new Error('La prueba de escritura requiere una instancia local aislada y E2E_PASSWORD.')
  }
  const driver = ['04', '05', '06'][testInfo.project.name === 'chromium' ? 0 : testInfo.project.name === 'firefox' ? 1 : 2]
  await page.goto('/?vista=mi-ruta')
  await page.getByLabel('Correo electrónico').fill(`conductor${driver}@example.invalid`)
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await expect(page.getByRole('list', { name: 'Paradas de hoy' })).toBeVisible()
  const request = page.request
  const identity = await (await request.get('/api/session')).json()
  expect(identity.role).toBe('driver')
  expect((await request.get('/api/routes/scope')).status()).toBe(403)
  const assigned = await request.get('/api/conductor/ruta')
  expect(assigned.ok()).toBeTruthy()
  const route = await assigned.json()
  const stop = route.stops.find((item: { kind: string }) => item.kind === 'now')
  expect(stop).toBeDefined()
  const order = `/api/conductor/pedidos/${stop.order_id}`
  await testInfo.attach('ruta-asignada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  await page.goto('/?vista=conductor&pedido=' + encodeURIComponent(stop.order_id))
  await page.getByRole('button', { name: 'Confirmar entrega', exact: true }).click()
  const confirmation = page.getByRole('dialog', { name: '¿Ya entregaste el pedido?' })
  await expect(confirmation).toBeVisible()
  const confirmationResponse = page.waitForResponse(response => response.url().endsWith(order + '/confirmacion') && response.request().method() === 'POST')
  await confirmation.getByRole('button', { name: 'Sí, confirmar entrega', exact: true }).click()
  const confirmed = await confirmationResponse
  expect(confirmed.ok()).toBeTruthy()
  expect((await confirmed.json()).status).toBe('ENTREGADO')
  const persisted = await request.get(order)
  expect(persisted.ok()).toBeTruthy()
  expect((await persisted.json()).status).toBe('ENTREGADO')
  await expect(page.getByText('Entrega confirmada', { exact: true })).toBeVisible()
  await testInfo.attach('entrega-confirmada', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
})

test('disponibilidad, recuperación ante error de red y tiempos de acceso', async ({ page }, testInfo) => {
  await page.addInitScript(() => {
    if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
      const observer = new PerformanceObserver(entries => {
        const last = entries.getEntries().at(-1)
        if (last) document.documentElement?.setAttribute('data-e2e-lcp', String(last.startTime))
      })
      observer.observe({ type: 'largest-contentful-paint', buffered: true })
    }
  })
  const start = nodePerformance.now()
  const health = await page.request.get('/health')
  const healthMs = nodePerformance.now() - start
  expect(health.status()).toBe(200)
  expect((await health.json()).status).toBe('ok')
  expect((await page.request.get('/api/inspection5-unknown-route')).status()).toBe(404)

  // Solo este escenario inyecta un fallo de transporte. La recarga usa la API real.
  await page.route('**/api/session', route => route.abort('failed'), { times: 1 })
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()
  const session = page.waitForResponse(result => result.url().endsWith('/api/session'))
  await page.reload()
  expect((await session).status()).toBe(401)
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible()

  const navigation = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const rawLcp = document.documentElement.getAttribute('data-e2e-lcp')
    return {
      ttfbMs: entry.responseStart - entry.startTime,
      fcpMs: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? null,
      lcpMs: rawLcp === null ? null : Number(rawLcp),
    }
  })
  await testInfo.attach('rendimiento-acceso', {
    body: JSON.stringify({ browser: testInfo.project.name, healthMs, ...navigation }, null, 2),
    contentType: 'application/json',
  })
  expect.soft(healthMs, 'GET /health debe responder en menos de 500 ms').toBeLessThan(500)
  await testInfo.attach('acceso-operativo', { body: await page.screenshot(), contentType: 'image/png' })
})

test('administrador: permisos completos, tabla de roles y simulación por interfaz', async ({ page, baseURL }, testInfo) => {
  const password = process.env.E2E_PASSWORD
  if (!password || !baseURL || !['127.0.0.1', 'localhost'].includes(new URL(baseURL).hostname)) {
    throw new Error('Se requiere una instancia local aislada y E2E_PASSWORD.')
  }
  await page.goto('/?vista=admin')
  await page.getByLabel('Correo electrónico').fill('admin@example.invalid')
  await page.getByLabel('Contraseña', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Ingresar', exact: true }).click()
  await page.getByRole('tab', { name: 'Roles y accesos', exact: true }).click()
  await expect(page.getByRole('table', { name: /Responsabilidades/ })).toBeVisible()
  await expect(page.getByRole('row', { name: /ROL-01/ })).toContainText('Generar y aprobar rutas')
  await testInfo.attach('roles-y-accesos', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  await page.getByRole('link', { name: 'Rutas', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Generar rutas', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Ruta demo', exact: true }).click()
  await page.getByLabel('Movil-1 capacity').fill('80')
  const calculation = page.waitForResponse(response => response.url().endsWith('/api/routes/simulate') && response.request().method() === 'POST')
  await page.getByRole('button', { name: 'Calcular rutas de prueba' }).click()
  const response = await calculation
  expect(response.status()).toBe(200)
  expect((await response.json()).simulation).toBe(true)
  await expect(page.getByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
  await testInfo.attach('laboratorio-rutas', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
})
