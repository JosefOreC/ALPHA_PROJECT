import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/ui',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: '.test-deps/playwright-results',
  use: {
    baseURL: 'http://127.0.0.1:5178',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'msedge',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'off',
  },
  projects: [
    { name: 'escritorio', testMatch: ['components.spec.ts', 'map.spec.ts', 'sostenibilidad.spec.ts', 'roles.spec.ts'], use: { viewport: { width: 1280, height: 900 } } },
    { name: 'movil-390', testMatch: ['mobile.spec.ts', 'driver.spec.ts'], use: { viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5178 --strictPort',
    url: 'http://127.0.0.1:5178',
    reuseExistingServer: false,
    // API interceptada por cada prueba; no depende de una sesión ni un backend.
    env: { VITE_API_URL: '' },
  },
})
