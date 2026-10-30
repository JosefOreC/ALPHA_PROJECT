import { test, expect } from '@playwright/test'
import axe from 'axe-core'

// Evaluación automática WCAG 2.2 AA (axe-core) sobre las páginas de prueba que montan las vistas.
const PAGES: Record<string, string[]> = {
  escritorio: ['/tests/ui/sostenibilidad.html', '/tests/ui/map.html', '/tests/ui/demo.html'],
  'movil-390': ['/tests/ui/driver.html'],
}
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

for (const [project, urls] of Object.entries(PAGES)) {
  for (const url of urls) {
    test(`${url}: sin incumplimientos WCAG 2.2 AA (${project})`, async ({ page }, info) => {
      test.skip(info.project.name !== project, 'solo en su proyecto')
      await page.goto(url)
      await page.waitForTimeout(1000)
      await page.addScriptTag({ content: axe.source })
      const results = await page.evaluate(tags => (window as unknown as { axe: typeof axe }).axe.run(document, { runOnly: { type: 'tag', values: tags } }), TAGS)
      // WCAG 2.5.8: los pines del mapa pueden quedar a menos de 24 px entre sí cuando dos puntos casi coinciden.
      // Se aplica la excepción «Equivalente»: cada pedido y cada camión también se eligen fuera del mapa (prueba siguiente).
      const isPin = (html: string, target: string) => /eco-map__marker|leaflet-marker-icon/.test(html + target)
      const violations = results.violations
        .map(rule => ({ id: rule.id, nodes: rule.nodes.filter(node => !(rule.id === 'target-size' && isPin(node.html, node.target.join(' ')))).map(node => node.target.join(' ')) }))
        .filter(rule => rule.nodes.length > 0)
      expect(violations).toEqual([])
    })
  }
}

test('cada pin del mapa tiene su equivalente fuera del mapa (excepción «Equivalente» de WCAG 2.5.8)', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio', 'solo en escritorio')
  await page.goto('/tests/ui/map.html')
  await page.waitForTimeout(1000)
  const missing = await page.evaluate(() => {
    const pins = [...document.querySelectorAll('.leaflet-marker-icon[title^="PED-"], .leaflet-marker-icon[title^="Camión "]')]
    const outside = [...document.querySelectorAll('body *')]
      .filter(el => !el.closest('.leaflet-container') && el.children.length === 0)
      .map(el => el.textContent ?? '')
      .join(' ')
    return pins.map(pin => (pin.getAttribute('title') ?? '').split(' · ')[0].replace('Camión ', '')).filter(id => !outside.includes(id))
  })
  expect(missing).toEqual([])
})
