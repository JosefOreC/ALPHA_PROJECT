import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'
import { captureEvidence, mockSession, stubTiles } from './fixtures'
import type { MapData } from '../../src/domain/mapData'

const DEMO = '/tests/ui/map.html?board'

async function openLayers(map: Locator) {
  const button = map.getByRole('button', { name: 'Capas', exact: true })
  if (await button.getAttribute('aria-expanded') !== 'true') await button.click()
  return map.getByRole('group', { name: 'Capas del mapa' })
}

test.beforeEach(async ({ page }) => {
  page.on('pageerror', error => { throw error })
})

test('al filtrar un pedido conserva discretamente las otras paradas de su ruta', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group', { name: /Mapa de rutas/ })
  const filter = page.getByRole('combobox', { name: 'Filtrar por pedido en el mapa' })
  const stops = map.locator('svg.route-stop-icon')
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(stops).toHaveCount(0)
  await page.getByRole('combobox', { name: 'Estado de los pedidos en el mapa' }).selectOption('EN_CAMINO')
  await filter.selectOption('PED-0029')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await expect(stops).toHaveCount(2)
  await expect(map.locator('svg.route-stop-icon.r1')).toHaveCount(2)
  await expect(stops.first()).toHaveAttribute('width', '12')
  await expect(stops.first()).toHaveCSS('opacity', '0.7')
  const stop = map.getByTitle('Otra parada · PED-0021 · Comercial Hermanos Quispe · Vehículo ABC-123')
  await stop.focus()
  await stop.press('Enter')
  const tooltip = map.getByRole('tooltip').filter({ hasText: 'Otra parada de esta ruta' })
  await expect(tooltip).toContainText('Parada 1 · Comercial Hermanos Quispe')
  await expect(tooltip).toContainText('PED-0021 · Vehículo ABC-123')
  await expect(filter).toHaveValue('PED-0029')
  await expect(map.locator('.eco-map__card')).toContainText('Panadería San Hilarión')
  await captureEvidence(page, 'otras-paradas-escritorio.png')

  const layers = await openLayers(map)
  await layers.getByRole('button', { name: 'Rutas', exact: true }).click()
  await expect(stops).toHaveCount(0)
  await layers.getByRole('button', { name: 'Rutas', exact: true }).click()
  await expect(stops).toHaveCount(2)
  await layers.getByRole('button', { name: 'Pedidos', exact: true }).click()
  await expect(stops).toHaveCount(0)
  await layers.getByRole('button', { name: 'Pedidos', exact: true }).click()
  await expect(stops).toHaveCount(2)
  await map.getByRole('button', { name: 'Capas', exact: true }).click()
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(stops).toHaveCount(2)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await captureEvidence(page, 'otras-paradas-movil.png')

  await page.getByRole('button', { name: 'Limpiar filtros del mapa' }).click()
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(stops).toHaveCount(0)
  await filter.selectOption('PED-0024')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await expect(map.locator('path.route')).toHaveCount(0)
  await expect(stops).toHaveCount(0)
})

