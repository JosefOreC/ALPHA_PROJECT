import { test, expect } from '@playwright/test'
import axe from 'axe-core'
import { captureEvidence, mockSession, stubTiles } from './fixtures'

test('coloca móviles y pedidos en Lima y dibuja las rutas en ese mismo mapa', async ({ page }, testInfo) => {
  await mockSession(page, 'admin')
  await stubTiles(page)
  let fail = true
  let payload: { vehicles: { lat: number; lng: number }[]; orders: { lat: number; lng: number }[] } | undefined
  await page.route('**/api/routes/simulate', async route => {
    const scenario = route.request().postDataJSON()
    payload = scenario
    if (fail) { fail = false; return route.fulfill({ status: 503, json: { detail: 'Proveedor vial temporalmente no disponible.' } }) }
    const a = scenario.vehicles[0], b = scenario.orders[0]
    return route.fulfill({ json: { simulation: true, routeCount: 1, ordersAssigned: 1, totalKm: 2.5, co2Kg: .67, windowCompliance: 100, elapsedSeconds: .01,
      routes: [{ plate: a.id, driver: a.id, zone: 'Lima', fuel: 'DIESEL', stops: 1, km: 2.5, load: .5, co2Kg: .67,
        path: [{ lat: a.lat, lng: a.lng }, { lat: a.lat + .001, lng: b.lng }, { lat: b.lat, lng: b.lng }], sequence: [{ id: b.id, customer: b.id, district: 'Lima', eta: '08:12', onTime: true }] }] } })
  })
  await page.goto('/?vista=ruta-demo')
  const map = page.getByRole('group', { name: 'Mapa de Lima para la simulación', exact: true })
  await expect(map).toBeVisible()
  await expect(page.getByRole('button', { name: 'Calcular rutas de prueba' })).toBeDisabled()
  const canvas = map.locator('.leaflet-container')
  await canvas.click({ position: { x: 115, y: 150 } })
  await expect(map.getByTitle('Movil-1: origen del móvil')).toBeVisible()
  await page.getByRole('button', { name: 'Colocar pedido', exact: true }).click()
  await canvas.click({ position: { x: 205, y: 250 } })
  await expect(map.getByTitle('Pedido-1: destino del pedido')).toBeVisible()
  await page.getByLabel('Peso de Pedido-1').fill('7')
  await page.getByRole('button', { name: 'Calcular rutas de prueba' }).click()
  await expect(page.getByRole('alert')).toContainText('Proveedor vial')
  expect(payload?.vehicles[0].lat).toBeLessThan(-11)
  expect(payload?.orders[0].lng).toBeLessThan(-76)
  await page.getByRole('button', { name: 'Calcular rutas de prueba' }).click()
  await expect(page.getByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
  await expect(map.locator('path.route')).toHaveCount(1)
  await expect(page.getByText('Distancia vial', { exact: true })).toBeVisible()
  // Keyboard placement uses the same map and creates another independent point.
  await canvas.focus()
  await canvas.press('ArrowRight')
  await canvas.press('Enter')
  await expect(map.getByTitle('Pedido-2: destino del pedido')).toBeVisible()
  await expect(page.getByRole('region', { name: 'Resultado de la simulación' })).toHaveCount(0)
  await page.addScriptTag({ content: axe.source })
  const violations = await page.evaluate(() => (window as unknown as { axe: typeof axe }).axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  }).then(results => results.violations.map(rule => ({ id: rule.id, targets: rule.nodes.map(node => node.target) }))))
  expect(violations).toEqual([])
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await testInfo.attach('laboratorio-lima', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  await captureEvidence(page, `laboratorio-lima-${testInfo.project.name}.png`)
})

test('mantiene restringido el laboratorio para perfiles de consulta', async ({ page }) => {
  await mockSession(page, 'auditor')
  await page.goto('/?vista=ruta-demo')
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ruta demo' })).toHaveCount(0)
})
