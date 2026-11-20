import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { mockApi, mockSession, stubTiles } from './fixtures'
import { DemoOrders } from '../../src/infrastructure/demo/demoOrders'

async function fitsPage(page: Page) {
  const size = await page.evaluate(() => ({ width: innerWidth, viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(size.width).toBe(390)
  expect(size.content).toBeLessThanOrEqual(size.viewport)
}

/** EN-05: todo control táctil mide al menos 48 px de alto. */
async function touchTargets(controls: Locator) {
  const boxes = await controls.evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => {
    const rect = node.getBoundingClientRect()
    return { label: (node.getAttribute('aria-label') ?? node.textContent ?? '').trim().slice(0, 40), height: rect.height, width: rect.width }
  }))
  expect(boxes.length).toBeGreaterThan(0)
  for (const box of boxes) expect(box.height, box.label).toBeGreaterThanOrEqual(47.5)
}

test('390 px: Mi ruta cabe en pantalla y sus controles miden 48 px', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/driver.html')
  await expect(page.getByRole('list', { name: 'Paradas de hoy' })).toBeVisible()
  await fitsPage(page)
  await touchTargets(page.locator('.eco-phone button:not([disabled]), .eco-phone .eco-stop__link, .eco-tabbar a'))
  await page.getByRole('button', { name: 'Entendido' }).click()
  await expect(page.getByText('Tu ruta cambió')).toHaveCount(0)
  await fitsPage(page)
})

test('390 px: confirmar la entrega actualiza el avance y lleva a la siguiente parada', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/driver.html')
  await page.getByRole('link', { name: 'Minimarket Don Lucho →' }).click()
  await expect(page.getByRole('heading', { name: 'Minimarket Don Lucho' })).toBeVisible()
  await expect(page.getByText('2/9')).toBeVisible()
  await fitsPage(page)
  await touchTargets(page.locator('.eco-phone__footer .eco-btn, .eco-tabbar a, .eco-phone__back'))

  await page.getByRole('button', { name: 'Confirmar entrega' }).click()
  const sheet = page.getByRole('dialog', { name: '¿Ya entregaste el pedido?' })
  await expect(sheet).toBeVisible()
  await touchTargets(sheet.getByRole('button'))
  const box = await sheet.boundingBox()
  expect(box!.y + box!.height).toBeLessThanOrEqual(844 + 1)
  await sheet.getByRole('button', { name: 'Volver' }).click()
  await expect(sheet).not.toBeVisible()

  await page.getByRole('button', { name: 'Confirmar entrega' }).click()
  await sheet.getByRole('button', { name: 'Sí, confirmar entrega' }).click()
  await expect(page.getByText('Entrega confirmada')).toBeVisible()
  await expect(page.getByText('3/9')).toBeVisible()
  await fitsPage(page)
  await page.getByRole('link', { name: 'Siguiente parada →' }).click()
  await expect(page.getByRole('heading', { name: 'Botica San Martín' })).toBeVisible()
  await expect(page.getByText('PED-0055 · parada 4')).toBeVisible()
})

test('390 px: un nombre y una dirección muy largos no desbordan', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/driver.html?pedido')
  await expect(page.getByRole('heading', { name: 'Minimarket Don Lucho' })).toBeVisible()
  await page.evaluate(() => {
    document.querySelector('.eco-phone__h1')!.textContent = 'Distribuidora' + 'x'.repeat(120)
    document.querySelector('.eco-phone__address')!.textContent = 'Avenida' + 'y'.repeat(150)
  })
  await fitsPage(page)
})

test('Mi ruta aprovecha el ancho de escritorio con el mapa junto a las paradas', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 })
  await stubTiles(page)
  await page.goto('/tests/ui/driver.html')
  const stops = page.getByRole('list', { name: 'Paradas de hoy' })
  await expect(stops).toBeVisible()
  const map = await page.locator('.eco-driver-route__map').boundingBox()
  const list = await stops.boundingBox()
  expect(map!.width).toBeGreaterThan(480)
  expect(map!.x + map!.width).toBeLessThan(list!.x)
})