test('un icono discreto explica los accesos de ida y vuelta aunque el pedido esté filtrado', async ({page}) => {
  await mockSession(page,'planner')
  await stubTiles(page)
  const before={lat:-12.014,lng:-76.994}, entrance={lat:-12.01388,lng:-76.99325}
  const middle={lat:-12.01364,lng:-76.993045}, tip={lat:-12.01371,lng:-76.992905}
  const after={lat:-12.013,lng:-76.9938}
  const data:MapData={depot:{name:'Almacén',position:before},vehicles:[],
    routes:[{id:'r1',plate:'TST-001',color:1,done_until:0,path:[before,entrance,middle,tip,middle,entrance,after]}],
    orders:[{id:'shown',customer:'Cliente visible',district:'Ate',status:'PENDIENTE',position:after,window:'08:00–18:00',route_id:'r1',co2_kg:null},
      {id:'access-order',customer:'Cliente del acceso',district:'Ate',status:'PENDIENTE',position:tip,window:'08:00–18:00',route_id:'r1',co2_kg:null}]}
  await page.route('**/api/routes/map',route=>route.fulfill({json:data}))
  await page.goto('/?vista=rutas')
  const map=page.getByRole('group',{name:/Mapa de rutas/})
  await expect(map.locator('svg.pin')).toHaveCount(2)
  await page.getByRole('combobox',{name:'Filtrar por pedido en el mapa'}).selectOption('shown')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  while(Number(await map.locator('.leaflet-container').getAttribute('data-map-zoom'))<17) await map.getByRole('button',{name:'Acercar',exact:true}).click()
  const access=map.getByTitle('Acceso de ida y vuelta · Vehículo TST-001')
  await expect(access).toBeVisible()
  await expect(map.locator('svg.route-access-icon')).toHaveCount(1)
  await expect(map.locator('svg.route-access-icon')).toHaveAttribute('width','18')
  await access.focus()
  await access.press('Enter')
  await expect(map.locator('.eco-map__access-tooltip')).toContainText('La ruta entra por este ramal y vuelve al mismo cruce.')
  await map.getByRole('button',{name:'Capas',exact:true}).click()
  await map.getByRole('button',{name:'Rutas',exact:true}).click()
  await expect(map.locator('svg.route-access-icon')).toHaveCount(0)
})

test('generar y aprobar dibuja la propuesta y conserva la ruta al recargar', async ({ page }) => {
  await mockSession(page,'planner')
  await stubTiles(page)
  let saved = false
  let approvals = 0
  const mapData: MapData = {
    depot:{ name:'Almacén',position:{lat:-12.03,lng:-76.96} },vehicles:[],
    routes:[{ id:'preview-route',plate:'TST-001',color:1,done_until:0,
      path:[{lat:-12.03,lng:-76.96},{lat:-12.04,lng:-76.95},{lat:-12.03,lng:-76.96}] }],
    orders:[{id:'test-order',customer:'Cliente de prueba',district:'Ate',status:'PENDIENTE',
      position:{lat:-12.04,lng:-76.95},window:'08:00–18:00',route_id:'preview-route',co2_kg:null}],
  }
  await page.route('**/api/routes/map',route => route.fulfill({json:saved ? mapData : {depot:null,orders:[],routes:[],vehicles:[]}}))
  await page.route('**/api/routes/scope',route => route.fulfill({json:{pendingOrders:saved ? 0 : 1,districts:1,availableVehicles:saved ? 0 : 1,totalVehicles:1,vehiclesInService:0}}))
  await page.route('**/api/admin/parameters',route => route.fulfill({json:{maxSeconds:45}}))
  await page.route('**/api/routes/proposal',route => route.fulfill({json:{
    routeCount:1,ordersAssigned:1,totalKm:3,kmSaved:0,co2Kg:2,co2SavedPercent:0,windowCompliance:100,
    windowTarget:90,elapsedSeconds:0.1,fingerprint:'a'.repeat(64),mapData,
    routes:[{plate:'TST-001',driver:'Ana',zone:'Ate',fuel:'DIESEL',stops:1,km:3,load:0.1,co2Kg:2}],
  }}))
  await page.route('**/api/routes/approve',route => {
    expect(route.request().headers()['x-csrf-token']).toBe('test-csrf')
    expect(route.request().postDataJSON()).toEqual({settings:{goal:'co2',respectWindows:true,prioritizeLowEmission:true,returnToDepot:false},fingerprint:'a'.repeat(64)})
    approvals++
    saved = true
    return route.fulfill({status:201,json:{routeIds:['preview-route'],ordersAssigned:1}})
  })
  await page.goto('/?vista=rutas')
  await page.getByRole('tab',{name:'Generar rutas',exact:true}).click()
  await page.getByRole('button',{name:'Generar rutas',exact:true}).click()
  const preview = page.getByRole('region',{name:'Mapa de la propuesta'})
  await expect(preview.locator('path.route')).toHaveCount(2)
  await expect(preview.locator('svg.pin')).toHaveCount(1)
  await page.getByRole('button',{name:'Aprobar y guardar rutas'}).click()
  await expect(page.getByText('Rutas guardadas',{exact:true})).toBeVisible()
  await expect(page.locator('path.route')).toHaveCount(2)
  expect(approvals).toBe(1)
  await page.reload()
  await expect(page.locator('path.route')).toHaveCount(2)
  await expect(page.locator('svg.pin')).toHaveCount(1)
})

