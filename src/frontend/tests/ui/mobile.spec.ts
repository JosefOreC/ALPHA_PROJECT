import { test, expect } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'
import { captureEvidence, fillOrder, stubTiles } from './fixtures'

async function fitsPage(page: Page) {
  const size = await page.evaluate(() => ({ width: innerWidth, viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
  expect(size.width).toBe(390)
  expect(size.content).toBeLessThanOrEqual(size.viewport)
}

async function fitsControls(page: Page, controls: Locator) {
  const bounds = await controls.evaluateAll(nodes => nodes.filter(node => node.getClientRects().length).map(node => {
    const rect = node.getBoundingClientRect()
    return { label: node.getAttribute('id') ?? node.textContent, left: rect.left, right: rect.right, width: rect.width }
  }))
  expect(bounds.length).toBeGreaterThan(0)
  for (const rect of bounds) {
    expect(rect.left, String(rect.label)).toBeGreaterThanOrEqual(0)
    expect(rect.right, String(rect.label)).toBeLessThanOrEqual(390)
    expect(rect.width, String(rect.label)).toBeGreaterThan(0)
  }
  await fitsPage(page)
}

test('390 px: filtrar el mapa por estado y pedido conserva controles dentro de pantalla', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/demo.html')
  const map = page.getByRole('group', { name: /Mapa de rutas de Lima Este/ })
  const filters = page.getByRole('group', { name: 'Filtros del mapa' })
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await fitsControls(page, filters.locator('input, select, button'))
  await filters.getByRole('combobox', { name: 'Estado de los pedidos en el mapa' }).selectOption('PENDIENTE')
  await expect(map.locator('svg.pin')).toHaveCount(2)
  await expect(map.locator('path.route')).toHaveCount(0)
  await filters.getByRole('combobox', { name: 'Filtrar por pedido en el mapa' }).selectOption('PED-0052')
  await expect(map.locator('svg.pin')).toHaveCount(1)
  await fitsControls(page, filters.locator('input, select, button'))
  await filters.getByRole('button', { name: 'Limpiar filtros del mapa' }).click()
  await expect(map.locator('svg.pin')).toHaveCount(12)
  await fitsPage(page)
})

test('390 px: listado, formulario, detalle y diálogo sin recortes ni desbordamiento de página', async ({ page }) => {
  await stubTiles(page)
  await page.goto('/tests/ui/demo.html')
  await expect(page.getByRole('grid', { name: 'Pedidos por estado' })).toBeVisible()
  await fitsControls(page, page.locator('#filter-district, .eco-seg-ctrl button, .eco-topbar__end .eco-btn'))
  // Las pestañas y la lista se desplazan dentro de su contenedor; la página no.
  const tabs = page.getByRole('tablist', { name: 'Filtrar por estado' })
  const scrolled = await tabs.evaluate(element => {
    element.scrollLeft = 120
    return { width: element.clientWidth, content: element.scrollWidth, scroll: element.scrollLeft }
  })
  expect(scrolled.content).toBeGreaterThan(scrolled.width)
  expect(scrolled.scroll).toBeGreaterThan(0)
  await fitsPage(page)
  await tabs.evaluate(element => { element.scrollLeft = 0 })
  await captureEvidence(page, 'movil-listado.png')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await fillOrder(page, 'Destinatario ficticio ' + 'x'.repeat(150))
  await page.getByLabel('Indicaciones adicionales').fill('Mensaje ficticio largo: ' + 'x'.repeat(800))
  await fitsControls(page, page.locator('.eco-form input, .eco-form select, .eco-form textarea, .eco-form button'))
  await page.getByLabel('Destinatario *', { exact: true }).fill('Destinatario ficticio móvil')
  await page.getByLabel('Indicaciones adicionales').fill('Entrega ficticia. Horario de Lima.')
  await captureEvidence(page, 'movil-formulario.png')
  await page.getByLabel('Fin de ventana · Lima *').fill('2026-10-02T09:00')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await fitsPage(page)
  await page.getByLabel('Fin de ventana · Lima *').fill('2026-10-02T12:00')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toBeVisible()
  await fitsControls(page, page.locator('.eco-sheet__actions button'))
  await captureEvidence(page, 'movil-detalle.png')
  await page.getByRole('button', { name: 'Cancelar pedido', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await fitsControls(page, dialog.getByRole('button'))
  const rect = await dialog.boundingBox()
  expect(rect!.y).toBeGreaterThanOrEqual(0)
  expect(rect!.y + rect!.height).toBeLessThanOrEqual(844)
  // Una captura de viewport preserva la posición real del diálogo modal.
  if (process.env.CRUD_EVIDENCE_DIR) {
    const { resolve } = await import('node:path')
    await page.screenshot({ path: resolve(process.env.CRUD_EVIDENCE_DIR, 'movil-dialogo.png') })
  }
  await dialog.getByRole('button', { name: 'Volver', exact: true }).click()
  await expect(dialog).not.toBeVisible()
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toContainText('Pendiente')
  await page.getByRole('button', { name: 'Cancelar pedido', exact: true }).click()
  await dialog.getByRole('button', { name: 'Sí, cancelar pedido', exact: true }).click()
  await expect(page.getByRole('article', { name: 'Detalle del pedido seleccionado' })).toContainText('Cancelado')
  await fitsPage(page)
})

test('390 px: mensajes largos sin espacios no desbordan', async ({ page }) => {
  await page.goto('/tests/ui/demo.html?error-largo')
  await expect(page.getByRole('alert')).toContainText('Error ficticio')
  await fitsPage(page)
  await fitsControls(page, page.getByRole('button', { name: 'Volver a cargar' }))
})
