import { test, expect } from '@playwright/test'
import { mockApi, mockSession as session } from './fixtures'

test('la URL y una preferencia demo no elevan los permisos de un auditor en modo HTTP', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('ecologistica.demo-account', 'demo-admin'))
  await session(page, 'auditor')
  await mockApi(page)
  let dashboardCalls = 0
  await page.route('**/api/v1/dashboard**', route => { dashboardCalls++; return route.fulfill({ status: 403, json: {} }) })
  await page.goto('/?vista=dashboard&role=admin')
  await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Usuario de demostración' })).toHaveCount(0)
  expect(dashboardCalls).toBe(0)
  await page.getByRole('button', { name: 'Ir a mi inicio' }).click()
  await expect(page.getByRole('heading', { name: 'Pedidos y rutas' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Registrar pedido|Editar pedido|Cancelar pedido/ })).toHaveCount(0)
  await expect(page.getByRole('group', { name: /Mapa/ })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /Auditoría/ })).toBeVisible()
})

test('una sesión ausente o de evaluador no monta módulos ni consulta pedidos', async ({ page }) => {
  let calls = 0
  await page.route('**/api/pedidos**', route => { calls++; return route.fulfill({ status: 401, json: {} }) })
  await session(page, null)
  await page.goto('/?vista=pedidos')
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
  expect(calls).toBe(0)
  await page.unroute('**/api/session')
  await session(page, 'ROL-06')
  await page.reload()
  await expect(page.getByRole('alert')).toContainText('sesión recibida no es válida')
  expect(calls).toBe(0)
})

test('el planificador consulta parámetros y el administrador no obtiene controles de ejecución', async ({ page }) => {
  await session(page, 'planner')
  await page.goto('/?vista=admin')
  await expect(page.getByRole('tab', { name: /Parámetros del algoritmo/ })).toBeVisible()
  await expect(page.getByRole('tab', { name: /Usuarios y roles/ })).toHaveCount(0)
  await expect(page.getByRole('button', { name: /Guardar/ })).toHaveCount(0)
  await page.unroute('**/api/session')
  await session(page, 'admin')
  await page.goto('/?vista=rutas')
  await expect(page.getByRole('heading', { name: 'Rutas del día' })).toBeVisible()
  await expect(page.getByRole('button', { name: /Generar/ })).toHaveCount(0)
})

for (const role of ['logistics', 'driver']) {
  test(`${role}: consulta flota sin escrituras y no accede a administración`, async ({ page }) => {
    if (role === 'driver') await page.setViewportSize({ width: 390, height: 844 })
    await session(page, role)
    await page.route('**/api/v1/vehicles**', route => route.fulfill({ status: 200, json: { total: 0, vehiculos: [], mensaje: null } }))
    await page.goto('/?vista=flota')
    await expect(page.getByRole('heading', { name: 'Flota', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Registrar vehículo' })).toHaveCount(0)
    await page.goto('/?vista=admin')
    await expect(page.getByRole('heading', { name: 'Acceso restringido' })).toBeVisible()
    if (role === 'driver') {
      const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }))
      expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport)
    }
  })
}