test('el mapa dibuja rutas, pedidos y vehículos sobre OpenStreetMap', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(map.locator('svg.veh')).toHaveCount(4)
  await expect(map.locator('path.route')).toHaveCount(8)
  await expect(map.locator('path.route--done')).toHaveCount(4)
  await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap')
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-basemap', 'vector-pastel')
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-basemap-ready', 'true')
  // La forma del pin cuenta el estado: rombo pendiente, check entregado, equis cancelado.
  await expect(map.locator('svg.pin--pending')).toHaveCount(2)
  await expect(map.locator('svg.pin--delivered')).toHaveCount(3)
  await expect(map.locator('svg.pin--cancelled')).toHaveCount(1)
  await expect(map.locator('svg.pin--transit')).toHaveCount(6)
})

test('placas, colores, números y flechas permiten seguir una ruta y sus entregas', async ({page}) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group',{name:/Mapa de rutas/})
  const choices = page.getByRole('group',{name:'Rutas por vehículo'})
  await expect(choices.getByRole('button',{name:'Todas las rutas'})).toHaveAttribute('aria-pressed','true')
  await expect(map.locator('path.route:not(.route--done)').first()).toHaveCSS('stroke-dasharray','none')
  await expect(map.locator('path.route:not(.route--done)').first()).toHaveCSS('stroke-width','6px')
  await expect.poll(() => map.locator('svg.route-direction').count()).toBeGreaterThan(0)
  await expect(map.getByTitle('PED-0029 · Panadería San Hilarión · En camino').locator('.pin-number')).toHaveText('3')
  await choices.getByRole('button',{name:'Ruta BCD-456'}).click()
  await expect(map.locator('svg.pin.r2:not(.is-dim)')).toHaveCount(2)
  await expect(map.locator('svg.pin.r1.is-dim')).toHaveCount(3)
  const line = map.locator('path.route.r2:not(.route--done)')
  await expect(line).toHaveCSS('stroke-width','8px')
  const color = await line.evaluate(el=>getComputedStyle(el).stroke)
  await expect(map.locator('svg.pin.r2 .pin-body').first()).toHaveCSS('fill',color)
  await expect(map.locator('.eco-map__route-label')).toHaveText('Vehículo BCD-456')
  await expect(page.getByRole('list',{name:'Paradas de BCD-456'}).getByRole('button')).toHaveCount(2)
  await page.getByRole('button',{name:'Parada 2: Bodega La Esquina'}).click()
  await expect(map.locator('.eco-map__card')).toContainText('Bodega La Esquina')
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-map-zoom','16')
  await choices.getByRole('button',{name:'Todas las rutas'}).click()
  await expect(map.locator('svg.pin.is-dim')).toHaveCount(0)
  await page.getByRole('combobox',{name:'Filtrar por pedido en el mapa'}).selectOption('PED-0029')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await expect(map.locator('.pin-number')).toHaveText('3')
  await page.setViewportSize({width:390,height:844})
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
  await expect.poll(async () => {
    const bounds = await map.locator('.leaflet-container').boundingBox()
    const close = await map.getByRole('button',{name:'Cerrar tarjeta'}).boundingBox()
    return !!bounds && !!close && close.x >= bounds.x && close.x + close.width <= bounds.x + bounds.width
  }).toBe(true)
})

