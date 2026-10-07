import { test, expect } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'
import { stubTiles } from './fixtures'

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
