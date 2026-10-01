import { test, expect } from '@playwright/test'
import type { Page, Locator } from '@playwright/test'
import { captureEvidence, fillOrder } from './fixtures'

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

test('390 px: listado, formulario, detalle y diálogo sin recortes ni desbordamiento de página', async ({ page }) => {
  await page.goto('/tests/ui/demo.html')
  await expect(page.getByRole('table')).toBeVisible()
  await fitsControls(page, page.locator('.filters select, .section-header button, .pagination button'))
  const table = page.getByRole('region', { name: /Listado de pedidos/ })
  const scrolled = await table.evaluate(element => {
    element.scrollLeft = 250
    return { width: element.clientWidth, content: element.scrollWidth, scroll: element.scrollLeft }
  })
  expect(scrolled.content).toBeGreaterThan(scrolled.width)
  expect(scrolled.scroll).toBeGreaterThan(0)
  await fitsPage(page)
  await table.evaluate(element => { element.scrollLeft = 0 })
  await captureEvidence(page, 'movil-listado.png')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await fillOrder(page, 'Destinatario ficticio ' + 'x'.repeat(150))
  await page.getByLabel('Indicaciones adicionales').fill('Mensaje ficticio largo: ' + 'x'.repeat(800))
  await fitsControls(page, page.locator('.order-form input, .order-form select, .order-form textarea, .order-form button'))
  await page.getByLabel('Destinatario *', { exact: true }).fill('Destinatario ficticio móvil')
  await page.getByLabel('Indicaciones adicionales').fill('Entrega ficticia. Horario de Lima.')
  await captureEvidence(page, 'movil-formulario.png')
  await page.getByLabel('Fin de ventana · Lima *').fill('2026-10-02T09:00')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await expect(page.getByRole('alert')).toBeVisible()
  await fitsPage(page)
  await page.getByLabel('Fin de ventana · Lima *').fill('2026-10-02T12:00')
  await page.getByRole('button', { name: 'Registrar pedido', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Detalle del pedido' })).toBeVisible()
  await fitsControls(page, page.locator('.detail-card button'))
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
  await expect(page.locator('.detail-card .order-status')).toHaveText('Pendiente')
  await page.getByRole('button', { name: 'Cancelar pedido', exact: true }).click()
  await dialog.getByRole('button', { name: 'Sí, cancelar pedido', exact: true }).click()
  await expect(page.locator('.detail-card .order-status')).toHaveText('Cancelado')
  await fitsPage(page)
})

test('390 px: mensajes largos sin espacios no desbordan', async ({ page }) => {
  await page.goto('/tests/ui/demo.html?error-largo')
  await expect(page.getByRole('alert')).toContainText('Error ficticio')
  await fitsPage(page)
  await fitsControls(page, page.getByRole('button', { name: 'Volver a cargar' }))
})