test('elegir un pin selecciona el pedido, resalta su ruta y muestra la tarjeta', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  // La tarjeta del pedido inicial puede cubrir otro pin en el panel lateral.
  await map.getByRole('button', { name: 'Cerrar tarjeta' }).click()
  // La parte superior del pin queda libre cuando dos paradas están próximas.
  await map.getByTitle('PED-0029 · Panadería San Hilarión · En camino').click({ position: { x: 18, y: 8 } })
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toContainText('Panadería San Hilarión')
  await expect(map.locator('svg.pin.is-sel')).toHaveCount(1)
  await expect(map.locator('.eco-map__card')).toContainText('Vehículo ABC-123')
  await expect(map.locator('path.route.r1.is-dim')).toHaveCount(0)
  await expect(map.locator('path.route.r2.is-dim')).toHaveCount(2)
  await expect(map.locator('path.route.r4.is-dim')).toHaveCount(2)
})

test('elegir una fila de la lista lleva la selección al mapa', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  await page.getByRole('row', { name: /PED-0044/ }).click()
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await expect(map.locator('svg.pin.is-sel')).toHaveCount(1)
  await expect(map.locator('.eco-map__card')).toContainText('Farmacia Los Ángeles')
  await expect(map.locator('path.route.r4.is-dim')).toHaveCount(0)
  await expect(map.locator('path.route.r1.is-dim')).toHaveCount(2)
})

test('la búsqueda oculta lo que no coincide y las capas se pueden apagar', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await page.getByRole('searchbox', { name: 'Buscar pedidos' }).fill('fhj-890')
  await expect(map.locator('svg.pin:not(.is-dim)')).toHaveCount(3)
  await expect(map.locator('svg.pin')).toHaveCount(3)
  await expect(map.locator('svg.veh')).toHaveCount(1)
  await expect(map.locator('path.route')).toHaveCount(2)
  const layers = await openLayers(map)
  await layers.getByRole('button', { name: 'Rutas' }).click()
  await expect(map.locator('path.route')).toHaveCount(0)
  await layers.getByRole('button', { name: 'Pedidos' }).click()
  await expect(map.locator('svg.pin')).toHaveCount(0)
  await layers.getByRole('button', { name: 'Camiones' }).click()
  await expect(map.locator('svg.veh')).toHaveCount(0)
})

test('los botones de zoom acercan y alejan el mapa', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  const spread = async () => {
    const first = await map.locator('svg.pin').nth(0).boundingBox()
    const last = await map.locator('svg.pin').nth(11).boundingBox()
    return Math.hypot(first!.x - last!.x, first!.y - last!.y)
  }
  const before = await spread()
  await map.getByRole('button', { name: 'Acercar' }).click()
  // Un nivel de zoom duplica la separación; se espera a que termine la animación antes de volver a alejar.
  await expect.poll(spread).toBeGreaterThan(before * 1.9)
  await page.waitForTimeout(400)
  await map.getByRole('button', { name: 'Alejar' }).click()
  await expect.poll(spread).toBeLessThan(before * 1.2)
})

test('si los tiles no cargan avisa y deja usar la lista de pedidos (US-006)', async ({ page }) => {
  await stubTiles(page, 'fail')
  await page.goto(DEMO)
  await expect(page.getByText('No se pudo cargar el mapa base.')).toBeVisible()
  await expect(page.getByText(/Puedes seguir usando la lista de pedidos/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })).toHaveCount(1)
  await expect(page.locator('path.route')).toHaveCount(8)
  const fallback = page.getByRole('list', { name: 'Pedidos' })
  await expect(fallback.getByRole('listitem')).toHaveCount(12)
  await fallback.getByRole('button', { name: /PED-0035/ }).click()
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toContainText('Óptica Vitarte')
})

