import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // El backend FastAPI en desarrollo se usa con proxy.
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Las pruebas de interfaz escriben con userEvent y, con todos los archivos en paralelo, pueden tardar más de 5 s.
    testTimeout: 15_000,
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
