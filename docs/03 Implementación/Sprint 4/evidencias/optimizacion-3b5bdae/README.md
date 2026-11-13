# Evidencias de optimización — Sprint 4

**Proyecto:** EcoLogística Lima — DistriRápido S.A.C.

**Líder del Proyecto:** Ore Campos, Josef Pablo.

**Autoría:** ejecución e implementación asistidas por Codex a solicitud del usuario; revisión independiente pendiente.

**Índice actualizado:** 2026-11-12T22:17:22-05:00, America/Lima (UTC−05:00).

**Rama:** `refactor/mern`.

**Antes:** `3b5bdae3930856101e8f8d7955813bc9ddaa9619`. **Implementación:** `9f953d6acc79d569d3896ab1e2a161d8321b3720`.

## Procedencia y resultados

Los JSON/TXT conservan sus fechas, comandos, códigos de salida y huellas originales. Las suites frontend, navegador y build se ejecutaron antes del commit sobre el código que se incorporó en él; el backend y su umbral se verificaron nuevamente sobre el commit de implementación. El [manifiesto](procedencia.json) registra las huellas de los artefactos y comprueba que el código del producto coincide con ese commit. No se reescribió el HEAD de los recibos anteriores.

El archivo .gitattributes de esta carpeta conserva los bytes de JSON, HTML, TXT y JPG sin conversión de fin de línea de Git. Los espacios originales de los informes y logs se preservan para verificar sus SHA-256; esta excepción se limita a los artefactos, sin afectar las reglas del código ni de Markdown.

La carpeta se llama optimizacion-3b5bdae por el punto de comparación anterior. No representa un despliegue en producción. Se usaron datos ficticios y una instancia PostgreSQL/PostGIS aislada, sin cargar la configuración ni modificar la base del usuario.

| Control | Resultado | Artefacto principal |
|---|---|---|
| Lighthouse móvil | Medianas de tres ejecuciones por página y estado; 12 informes sin error de ejecución. Pedidos: 85 → 99 puntos, 540336 → 119920 bytes (−77,81 %). | [Comparación calculada](comparacion.json), [ejecutor de comparación](comparar_resultados.py). |
| HTTP real | Cuerpo de 100 pedidos: 36430 bytes sin compresión, 1232 con gzip; ETag produce 304 y cuerpo vacío. Cinco calentamientos y 30 muestras por modo. | [Antes](api-before.json), [después](api-after.json). |
| PostgreSQL real | 1050 pedidos sintéticos; resumen de 5 a 2 lecturas SQL, planes con ANALYZE/BUFFERS; índice aditivo. Una muestra de plan no es una prueba estadística de latencia. | [Planes](postgres-planes.json), [ejecutor](medir_postgres.py), [3 pruebas aprobadas](integracion-postgres.txt). |
| Frontend | 469 Vitest y 11 Node aprobadas. Cobertura: líneas 97,19 %, ramas 90,04 %. | [Recibo](frontend-cobertura.json), [salida](frontend-cobertura.txt), [resumen de cobertura](frontend-cobertura-resumen.json). |
| Backend | 425 pruebas y 36 subpruebas aprobadas; 7 omitidas. Líneas 93,93 %, ramas 90,27 %; umbral 90 % aprobado. Las tres pruebas de vistas se ejecutaron aparte sobre PostgreSQL. | [Recibo](backend-cobertura.json), [salida](backend-cobertura.txt), [cobertura](backend-cobertura-resumen.json), [umbral](backend-umbral.txt). |
| Interfaz | 54 aprobadas, 5 omitidas por distribución de viewport; 0 fallidas. Incluye axe-core. | [Recibo](interfaz-pruebas.json), [salida](interfaz-pruebas.txt). |
| Build/lint | Ambos códigos 0; advertencia de tamaño del motor de mapa, cargado bajo demanda. | [Build](compilacion.txt), [lint](lint.txt). |
| Dependencias | Auditorías finales: 0 vulnerabilidades conocidas. Se conserva el hallazgo inicial y se sincronizaron pip/certifi con el lock corregido. | [npm](npm-audit.json), [pip final](pip-audit.json), [pip inicial](pip-audit-inicial.json). |
| Documentación | Comando, hora, código de salida y SHA de las comprobaciones finales. | [Recibo de enlaces](documentacion.json), [salida de enlaces](documentacion.txt), [recibo Markdown](markdown.json), [salida Markdown](markdown.txt). |