test('los filtros de estado y pedido ocultan rutas ajenas y se pueden limpiar', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  const filters = page.getByRole('group', { name: 'Filtros del mapa' })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await filters.getByRole('combobox', { name: 'Estado de los pedidos en el mapa' }).selectOption('EN_CAMINO')
  await expect(map.locator('svg.pin')).toHaveCount(6)
  await expect(map.locator('svg.pin--delivered')).toHaveCount(0)
  await expect(page.getByRole('tab', { name: /^En camino/ })).toHaveAttribute('aria-selected', 'true')
  await filters.getByRole('combobox', { name: 'Filtrar por pedido en el mapa' }).selectOption('PED-0044')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await expect(map.locator('svg.veh')).toHaveCount(1)
  await expect(map.locator('path.route')).toHaveCount(2)
  await expect(map.locator('path.route.r4')).toHaveCount(2)
  await expect(filters.getByRole('status')).toHaveText('1 de 12 pedidos · 1 ruta')
  await expect.poll(async () => {
    const frame = await map.boundingBox()
    const card = await map.locator('.eco-map__card').boundingBox()
    return !!frame && !!card && card.y >= frame.y && card.y + card.height <= frame.y + frame.height
  }).toBe(true)
  await page.getByRole('tab', { name: /^Pendientes/ }).click()
  await expect(map.locator('svg.pin')).toHaveCount(2)
  await page.getByRole('tab', { name: /^En camino/ }).click()
  await expect(map.locator('svg.pin')).toHaveCount(6)
  await expect(filters.getByRole('combobox', { name: 'Filtrar por pedido en el mapa' })).toHaveValue('')
  await filters.getByRole('combobox', { name: 'Estado de los pedidos en el mapa' }).selectOption('PENDIENTE')
  await expect(map.locator('svg.pin')).toHaveCount(2)
  await expect(map.locator('path.route')).toHaveCount(0)
  await expect(map.locator('svg.veh')).toHaveCount(0)
  await filters.getByRole('button', { name: 'Limpiar filtros del mapa' }).click()
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(map.locator('path.route')).toHaveCount(8)
  await expect(map.locator('svg.veh')).toHaveCount(4)
})

test('los filtros de búsqueda, distrito y estado del listado también filtran el mapa', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  const filters = page.getByRole('group', { name: 'Filtros del mapa' })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await page.getByLabel('Distrito', { exact: true }).selectOption('Ate')
  await expect(map.locator('svg.pin')).toHaveCount(3)
  await expect(map.locator('path.route')).toHaveCount(2)
  await page.getByRole('tab', { name: /^En camino/ }).click()
  await expect(map.locator('svg.pin')).toHaveCount(2)
  await filters.getByRole('searchbox', { name: 'Buscar en el mapa' }).fill('farmacia')
  await expect(page.getByRole('searchbox', { name: 'Buscar pedidos', exact: true })).toHaveValue('farmacia')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await filters.getByRole('searchbox', { name: 'Buscar en el mapa' }).fill('sin coincidencias')
  await expect(map.locator('svg.pin')).toHaveCount(0)
  await expect(map.locator('path.route')).toHaveCount(0)
  await expect(map.locator('svg.veh')).toHaveCount(0)
  await expect(map.getByText('Sin pedidos que coincidan con los filtros')).toBeVisible()
  await filters.getByRole('button', { name: 'Limpiar filtros del mapa' }).click()
  await expect(page.getByLabel('Distrito', { exact: true })).toHaveValue('')
  await expect(map.locator('svg.pin')).toHaveCount(12)
})

