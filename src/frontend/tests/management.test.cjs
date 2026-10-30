require('./setup.cjs')
const { test, afterEach } = require('node:test')
const assert = require('node:assert/strict')
const { validateOrder, validTimestamp } = require('../src/domain/managedOrder.ts')
const { createManagement } = require('../src/application/manageOrders.ts')
const { DemoManagement } = require('../src/infrastructure/demoManagement.ts')
const { HttpManagement, decodeOrder } = require('../src/infrastructure/httpManagement.ts')
const originalFetch = global.fetch
afterEach(() => { global.fetch = originalFetch })
const data = () => ({ customer: 'Ficticio', address: 'Dirección ficticia 123', district: 'Ate',
  window_start: '2026-10-01T10:00:00-05:00', window_end: '2026-10-01T12:00:00-05:00', weight_kg: 2.5, instructions: '' })
const read = () => ({ ...data(), id: 'ficticio', status: 'PENDIENTE', confirmed_at: null, assigned: false, version: 1 })

test('ventanas rechazan fechas imposibles, horas, offset ausente y fin anterior', () => {
  for (const value of ['10:00', '2026-02-30T10:00:00-05:00', '2026-10-01T24:00:00-05:00', '2026-10-01T10:00:00', '2026-10-01T10:00:00+15:00']) assert.equal(validTimestamp(value), false)
  assert.equal(validTimestamp('2026-10-01T15:00:00Z'), true)
  assert.throws(() => validateOrder({ ...data(), window_end: data().window_start }))
})
test('validación rechaza campos vacíos, excesivos, distrito y pesos inválidos', () => {
  for (const fields of [{ customer: ' ' }, { customer: 'x'.repeat(201) }, { address: 'x'.repeat(501) }, { instructions: 'x'.repeat(1001) },
    { district: 'Fuera' }, ...[0, -1, NaN, Infinity, 0.001, 100000000].map(weight_kg => ({ weight_kg }))]) assert.throws(() => validateOrder({ ...data(), ...fields }))
  assert.doesNotThrow(() => validateOrder({ ...data(), weight_kg: 0.01 }))
})
test('caso de uso no envía formulario inválido ni muta un pedido protegido', () => {
  let calls = 0
  const service = createManagement({ create() { calls++ }, update() { calls++ }, cancel() { calls++ } })
  assert.throws(() => service.create({ ...data(), weight_kg: 0 }))
  assert.throws(() => service.update({ ...read(), status: 'ENTREGADO' }, data()))
  assert.throws(() => service.cancel({ ...read(), assigned: true }))
  assert.equal(calls, 0)
})
test('demo crea, lista, consulta, edita y cancela con versión y sin persistencia compartida', async () => {
  const service = createManagement(new DemoManagement())
  const created = await service.create(data())
  assert.equal(created.status, 'PENDIENTE')
  assert.equal((await service.view(created.id)).version, 1)
  const updated = await service.update(created, { ...data(), customer: 'Cambio ficticio' })
  assert.equal(updated.version, 2)
  await assert.rejects(service.update(created, data()))
  assert.equal((await service.cancel(updated)).status, 'CANCELADO')
  assert.equal((await service.list({ limit: 20, offset: 0, status: 'CANCELADO' })).items.length, 2) // PED-0023 de la demo + el recién cancelado
  await assert.rejects(new DemoManagement().view(created.id))
})
test('demo filtra, pagina y no permite mutar DTO para alterar almacenamiento', async () => {
  const port = new DemoManagement()
  const page = await port.list({ limit: 1, offset: 0 })
  assert.equal(page.has_more, true)
  page.items[0].customer = 'Mutación externa'
  assert.notEqual((await port.view(page.items[0].id)).customer, 'Mutación externa')
  assert.equal((await port.list({ limit: 20, offset: 0, district: 'Ate' })).items.length, 3)
  assert.equal((await port.list({ limit: 20, offset: 0 })).items.length, 12)
})
test('adaptador HTTP rechaza respuestas inválidas en tiempo de ejecución', () => {
  for (const value of [null, [], {}, { ...read(), status: 'INVENTADO' }, { ...read(), version: '1' }, { ...read(), weight_kg: NaN }, { ...read(), assigned: 'false' }, { ...read(), confirmed_at: 'foo' }, { ...read(), window_start: 'fecha inválida' }]) assert.throws(() => decodeOrder(value))
  assert.deepEqual(decodeOrder(read()), read())
})
test('HTTP envía cookies, JSON y token CSRF sin enviar rol ni conductor', async () => {
  let captured
  global.fetch = async (url, options) => { captured = { url, options }; return new Response(JSON.stringify(read()), { status: 201 }) }
  const port = new HttpManagement('/base/', () => 'token-ficticio-de-prueba')
  await port.create(data())
  assert.equal(captured.url, '/base/api/pedidos')
  assert.equal(captured.options.credentials, 'include')
  assert.equal(captured.options.headers['X-CSRF-Token'], 'token-ficticio-de-prueba')
  assert.deepEqual(JSON.parse(captured.options.body), data())
})
test('HTTP traduce autorización, conflicto, validación y fallos de red sin fallback demo', async () => {
  const port = new HttpManagement('')
  for (const status of [401, 403, 404, 409, 422, 500]) {
    global.fetch = async () => new Response('{}', { status })
    await assert.rejects(port.view('id'), error => error.status === status)
  }
  global.fetch = async () => { throw new Error('Error interno ficticio') }
  await assert.rejects(port.create(data()), /Conservamos el formulario/)
})
test('HTTP valida listado y permisos, codifica filtros e identificadores', async () => {
  let url
  const port = new HttpManagement('')
  global.fetch = async path => { url = path; return new Response(JSON.stringify({ items: [read()], limit: 20, offset: 0, has_more: false })) }
  await port.list({ limit: 20, offset: 0, district: 'Santa Anita' })
  assert.match(url, /district=Santa\+Anita/)
  global.fetch = async path => { url = path; return new Response(JSON.stringify(read())) }
  await port.view('id/con espacio')
  assert.match(url, /id%2Fcon%20espacio/)
  global.fetch = async () => new Response('{"can_write":"true"}')
  await assert.rejects(port.permissions())
  global.fetch = async () => new Response('{"items":[],"limit":999,"offset":0,"has_more":false}')
  await assert.rejects(port.list({ limit: 20, offset: 0 }))
})
