import { defineConfig } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 5178)
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report/ui', open: 'never' }]],
  outputDir: '.test-deps/playwright-results',
  use: {
    baseURL,
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'escritorio', testMatch: ['simulation.spec.ts', 'components.spec.ts', 'map.spec.ts', 'sostenibilidad.spec.ts', 'roles.spec.ts', 'login.spec.ts', 'accesibilidad.spec.ts'], use: { viewport: { width: 1280, height: 900 } } },
    { name: 'movil-390', testMatch: ['simulation.spec.ts', 'mobile.spec.ts', 'driver.spec.ts', 'login.spec.ts', 'accesibilidad.spec.ts'], use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: `node node_modules/vite/bin/vite.js --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: false,
    // API interceptada por cada prueba; no depende de una sesión ni un backend.
    env: { VITE_API_URL: '' },
  },
})