El ahorro energético y de CO₂e es una estimación SWDM v4 a partir de bytes, no electricidad medida. El escenario de 10000 visitas/año es hipotético. Los supuestos, fuentes y cálculos están en el documento 03 del [Sprint 4](../../README.md).

## Informes originales Lighthouse

Se probaron login y pedidos con build de producción, FastAPI real y 150 pedidos ficticios en memoria. Lighthouse 13.6.0, Edge 157, perfil móvil y throttling simulado. Se bloquearon por igual fuentes externas y la inyección de recursos kaspersky-labs.com; no se desactivó el antivirus. Los logs del servidor vacíos significan que no emitió mensajes durante la captura.

| Estado | Página | Ejecución 1 | Ejecución 2 | Ejecución 3 |
|---|---|---|---|---|
| before | login | [HTML](before-login-1.html) / [JSON](before-login-1.json) | [HTML](before-login-2.html) / [JSON](before-login-2.json) | [HTML](before-login-3.html) / [JSON](before-login-3.json) |
| before | pedidos | [HTML](before-pedidos-1.html) / [JSON](before-pedidos-1.json) | [HTML](before-pedidos-2.html) / [JSON](before-pedidos-2.json) | [HTML](before-pedidos-3.html) / [JSON](before-pedidos-3.json) |
| after | login | [HTML](after-login-1.html) / [JSON](after-login-1.json) | [HTML](after-login-2.html) / [JSON](after-login-2.json) | [HTML](after-login-3.html) / [JSON](after-login-3.json) |
| after | pedidos | [HTML](after-pedidos-1.html) / [JSON](after-pedidos-1.json) | [HTML](after-pedidos-2.html) / [JSON](after-pedidos-2.json) | [HTML](after-pedidos-3.html) / [JSON](after-pedidos-3.json) |

- Resúmenes: [antes](before-summary.json) y [después](after-summary.json).
- Logs HTTP: [antes](before-server.txt) y [después](after-server.txt).
- Capturas extraídas sin editar del final-screenshot de la ejecución 1: [login antes](before-login.jpg), [login después](after-login.jpg), [pedidos antes](before-pedidos.jpg), [pedidos después](after-pedidos.jpg).
- Metadatos adicionales: [build](compilacion.json), [lint](lint.json), [umbral backend](backend-umbral.json).

## Reproducción

Desde la raíz, con las dependencias locales instaladas. Guardar una copia de esta carpeta antes de repetir: los comandos sustituyen los artefactos de su tarea.

```powershell
$evidence = 'docs/03 Implementación/Sprint 4/evidencias/optimizacion-3b5bdae'
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' quality $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' coverage $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' backend-coverage $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' python-gate $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' ui $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' markdown $evidence
.\.venv\Scripts\python.exe 'docs/03 Implementación/Sprint 4/evidencias/verificar_corte.py' docs $evidence
```

El [ejecutor de controles](../verificar_corte.py) desactiva la integración real por defecto. Para repetir Lighthouse se necesitan Lighthouse 13.6.0 y chrome-launcher en .test-deps/green-it, Edge en la ruta indicada en el script y dos builds separados. Extraer src/backend y src/frontend del commit 3b5bdae mediante git archive a .test-deps/green-it/before, instalar con npm ci y compilar allí. Conservar ese build; compilar el actual con npm run build. Ejecutar secuencialmente:

```powershell
node scripts/measure_green_it.mjs before .test-deps/green-it/before/src/frontend/dist $evidence
node scripts/measure_green_it.mjs after src/frontend/dist $evidence
.\.venv\Scripts\python.exe scripts/measure_api_http.py before "$evidence/api-before.json"
.\.venv\Scripts\python.exe scripts/measure_api_http.py after "$evidence/api-after.json"
.\.venv\Scripts\python.exe "$evidence/comparar_resultados.py"
```

Los ejecutores [Lighthouse](../../../../../scripts/measure_green_it.mjs), [HTTP](../../../../../scripts/measure_api_http.py) y [fixture](../../../../../scripts/green_it_fixture.py) usan exclusivamente localhost:5189. No deben ejecutarse simultáneamente. El archivo medir_postgres.py requiere la instancia ficticia local en 55439 y su esquema; no se debe redirigir a una base real. Aplica la migración aditiva 005 únicamente al entorno de prueba, ejecuta ANALYZE y restaura mediante rollback el índice retirado temporalmente para comparar planes.

Una revisión manual WCAG completa, una certificación o la aceptación académica no se deducen de estos controles automáticos. No se recibió la rúbrica original con ponderaciones.

[← Volver al índice correspondiente](../README.md)
