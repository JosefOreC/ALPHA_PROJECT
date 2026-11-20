import { test, expect } from '@playwright/test'
import { captureEvidence, mockSession } from './fixtures'

test('construye un escenario, calcula, presenta el recorrido y permite corregir errores', async ({ page }, testInfo) => {
  await mockSession(page, 'admin')
  let fail = true
  await page.route('**/api/routes/simulate', async route => {
    const scenario = route.request().postDataJSON()
    if (fail) { fail = false; return route.fulfill({ status: 422, json: { detail: 'Capacidad insuficiente para el pedido.' } }) }
    return route.fulfill({ json: { simulation: true, routeCount: 1, ordersAssigned: 1, totalKm: 5, co2Kg: 1.34, windowCompliance: 100, elapsedSeconds: .01,
      routes: [{ plate: scenario.vehicles[0].id, driver: 'Móvil de prueba', zone: 'Plano', fuel: 'DIESEL', stops: 1, km: 5, load: .5, co2Kg: 1.34,
        points: [{ x: 0, y: 0 }, { x: 3, y: 4 }], sequence: [{ id: scenario.orders[0].id, customer: scenario.orders[0].id, district: 'Plano', eta: '08:12', onTime: true }] }] } })
  })
  await page.goto('/?vista=ruta-demo')
  await expect(page.getByRole('heading', { name: 'Laboratorio de rutas' })).toBeVisible()
  await page.getByRole('button', { name: 'Limpiar escenario' }).click()
  await expect(page.getByRole('button', { name: 'Calcular rutas de prueba' })).toBeDisabled()
  await page.getByRole('button', { name: 'Agregar móvil' }).click()
  await page.getByRole('button', { name: 'Agregar pedido' }).click()
  await page.getByLabel('Pedido-1 y', { exact: true }).fill('4')
  await page.getByRole('button', { name: 'Calcular rutas de prueba' }).click()
  await expect(page.getByRole('alert')).toContainText('Capacidad insuficiente')
  await page.getByLabel('Movil-1 capacity').fill('80')
  await page.getByRole('button', { name: 'Calcular rutas de prueba' }).click()
  await expect(page.getByRole('region', { name: 'Resultado de la simulación' })).toBeVisible()
  await expect(page.getByRole('img', { name: /Plano de simulación/ })).toBeVisible()
  const widths = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }))
  expect(widths.content).toBeLessThanOrEqual(widths.viewport)
  await testInfo.attach('laboratorio', { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  await captureEvidence(page, `laboratorio-${testInfo.project.name}.png`)
})

test('mantiene restringido el laboratorio para perfiles de consulta', async ({ page }) => {
  await mockSession(page, 'auditor')
  await page.goto('/?vista=ruta-demo')
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ruta demo' })).toHaveCount(0)
})
