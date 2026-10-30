import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'

const PAGE = '/tests/ui/sostenibilidad.html'

test('Exportar CSV descarga un archivo real con los datos del periodo', async ({ page }) => {
  await page.goto(PAGE)
  await expect(page.getByText('SEM 4', { exact: true })).toBeVisible()

  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar CSV' }).click()])
  expect(download.suggestedFilename()).toBe('reporte-sostenibilidad-month-octubre-2026.csv')
  const content = await readFile((await download.path())!, 'utf8')
  expect(content.charCodeAt(0)).toBe(0xfeff)
  expect(content).toContain('CO2 evitado,658,kg')
  expect(content).toContain('SEM 4,694,181,875')
  expect(content).toContain('GJK-112,DIESEL,1950,241,12.4')

  await page.getByRole('button', { name: 'Trimestre', exact: true }).click()
  await expect(page.getByText('AGO', { exact: true })).toBeVisible()
  const [quarter] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportar CSV' }).click()])
  expect(quarter.suggestedFilename()).toBe('reporte-sostenibilidad-quarter-agosto-octubre-2026.csv')
  expect(await readFile((await quarter.path())!, 'utf8')).toContain('CO2 emitido,8790,kg')
})

test('el gráfico cambia de escala con el periodo y las barras siguen dentro del lienzo', async ({ page }) => {
  await page.goto(PAGE)
  await expect(page.locator('.eco-chart rect.bar')).toHaveCount(4)
  for (const [period, bars] of [['Semana', 7], ['Trimestre', 3], ['Mes', 4]] as const) {
    await page.getByRole('button', { name: period, exact: true }).click()
    await expect(page.locator('.eco-chart rect.bar')).toHaveCount(bars)
    const fits = await page.locator('.eco-chart').evaluate(svg => {
      const box = svg.getBoundingClientRect()
      return [...svg.querySelectorAll('rect')].every(rect => {
        const r = rect.getBoundingClientRect()
        return r.top >= box.top - 1 && r.bottom <= box.bottom + 1 && r.left >= box.left - 1 && r.right <= box.right + 1
      })
    })
    expect(fits, period).toBe(true)
  }
})

test.describe('390 px', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('el reporte cabe en pantalla sin desbordar la página', async ({ page }) => {
    await page.goto(PAGE)
    await expect(page.getByText('SEM 4', { exact: true })).toBeVisible()
    const size = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, content: document.documentElement.scrollWidth }))
    expect(size.viewport).toBe(390)
    expect(size.content).toBeLessThanOrEqual(size.viewport)
  })
})
