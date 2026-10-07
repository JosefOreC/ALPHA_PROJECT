import { test, expect } from '@playwright/test'
import { stubTiles } from './fixtures'

const DEMO = '/tests/ui/demo.html'

test('el mapa dibuja rutas, pedidos y vehículos sobre OpenStreetMap', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await expect(map.locator('svg.veh')).toHaveCount(4)
  await expect(map.locator('path.route')).toHaveCount(8)
  await expect(map.locator('path.route--done')).toHaveCount(4)
  await expect(map.locator('.leaflet-control-attribution')).toContainText('OpenStreetMap')
  // La forma del pin cuenta el estado: rombo pendiente, check entregado, ✕ cancelado.
  await expect(map.locator('svg.pin--pending')).toHaveCount(2)
  await expect(map.locator('svg.pin--delivered')).toHaveCount(3)
  await expect(map.locator('svg.pin--cancelled')).toHaveCount(1)
  await expect(map.locator('svg.pin--transit')).toHaveCount(6)
})

test('elegir un pin selecciona el pedido, resalta su ruta y muestra la tarjeta', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await map.getByTitle('PED-0029 · Panadería San Hilarión · En camino').click()
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

test('la búsqueda atenúa lo que no coincide y las capas se pueden apagar', async ({ page }) => {
  await stubTiles(page)
  await page.goto(DEMO)
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  await page.getByRole('searchbox', { name: 'Buscar pedidos' }).fill('fhj-890')
  await expect(map.locator('svg.pin:not(.is-dim)')).toHaveCount(3)
  const layers = map.getByRole('group', { name: 'Capas del mapa' })
  await layers.getByRole('button', { name: 'Rutas' }).click()
  await expect(map.locator('path.route')).toHaveCount(0)
  await layers.getByRole('button', { name: 'Pedidos' }).click()
  await expect(map.locator('svg.pin')).toHaveCount(0)
  await layers.getByRole('button', { name: 'Vehículos' }).click()
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
  await expect(page.getByText('No se pudo cargar el mapa.')).toBeVisible()
  await expect(page.getByText(/Puedes seguir usando la lista de pedidos/)).toBeVisible()
  await expect(page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })).toHaveCount(0)
  const fallback = page.getByRole('list', { name: 'Pedidos' })
  await expect(fallback.getByRole('listitem')).toHaveCount(12)
  await fallback.getByRole('button', { name: /PED-0035/ }).click()
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toContainText('Óptica Vitarte')
})
