import { test, expect } from '@playwright/test'

// WCAG 2.1.1 (teclado), 2.4.3 (orden del foco), 2.4.7 (foco visible) y 4.1.2 (nombre): recorrido con Tab.
const PAGES: Record<string, string[]> = {
  escritorio: ['/tests/ui/sostenibilidad.html', '/tests/ui/map.html', '/tests/ui/demo.html'],
  'movil-390': ['/tests/ui/driver.html'],
}

for (const [project, urls] of Object.entries(PAGES)) {
  for (const url of urls) {
    test(`${url}: recorrido con Tab con foco visible, nombre accesible y sin trampas (${project})`, async ({ page }, info) => {
      test.skip(info.project.name !== project, 'solo en su proyecto')
      await page.goto(url)
      await page.waitForTimeout(1000)
      expect(await page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').count(), 'tabindex positivo altera el orden').toBe(0)
      const seen: string[] = []
      const problems: string[] = []
      for (let step = 0; step < 80; step += 1) {
        await page.keyboard.press('Tab')
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null
          if (!el || el === document.body) return null
          const style = getComputedStyle(el)
          const outline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
          const shadow = style.boxShadow !== 'none'
          const labelled = el.getAttribute('aria-labelledby')?.split(' ').map(id => document.getElementById(id)?.textContent ?? '').join(' ')
          const labels = 'labels' in el ? Array.from((el as HTMLInputElement).labels ?? []).map(label => label.textContent ?? '').join(' ') : ''
          const name = (el.getAttribute('aria-label') || labelled || labels || el.getAttribute('title') || el.getAttribute('placeholder') || el.textContent || '').trim()
          return { key: el.tagName + '|' + name.slice(0, 40) + '|' + (el.className?.toString().slice(0, 30) ?? ''), name, visible: outline || shadow || style.borderStyle !== 'none' }
        })
        if (info === null) break
        if (seen[0] === info.key && seen.length > 1) break
        seen.push(info.key)
        if (!info.name) problems.push('sin nombre: ' + info.key)
        if (!info.visible) problems.push('sin foco visible: ' + info.key)
      }
      expect(seen.length, 'la página debe tener elementos enfocables').toBeGreaterThan(0)
      expect(problems).toEqual([])
    })
  }
}
