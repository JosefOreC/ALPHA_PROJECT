# Dashboard alineado con los objetivos del proyecto

[Volver al Sprint 4](../../README.md) · [Guía del frontend](../../../../../src/frontend/README.md)

## Diseño y alcance

Actualización del 20/11/2026. La vista conserva los datos de la API autenticada, sus permisos y el filtro de distrito. Prioriza puntualidad, distancia planificada, intensidad de emisiones y combustible equivalente; el balance presenta pedidos por estado y comparación de CO₂ con la línea base registrada. Las animaciones de entrada, transición y hover respetan movimiento reducido.

El panel desplegable «Objetivos del proyecto» corresponde a los ocho indicadores de la [visión del producto](../../../../01%20Inicio/03.%20Declaraci%C3%B3n%20de%20la%20visi%C3%B3n%20V_1_0_0.md). El tiempo de generación de rutas se muestra con la medición real que se guarda al aprobar cada propuesta (última, máxima y cuántas de las últimas 20 aprobaciones quedaron dentro de 45 s); mientras no exista una aprobación con tiempo medido, el indicador sigue sin valor. El dashboard no atribuye valores a la reoptimización (el producto aún no la ejecuta), al ahorro monetario, a la disponibilidad histórica ni a la evaluación de calidad cuando no existe una fuente de medición. La meta de puntualidad se obtiene de la API.

## Métricas y significado

| Indicador | Cálculo o fuente | Interpretación |
|---|---|---|
| Entregas a tiempo | Entregas dentro de ventana / entregas evaluadas; valor y meta del resumen. | No se divide entre todos los pedidos del día. |
| Distancia de la flota | `fleetDistanceKm` del resumen. | Kilómetros planificados, no telemetría de kilómetros efectivamente recorridos. |
| Intensidad de emisiones | CO₂ estimado / distancia planificada, en kg CO₂/km. | Sin distancia se muestra ausencia de dato, no una división por cero. |
| Combustible equivalente | Diferencia de CO₂ / factor de diésel, proporcionada por insights. | Equivalente ambiental estimado; no es una medición directa de litros consumidos ni ahorro monetario. |
| CO₂ evitado | Comparación con `co2_base_kg` de las rutas, según la API. | Se presenta como línea base registrada; no se supone que representa siempre una ruta sin optimizar. Si el resultado es negativo, la vista indica emisiones adicionales. |

El resumen y los insights se consultan cada 60 segundos de forma predeterminada. «Actualizar» recarga ambas fuentes. Al cambiar de distrito se descartan los insights anteriores y se limpia la selección del mapa. El mapa conserva la vista general, expresamente identificada cuando el filtro está activo; los indicadores y pedidos en riesgo corresponden al distrito seleccionado.

## Capturas

- [Escritorio, 1280 × 900](dashboard-escritorio.png).
- [Móvil, 390 × 844](dashboard-movil-390.png).
- [Dashboard integrado con PostgreSQL](dashboard-integrado.png).

Las dos primeras capturas usan una entrada Vite exclusiva de pruebas con datos ficticios, sin backend. La tercera procede del E2E autenticado con FastAPI y PostgreSQL/PostGIS temporales, también con datos sintéticos.

## Verificación

- Dos casos de navegador, escritorio y móvil: filtros, actualización, apertura de objetivos, ausencia de desbordamiento y animaciones desactivadas con movimiento reducido.
- Axe-core: cero infracciones detectadas en las reglas WCAG A/AA ejecutadas sobre la vista. No se presenta como certificación manual completa.
- Tres casos E2E de dashboard, uno por motor, contrastan la distancia visible con la API y comprueban el filtro y la actualización con datos reales de la base temporal.
- Backend integrado: 534 pruebas y 36 subpruebas aprobadas. Sin omisiones.
- La primera serie integrada aprobó 14/15; falló el umbral de salud de Chromium por el pico local intermitente ya documentado. Los tres casos específicos del dashboard aprobaron. La repetición aprobó 15/15 con los mismos umbrales. [Primera serie](e2e-primera-serie.json) · [Repetición](e2e-repeticion.json).
- [Recibo inicial](recibo-primera-serie.json) y [recibo de repetición](recibo-repeticion.json): bases y roles temporales eliminados. No se inició Docker local ni se desplegó en Render.

Los reportes completos de la sesión se generan en `reports/`, `src/frontend/coverage/` y `src/frontend/playwright-report/`. Los archivos conservados aquí tienen [hashes SHA-256](sha256.json).

[Volver al Sprint 4](../../README.md)