for (const viewport of [{ width: 1920, height: 1080 }, { width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`el conductor navega sus seis pantallas a ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await mockSession(page, 'driver')
    await mockApi(page, { readOnly: true })
    await stubTiles(page)
    const demo = new DemoOrders()
    await page.route('**/api/conductor/ruta', async route => route.fulfill({ json: await demo.route() }))
    await page.route('**/api/conductor/pedidos/PED-0026', async route => route.fulfill({ json: await demo.view('PED-0026') }))
    await page.route('**/api/incidents', route => route.fulfill({ json: [
      { id: '1', fecha: '2026-10-01T11:00:00-05:00', tipo: 'Entrega', descripcion: 'Incidencia de prueba', estado: 'Abierta' },
    ] }))
    await page.route('**/api/v1/vehicles**', route => route.fulfill({ json: { total: 0, vehiculos: [], mensaje: null } }))
    await page.route('**/api/v1/drivers', route => route.fulfill({ json: { items: [{
      conductor_id: 'd1', nombre_completo: 'Conductor ficticio', dni: '00000000', licencia: 'A1', vehiculo_id: '', estado: 'ACTIVO',
    }] } }))

    const fit = async () => {
      const { content, available } = await page.evaluate(() => ({
        content: document.documentElement.scrollWidth, available: document.documentElement.clientWidth,
      }))
      expect(content).toBeLessThanOrEqual(available)
    }
    const desktop = viewport.width >= 900
    const assertLayout = async (first: Locator, second: Locator) => {
      await expect(first).toBeVisible()
      await expect(second).toBeVisible()
      const a = (await first.boundingBox())!
      const b = (await second.boundingBox())!
      if (desktop) expect(a.x + a.width).toBeLessThanOrEqual(b.x)
      else expect(a.y + a.height).toBeLessThanOrEqual(b.y)
      await fit()
    }

    await page.goto('/?vista=mi-ruta')
    await assertLayout(page.locator('.eco-driver-route__map'), page.getByRole('list', { name: 'Paradas de hoy' }))
    expect((await page.locator('.eco-driver-route').boundingBox())!.width).toBeGreaterThan(viewport.width * 0.9)
    await page.getByRole('link', { name: 'Pedido actual' }).click()
    await expect(page.getByRole('heading', { name: 'Minimarket Don Lucho' })).toBeVisible()
    const summary = page.getByRole('region', { name: 'Tu impacto hoy' })
    const details = page.getByRole('main')
    await assertLayout(desktop ? details : summary, desktop ? summary : details)
    expect((await page.locator('.eco-driver-order').boundingBox())!.width).toBeGreaterThan(viewport.width * 0.9)
    await page.getByRole('button', { name: 'Confirmar entrega', exact: true }).click()
    const confirmation = page.getByRole('dialog')
    await expect(confirmation).toBeInViewport()
    if (desktop) {
      const box = (await confirmation.boundingBox())!
      expect(Math.abs(box.y + box.height / 2 - viewport.height / 2)).toBeLessThan(5)
    }
    await confirmation.getByRole('button', { name: 'Volver' }).click()

    await page.getByRole('button', { name: 'Reportar incidencia' }).click()
    await expect(page.getByRole('heading', { name: 'Incidencias', exact: true })).toBeVisible()
    await assertLayout(page.locator('.eco-record-form'), page.getByRole('region', { name: 'Historial de incidencias' }))
    await expect(page.getByLabel('Pedido', { exact: true })).toBeEnabled()
    await expect(page.getByText('Incidencia de prueba')).toBeAttached()

    const modules = page.getByRole('navigation', { name: 'Módulos' })
    for (const [label, content] of [
      ['Pedidos', 'Destinatario ficticio'], ['Flota', 'Flota'], ['Conductores', 'Conductor ficticio'],
    ]) {
      await modules.getByRole('link', { name: label, exact: true }).click()
      await expect(page.getByRole('main').getByText(content, { exact: true }).first()).toBeVisible()
      expect((await page.locator('.eco-main').boundingBox())!.width).toBeGreaterThan(viewport.width * 0.9)
      await fit()
    }
  })
}
