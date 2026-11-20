import { test, expect } from '@playwright/test'
import axe from 'axe-core'

test('indicadores, filtro, actualización y objetivos funcionan sin desbordar', async ({ page }, info) => {
  await page.goto('/tests/ui/dashboard.html')
  await expect(page.getByRole('article', { name: 'Entregas a tiempo' })).toContainText('92,7')
  await expect(page.getByRole('article', { name: 'Combustible equivalente' })).toContainText('Ahorro equivalente en diésel')
  await page.getByLabel('Distrito', { exact: true }).selectOption('150103')
  await expect(page.getByText('Indicadores actualizados para Ate.')).toBeAttached()
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Actualizar', exact: true })).toBeEnabled()
  await page.getByText('Objetivos del proyecto', { exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Ahorro económico', exact: true })).toBeVisible()
  await expect(page.getByText('Sin costos operativos registrados')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await expect(page.locator('.eco-dash-metric').first()).toHaveCSS('animation-name', 'none')
  await page.addScriptTag({ content: axe.source })
  const violations = await page.evaluate(() => (window as unknown as { axe: typeof axe }).axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  }).then(results => results.violations.map(rule => ({ id: rule.id, targets: rule.nodes.map(node => node.target) }))))
  expect(violations).toEqual([])
  await page.getByText('Objetivos del proyecto', { exact: true }).click()
  await page.screenshot({ path: `../../reports/dashboard-${info.project.name}.png`, fullPage: true })
})