test('las tarjetas de pedidos, camiones y rutas se cierran con el ratón y se pueden reabrir', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group', { name: /Mapa de rutas/ })
  const card = map.locator('.eco-map__card')
  const pin = map.getByTitle('PED-0029 · Panadería San Hilarión · En camino')
  await pin.click()
  await card.getByText('Panadería San Hilarión', { exact: true }).click()
  await expect(card).toBeVisible()
  await map.getByRole('button', { name: 'Cerrar tarjeta' }).click()
  await expect(card).toHaveCount(0)
  await expect(map.locator('svg.pin.is-sel')).toHaveCount(0)
  await expect(map.locator('path.route.is-dim')).toHaveCount(0)
  await pin.click()
  const canvas = map.locator('.leaflet-container')
  const size = (await canvas.boundingBox())!
  await canvas.click({ position: { x: size.width - 35, y: 75 } })
  await expect(card).toHaveCount(0)

  const truck = map.getByTitle('Camión LIB-001 · Disponible')
  await truck.click()
  await expect(card).toContainText('LIB-001')
  await map.getByRole('button', { name: 'Cerrar tarjeta' }).click()
  await expect(map.locator('svg.veh.is-sel')).toHaveCount(0)
  await truck.click()
  await canvas.press('Escape')
  await expect(card).toHaveCount(0)

  // Clic sobre la geometría real de una ruta: su evento no debe cerrar la tarjeta.
  await page.getByLabel('Vista del mapa').selectOption('routes')
  const route = map.locator('path.route.r1').first()
  await expect(route).toBeVisible()
  const point = await route.evaluate(element => {
    const path = element as SVGPathElement
    const position = path.getPointAtLength(path.getTotalLength() / 2).matrixTransform(path.getScreenCTM()!)
    return { x: position.x, y: position.y }
  })
  await page.mouse.click(point.x, point.y)
  await expect(card).toContainText('Ruta ABC-123')
  await map.getByRole('button', { name: 'Cerrar tarjeta' }).click()
  await expect(card).toHaveCount(0)
  await expect(map.locator('path.route.is-focus')).toHaveCount(0)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('Vista del mapa').selectOption('vehicles')
  await truck.click()
  const close = map.getByRole('button', { name: 'Cerrar tarjeta' })
  const mapBox = (await canvas.boundingBox())!
  const closeBox = (await close.boundingBox())!
  expect(closeBox.x).toBeGreaterThanOrEqual(mapBox.x)
  expect(closeBox.y).toBeGreaterThanOrEqual(mapBox.y)
  expect(closeBox.x + closeBox.width).toBeLessThanOrEqual(mapBox.x + mapBox.width)
  expect(closeBox.y + closeBox.height).toBeLessThanOrEqual(mapBox.y + mapBox.height)
  await close.click()
  await expect(card).toHaveCount(0)
})

test('ocho combinaciones de capas y almacén independiente', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await expect(map.locator('svg.veh')).toHaveCount(5)
  await expect(map.getByRole('button', { name: 'Capas', exact: true })).toHaveAttribute('aria-expanded', 'false')
  await expect(map.getByRole('button', { name: 'Rutas', exact: true })).toHaveCount(0)
  const layers = await openLayers(map)
  for (let mask = 0; mask < 8; mask++) {
    for (const [bit, name] of ['Rutas', 'Pedidos', 'Camiones'].entries()) {
      const button = layers.getByRole('button', { name, exact: true })
      const wanted = !!(mask & (1 << bit))
      if ((await button.getAttribute('aria-pressed') === 'true') !== wanted) await button.click()
    }
    await expect(map.locator('path.route')).toHaveCount(mask & 1 ? 8 : 0)
    await expect(map.locator('svg.pin')).toHaveCount(mask & 2 ? 12 : 0)
    await expect(map.locator('svg.veh')).toHaveCount(mask & 4 ? 5 : 0)
    await expect(map.locator('svg.depot')).toHaveCount(1)
  }
  await map.getByRole('button', { name: 'Almacén', exact: true }).click()
  await expect(map.locator('svg.depot')).toHaveCount(0)
  await layers.getByRole('button', { name: 'Almacén', exact: true }).press('Escape')
  await expect(map.getByRole('button', { name: 'Capas', exact: true })).toHaveAttribute('aria-expanded', 'false')
  await expect(map.getByRole('button', { name: 'Capas', exact: true })).toBeFocused()
  await expect(map.getByRole('group', { name: 'Capas del mapa' })).toHaveCount(0)
})

