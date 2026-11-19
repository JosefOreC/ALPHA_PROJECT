# Análisis de pruebas E2E y monitoreo con Playwright

**Nombre del Proyecto:** EcoLogística Lima – Optimizador de Rutas Sostenibles para DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo

## 1. Configuración del entorno de pruebas

### 1.1 Estructura de carpetas

Las especificaciones de interfaz residen en `src/frontend/tests/ui/`, declarado en la configuración mediante `testDir: ./tests/ui`. El directorio contiene ocho especificaciones (`accesibilidad.spec.ts`, `components.spec.ts`, `driver.spec.ts`, `login.spec.ts`, `map.spec.ts`, `mobile.spec.ts`, `roles.spec.ts` y `sostenibilidad.spec.ts`), los arneses y puntos de entrada HTML correspondientes (`DriverHarness.tsx`, `demo.html`, `demo.tsx`, `driver.html`, `driver.tsx`, `map.html`, `map.tsx`, `sostenibilidad.html`, `sostenibilidad.tsx`) y el módulo de datos de prueba `fixtures.ts`. Los artefactos de salida se escriben en `outputDir: .test-deps/playwright-results`.

### 1.2 Navegadores evaluados

La configuración vigente declara dos proyectos sobre Chromium con canal `msedge`:

| Proyecto | Especificaciones | Viewport |
|---|---|---|
| `escritorio` | `components`, `map`, `sostenibilidad`, `roles`, `login`, `accesibilidad` | 1280 × 900 |
| `movil-390` | `mobile`, `driver`, `login`, `accesibilidad` | 390 × 844 |

El canal del navegador puede cambiarse mediante la variable de entorno `PLAYWRIGHT_CHANNEL`. La ejecución de referencia para este informe comprende los motores Chromium, Firefox y WebKit con el reporter HTML, conforme al criterio de calificación.

### 1.3 Configuración de playwright.config.ts

Valores vigentes en `src/frontend/playwright.config.ts`:

| Parámetro | Valor |
|---|---|
| `testDir` | `./tests/ui` |
| `fullyParallel` | `false` |
| `workers` | `1` |
| `retries` | `0` |
| `reporter` | `list` |
| `outputDir` | `.test-deps/playwright-results` |
| `baseURL` | `http://127.0.0.1:5178` |
| `browserName` / `channel` | `chromium` / `msedge` (variable `PLAYWRIGHT_CHANNEL`) |
| `headless` | `true` |
| `screenshot` | `only-on-failure` |
| `trace` | `off` |

El servidor de pruebas se inicia con `npm run dev -- --host 127.0.0.1 --port 5178 --strictPort` y `reuseExistingServer: false`. La variable `VITE_API_URL` se fija en vacío: cada prueba intercepta la API, por lo que la ejecución no depende de una sesión ni de un backend en marcha.

El comando de ejecución es `npm run test:ui`, que compila las especificaciones con `tsc -p tsconfig.ui.json` y luego invoca `playwright test`. La versión instalada es `@playwright/test` 1.63.0, declarada en `src/frontend/package.json`.

## 2. Pruebas End-to-End

### 2.1 Casos críticos

Esta sección registra los flujos críticos evaluados sobre el sistema desplegado: inicio de sesión, registro de pedidos, generación y aprobación de rutas, vista del conductor, dashboard y exportación del reporte de sostenibilidad, con la especificación de `tests/ui` que cubre cada flujo.

### 2.2 Código relevante

Esta sección reproduce los fragmentos de las especificaciones que implementan los casos críticos de 2.1, con la ruta del archivo y el rango de líneas citado.

### 2.3 Resultados de ejecución

Ejecución de referencia contra el entorno desplegado, con los tres motores y el reporter HTML:

| Navegador | Total | Aprobadas | Fallidas | Tasa de éxito |
|---|---|---|---|---|

## 3. Monitoreo de rendimiento

### 3.1 Web Vitals (TTFB, FCP, LCP)

Las métricas se capturan con la API `PerformanceObserver` del navegador sobre las páginas evaluadas del entorno desplegado, mediante el comando `npm run test:ui`.

### 3.2 Tiempos de respuesta de la API

Los tiempos se miden sobre las peticiones reales del entorno desplegado, registradas por Playwright durante los flujos de 2.1.

| Página o endpoint | TTFB (ms) | FCP (ms) | LCP (ms) | Respuesta API (ms) | ¿Menor de 500 ms? |
|---|---|---|---|---|---|

## 4. Disponibilidad y resiliencia

### 4.1 Códigos de estado HTTP

Esta sección registra los códigos de estado observados en las rutas críticas del entorno desplegado durante la ejecución de referencia.

### 4.2 Manejo de errores de red

Esta sección documenta el comportamiento de la interfaz ante fallos de red inducidos con la interceptación de rutas de Playwright (`page.route`), incluyendo mensajes visibles y estado de recuperación.

### 4.3 Uptime del entorno desplegado

Esta sección registra el método y la ventana de medición de disponibilidad del entorno desplegado, con las comprobaciones realizadas y su resultado.

### 4.4 Reportes HTML

Esta sección enlaza los reportes HTML generados por ejecuciones (`npx playwright show-report`) y describe la estructura de salida configurada en `.test-deps/playwright-results`.

## 5. Conclusiones

Esta sección sintetiza el resultado de la ejecución de referencia: tasa de éxito por navegador, cumplimiento del umbral de 500 ms en las métricas de la sección 3, disponibilidad observada en la sección 4 y las mejoras derivadas de los hallazgos.

## Control de versiones del documento

| Versión | Fecha | Autoría / cambio |
|---|---|---|
| V_1_0_0 | 19/11/2026 | Rojas Camayo, Valentino Jhan Pierre. Estructura del informe y configuración vigente del entorno de pruebas. |

**Versión:** V_1_0_0 · 19/11/2026 · Elaborado por: Rojas Camayo, Valentino Jhan Pierre.

[← Volver al README principal](../../../README.md)
