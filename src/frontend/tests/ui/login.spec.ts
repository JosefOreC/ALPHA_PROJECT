import { test, expect } from '@playwright/test'
import { captureEvidence } from './fixtures'

test('inicio, creación de usuario por administrador y cierre de sesión', async ({ page }) => {
  let authenticated = false
  let created = false
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.route('**/api/session', async route => {
    const request = route.request()
    if (request.method() === 'DELETE') {
      expect(request.headers()['x-csrf-token']).toBe('verified-csrf')
      authenticated = false
      return route.fulfill({ status: 204 })
    }
    if (request.method() === 'POST') {
      expect(request.postDataJSON()).toEqual({ email: 'admin@empresa.pe', password: 'una-clave-segura' })
      authenticated = true
    }
    return route.fulfill(authenticated ? { status: 200, json: { subject_id: 'admin-1', name: 'Administrador', role: 'admin', driver_id: null, plate: null, csrf_token: 'verified-csrf' } } : { status: 401, json: { detail: 'Sin sesión' } })
  })
  await page.route('**/api/admin/users', async route => {
    if (route.request().method() === 'POST') {
      expect(route.request().headers()['x-csrf-token']).toBe('verified-csrf')
      expect(route.request().postDataJSON()).toEqual({ name: 'Nuevo Conductor', email: 'nuevo@empresa.pe', password: 'acceso-conductor', role: 'driver' })
      created = true
      return route.fulfill({ status: 201, json: { id: 'new-user' } })
    }
    return route.fulfill({ json: { total: created ? 1 : 0, roleCounts: { admin: 0, planner: 0, driver: created ? 1 : 0, logistics: 0, auditor: 0 }, items: created ? [{ id: 'new-user', name: 'Nuevo Conductor', email: 'nuevo@empresa.pe', role: 'driver', status: 'active', lastAccess: 'Sin acceso' }] : [] } })
  })
  await page.route('**/api/admin/parameters', route => route.fulfill({ json: { co2Weight: 70, maxSeconds: 45, maxLoadPercent: 95, windowSlackMinutes: 10, autoReoptimize: false, emissionFactors: { DIESEL: 2.68, GASOLINA: 2.31, GNV: null, GLP: null, ELECTRICO: null, HIBRIDO: null } } }))
  await page.route('**/api/admin/integrations', route => route.fulfill({ json: [] }))
  await page.goto('/?vista=admin')
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Usuario de demostración' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /registr/i })).toHaveCount(0)
  expect(await page.locator('main').getAttribute('data-theme')).toBe('light')
  await captureEvidence(page, `login-${test.info().project.name}.png`)
  await page.getByLabel('Correo electrónico').fill('admin@empresa.pe')
  await page.getByLabel('Contraseña', { exact: true }).fill('una-clave-segura')
  await page.getByRole('button', { name: 'Ingresar' }).click()
  await expect(page.getByRole('heading', { name: 'Administración', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Crear usuario', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Crear usuario' })
  await dialog.getByLabel('Nombre completo').fill('Nuevo Conductor')
  await dialog.getByLabel('Correo electrónico').fill('nuevo@empresa.pe')
  await dialog.getByLabel('Rol', { exact: true }).selectOption('driver')
  await dialog.getByLabel('Contraseña inicial').fill('acceso-conductor')
  await dialog.getByRole('button', { name: 'Crear usuario', exact: true }).click()
  await expect(page.getByText('nuevo@empresa.pe')).toBeVisible()
  expect(created).toBe(true)
  await expect(dialog).not.toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await captureEvidence(page, `administracion-${test.info().project.name}.png`)
  await page.getByRole('button', { name: 'Cerrar sesión' }).click()
  await expect(page.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible()
  expect(authenticated).toBe(false)
})