test('perfiles aislados, camión sin ruta y contexto del conductor', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  await page.getByLabel('Vista del mapa').selectOption('vehicles')
  const map = page.getByRole('group', { name: /Mapa de rutas/ })
  await expect(map.locator('svg.veh')).toHaveCount(5)
  await expect(map.locator('svg.pin')).toHaveCount(0)
  await expect(map.locator('path.route')).toHaveCount(0)
  await expect(map.getByRole('button', { name: 'Rutas', exact: true })).toHaveCount(0)
  await map.getByTitle('Camión LIB-001 · Disponible').click()
  await expect(map.locator('.eco-map__card')).toContainText('Sin ruta asignada')
  await openLayers(map)
  await map.getByRole('button', { name: 'Camiones', exact: true }).click()
  await expect(map.locator('.eco-map__card')).toHaveCount(0)
  // Redimensionar y sustituir el mapa no debe dejar callbacks sobre el mapa retirado.
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByLabel('Vista del mapa').selectOption('driver')
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-basemap-ready', 'true')
  await expect(map.locator('svg.veh')).toHaveCount(1)
  await expect(map.locator('svg.pin')).toHaveCount(3)
  await expect(map.locator('path.route')).toHaveCount(2)
  await page.getByLabel('Vista del mapa').selectOption('routes')
  await expect(map.locator('svg.veh')).toHaveCount(0)
  await expect(map.locator('path.route')).toHaveCount(8)
})

test('el margen ampliado se puede explorar y restablecer conserva los pedidos de interés', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group', { name: /Mapa de rutas/ })
  const canvas = map.locator('.leaflet-container')
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(canvas).toHaveAttribute('data-map-zoom', /\d+/)
  const initialZoom = Number(await canvas.getAttribute('data-map-zoom'))
  for (let i = initialZoom; i < 14; i++) await map.getByRole('button', { name: 'Acercar', exact: true }).click()
  for (let i = initialZoom; i > 14; i--) await map.getByRole('button', { name: 'Alejar', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-map-zoom', '14')
  const box = (await canvas.boundingBox())!
  await canvas.focus()
  for (let i = 0; i < 18; i++) {
    await canvas.press('Shift+ArrowLeft')
    // Leaflet termina cada desplazamiento de teclado antes de aceptar el siguiente.
    await page.waitForTimeout(350)
  }
  // Se puede explorar el margen de 10 km añadido al oeste de la ventana anterior.
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-lng'))).toBeLessThan(-77.25)
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-lng'))).toBeGreaterThanOrEqual(-77.341834)
  await map.getByRole('button', { name: 'Ver Lima', exact: true }).click()
  await expect(canvas).toHaveAttribute('data-map-zoom', String(initialZoom))
  for (const pin of await map.locator('svg.pin').all()) {
    const position = (await pin.boundingBox())!
    expect(position.x).toBeGreaterThanOrEqual(box.x)
    expect(position.x + position.width).toBeLessThanOrEqual(box.x + box.width)
    expect(position.y).toBeGreaterThanOrEqual(box.y)
    expect(position.y + position.height).toBeLessThanOrEqual(box.y + box.height)
  }
})

test('zoom restringido, reencuadre y recuperación de fuente', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group', { name: /Mapa de rutas/ })
  const canvas = map.locator('.leaflet-container')
  await expect(canvas).toHaveAttribute('data-map-zoom', /\d+/)
  for (let i = 0; i < 15; i++) await map.getByRole('button', { name: 'Alejar', exact: true }).click()
  expect(Number(await canvas.getAttribute('data-map-zoom'))).toBeGreaterThanOrEqual(11)
  const box = await canvas.boundingBox()
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2)
  await page.mouse.down()
  await page.mouse.move(box!.x + box!.width / 2 + 1800, box!.y + box!.height / 2 + 1800, { steps: 12 })
  await page.mouse.up()
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-lng'))).toBeGreaterThanOrEqual(-77.341834)
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-lat'))).toBeGreaterThanOrEqual(-12.490395)
  await canvas.focus()
  for (let i = 0; i < 10; i++) await canvas.press('ArrowRight')
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-lng'))).toBeLessThanOrEqual(-76.508166)
  for (let i = 0; i < 20; i++) await map.getByRole('button', { name: 'Acercar', exact: true }).click()
  expect(Number(await canvas.getAttribute('data-map-zoom'))).toBeLessThanOrEqual(18)
  await map.getByRole('button', { name: 'Ver Lima', exact: true }).click()
  await expect.poll(async () => Number(await canvas.getAttribute('data-map-zoom'))).toBeLessThanOrEqual(15)
  const lat = Number(await canvas.getAttribute('data-map-lat'))
  const lng = Number(await canvas.getAttribute('data-map-lng'))
  expect(lat).toBeGreaterThanOrEqual(-12.490395); expect(lat).toBeLessThanOrEqual(-11.559600)
  expect(lng).toBeGreaterThanOrEqual(-77.341834); expect(lng).toBeLessThanOrEqual(-76.508166)
  await page.getByRole('button', { name: 'Alternar fallo de fuente' }).click()
  await expect(page.getByText('Fuente de prueba no disponible.')).toBeVisible()
  await page.getByRole('button', { name: 'Reintentar mapa' }).click()
  await expect(page.getByText('Fuente de prueba no disponible.')).toBeVisible()
  await page.getByRole('button', { name: 'Alternar fallo de fuente' }).click()
  await expect(map.locator('svg.veh')).toHaveCount(5)
})

test('contingencia de solo camiones y reintento cartográfico', async ({ page }) => {
  await stubTiles(page, 'fail')
  await page.goto('/tests/ui/map.html')
  await page.getByLabel('Vista del mapa').selectOption('vehicles')
  const list = page.getByRole('list', { name: 'Camiones' })
  await expect(list.getByRole('listitem')).toHaveCount(5)
  await page.unroute('**/maps/lima-pastel.json')
  await stubTiles(page)
  await page.getByRole('button', { name: 'Reintentar mapa' }).click()
  await expect(page.locator('svg.veh')).toHaveCount(5)
})

test('si falla el servidor vectorial conserva la lista operativa', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**',route => route.abort())
  await page.route('**/maps/lima-pastel.json', route => route.fulfill({ json: {
    version: 8,
    sources: { openmaptiles: { type: 'vector', url: 'http://127.0.0.1:5178/failed-vector.json' } },
    layers: [{ id: 'land', type: 'fill', source: 'openmaptiles', 'source-layer': 'landuse' }],
  } }))
  await page.route('**/failed-vector.json', route => route.abort())
  await page.goto('/tests/ui/map.html')
  await expect(page.getByText('No se pudo descargar la cartografía. Revisa tu conexión.')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Pedidos' }).getByRole('listitem')).toHaveCount(12)
})

test('el mapa alternativo conserva rutas y pedidos si falla el proveedor vectorial',async ({page}) => {
  await page.route('**/maps/lima-pastel.json',route => route.fulfill({json:{version:8,
    sources:{openmaptiles:{type:'vector',url:'http://127.0.0.1:5178/unavailable-vector.json'}},
    layers:[{id:'land',type:'fill',source:'openmaptiles','source-layer':'landuse'}]}}))
  await page.route('**/unavailable-vector.json',route => route.abort())
  // Imagen de prueba local: no se descargan teselas reales durante la automatización.
  await page.route('https://tile.openstreetmap.org/**',route => route.fulfill({contentType:'image/svg+xml',
    body:'<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="#f4f0e6"/></svg>'}))
  await page.goto('/tests/ui/map.html')
  const map = page.getByRole('group',{name:/Mapa de rutas/})
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-basemap','raster-osm')
  await expect(map.locator('.leaflet-container')).toHaveAttribute('data-basemap-ready','true')
  await expect(map.locator('path.route')).toHaveCount(8)
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap')
})

test('un navegador sin gráficos compatibles muestra contingencia sin errores de página', async ({ page }) => {
  await stubTiles(page)
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', { value: function(this: HTMLCanvasElement, type: string, options?: unknown) {
      return type.startsWith('webgl') ? null : original.call(this, type, options)
    } })
  })
  await page.goto('/tests/ui/map.html')
  await expect(page.getByText('No se pudo dibujar la cartografía en este navegador.')).toBeVisible()
  await expect(page.getByRole('list', { name: 'Pedidos' }).getByRole('listitem')).toHaveCount(12)
  await expect(page.getByRole('button', { name: 'Reintentar mapa' })).toBeVisible()
})
